import { useState, useEffect, useRef } from "react";
import * as Pitchfinder from "pitchfinder";
import * as Tone from "tone";

export function usePitch() {
  const [note, setNote] = useState("-");
  const [frequency, setFrequency] = useState(0);
  const [isListening, setIsListening] = useState(false);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const startListening = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });
      streamRef.current = stream;

      const AudioContextClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      const audioCtx = new AudioContextClass();
      audioCtxRef.current = audioCtx;

      if (audioCtx.state === "suspended") {
        await audioCtx.resume();
      }

      const source = audioCtx.createMediaStreamSource(stream);
      analyserRef.current = audioCtx.createAnalyser();
      analyserRef.current.fftSize = 4096;
      source.connect(analyserRef.current);

      const detectorFactory =
        (
          Pitchfinder as unknown as {
            YIN?: (opts: {
              sampleRate: number;
            }) => (data: Float32Array) => number | null;
          }
        ).YIN ||
        (
          Pitchfinder as unknown as {
            PitchDetector?: {
              YIN?: (opts: {
                sampleRate: number;
              }) => (data: Float32Array) => number | null;
            };
          }
        ).PitchDetector?.YIN;
      if (!detectorFactory) {
        throw new Error(
          "Не удалось инициализировать алгоритм YIN из pitchfinder",
        );
      }

      const detectPitch = detectorFactory({
        sampleRate: audioCtx.sampleRate,
      });

      const bufferLength = analyserRef.current.frequencyBinCount;
      const dataArray = new Float32Array(bufferLength);

      const lastNotes: string[] = [];

      const update = () => {
        if (!analyserRef.current) return;

        analyserRef.current.getFloatTimeDomainData(dataArray);

        let rms = 0;
        for (let i = 0; i < dataArray.length; i++) {
          rms += dataArray[i] * dataArray[i];
        }
        rms = Math.sqrt(rms / dataArray.length);

        if (rms < 0.005) {
          setNote("-");
          setFrequency(0);
        } else {
          const pitch = detectPitch(dataArray);

          if (pitch && pitch > 20 && pitch < 3000) {
            setFrequency(Math.round(pitch));

            try {
              const detectedNote = Tone.Frequency(pitch).toNote();

              lastNotes.push(detectedNote);
              if (lastNotes.length > 5) lastNotes.shift();

              const mostFrequentNote = [...lastNotes]
                .sort(
                  (a, b) =>
                    lastNotes.filter((v) => v === a).length -
                    lastNotes.filter((v) => v === b).length,
                )
                .pop();

              if (mostFrequentNote !== undefined) {
                setNote(mostFrequentNote);
              }
            } catch (toneErr) {
              const noteStrings = [
                "C",
                "C#",
                "D",
                "D#",
                "E",
                "F",
                "F#",
                "G",
                "G#",
                "A",
                "A#",
                "B",
              ];
              const formula = 12 * Math.log2(pitch / 440) + 69;
              const noteIndex = Math.round(formula);
              if (!isNaN(noteIndex) && noteIndex > 0) {
                const octave = Math.floor(noteIndex / 12) - 1;
                const noteName = noteStrings[noteIndex % 12];
                setNote(`${noteName}${octave}`);
              }
            }
          }
        }
        animationFrameRef.current = requestAnimationFrame(update);
      };

      setIsListening(true);
      update();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Не удалось запустить микрофон";
      console.error("Подробная ошибка инициализации аудио:", err);
      alert(`Ошибка: ${message}`);
    }
  };

  const stopListening = () => {
    if (animationFrameRef.current !== null)
      cancelAnimationFrame(animationFrameRef.current);
    if (streamRef.current)
      streamRef.current.getTracks().forEach((track) => track.stop());
    if (audioCtxRef.current) audioCtxRef.current.close();
    setIsListening(false);
    setNote("-");
    setFrequency(0);
  };

  useEffect(() => {
    return () => stopListening();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { note, frequency, isListening, startListening, stopListening };
}
