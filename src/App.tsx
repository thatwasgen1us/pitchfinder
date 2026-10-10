import { useRef, useState, useEffect } from "react";
import * as Tone from "tone";
import { usePitch } from "./usePitch";

const NOTE_PATTERN = [
  { name: "C", isBlack: false },
  { name: "C#", isBlack: true },
  { name: "D", isBlack: false },
  { name: "D#", isBlack: true },
  { name: "E", isBlack: false },
  { name: "F", isBlack: false },
  { name: "F#", isBlack: true },
  { name: "G", isBlack: false },
  { name: "G#", isBlack: true },
  { name: "A", isBlack: false },
  { name: "A#", isBlack: true },
  { name: "B", isBlack: false },
];

const ALL_KEYS = [2, 3, 4, 5].flatMap((octave) =>
  NOTE_PATTERN.map((note) => ({
    fullNote: `${note.name}${octave}`,
    name: note.name,
    isBlack: note.isBlack,
    octave,
  })),
);

const CODE_MAP: Record<string, string> = {
  KeyA: "C3",
  KeyS: "D3",
  KeyD: "E3",
  KeyF: "F3",
  KeyG: "G3",
  KeyH: "A3",
  KeyJ: "B3",
  KeyW: "C#3",
  KeyE: "D#3",
  KeyT: "F#3",
  KeyY: "G#3",
  KeyU: "A#3",
  KeyK: "C4",
  KeyL: "D4",
  Semicolon: "E4",
  KeyO: "C#4",
  KeyP: "D#4",
};

type Clef = "bass" | "treble";
type NotePosition = { line: number; clef: Clef };

const NOTE_POSITIONS: Record<string, NotePosition> = {
  C2: { line: 0, clef: "bass" },
  "C#2": { line: 0, clef: "bass" },
  D2: { line: 0.5, clef: "bass" },
  "D#2": { line: 0.5, clef: "bass" },
  E2: { line: 1, clef: "bass" },
  F2: { line: 1.5, clef: "bass" },
  "F#2": { line: 1.5, clef: "bass" },
  G2: { line: 2, clef: "bass" },
  "G#2": { line: 2, clef: "bass" },
  A2: { line: 2.5, clef: "bass" },
  "A#2": { line: 2.5, clef: "bass" },
  B2: { line: 3, clef: "bass" },
  C3: { line: 3.5, clef: "bass" },
  "C#3": { line: 3.5, clef: "bass" },
  D3: { line: 4, clef: "bass" },
  "D#3": { line: 4, clef: "bass" },
  E3: { line: 4.5, clef: "bass" },
  F3: { line: 5, clef: "bass" },
  "F#3": { line: 5, clef: "bass" },
  G3: { line: 5.5, clef: "bass" },
  "G#3": { line: 5.5, clef: "bass" },
  A3: { line: 6, clef: "bass" },
  "A#3": { line: 6, clef: "bass" },
  B3: { line: 6.5, clef: "bass" },

  C4: { line: 0, clef: "treble" },
  "C#4": { line: 0, clef: "treble" },
  D4: { line: 0.5, clef: "treble" },
  "D#4": { line: 0.5, clef: "treble" },
  E4: { line: 1, clef: "treble" },
  F4: { line: 1.5, clef: "treble" },
  "F#4": { line: 1.5, clef: "treble" },
  G4: { line: 2, clef: "treble" },
  "G#4": { line: 2, clef: "treble" },
  A4: { line: 2.5, clef: "treble" },
  "A#4": { line: 2.5, clef: "treble" },
  B4: { line: 3, clef: "treble" },
  C5: { line: 3.5, clef: "treble" },
  "C#5": { line: 3.5, clef: "treble" },
  D5: { line: 4, clef: "treble" },
  "D#5": { line: 4, clef: "treble" },
  E5: { line: 4.5, clef: "treble" },
  F5: { line: 5, clef: "treble" },
  "F#5": { line: 5, clef: "treble" },
  G5: { line: 5.5, clef: "treble" },
  "G#5": { line: 5.5, clef: "treble" },
  A5: { line: 6, clef: "treble" },
  "A#5": { line: 6, clef: "treble" },
  B5: { line: 6.5, clef: "treble" },
};

// Русские названия нот
const RU_NOTE_NAMES: Record<string, string> = {
  C: "До",
  "C#": "До#",
  D: "Ре",
  "D#": "Ре#",
  E: "Ми",
  F: "Фа",
  "F#": "Фа#",
  G: "Соль",
  "G#": "Соль#",
  A: "Ля",
  "A#": "Ля#",
  B: "Си",
};

const toRussianNote = (fullNote: string): string => {
  const match = fullNote.match(/^([A-G]#?)(\d+)$/);
  if (!match) return fullNote;
  const [, letter, octave] = match;
  const ru = RU_NOTE_NAMES[letter] ?? letter;
  return `${ru}${octave}`;
};

const SAMPLER_URLS = {
  A0: "A0.mp3",
  C1: "C1.mp3",
  "D#1": "Ds1.mp3",
  "F#1": "Fs1.mp3",
  A1: "A1.mp3",
  C2: "C2.mp3",
  "D#2": "Ds2.mp3",
  "F#2": "Fs2.mp3",
  A2: "A2.mp3",
  C3: "C3.mp3",
  "D#3": "Ds3.mp3",
  "F#3": "Fs3.mp3",
  A3: "A3.mp3",
  C4: "C4.mp3",
  "D#4": "Ds4.mp3",
  "F#4": "Fs4.mp3",
  A4: "A4.mp3",
  C5: "C5.mp3",
  "D#5": "Ds5.mp3",
  "F#5": "Fs5.mp3",
  A5: "A5.mp3",
  C6: "C6.mp3",
};

const SAMPLER_BASE_URL = "https://tonejs.github.io/audio/salamander/";
const NOTE_RELEASE = "1s";
const KEYBOARD_NOTE_HIGHLIGHT_MS = 250;

export function App() {
  const { note, frequency, isListening, startListening, stopListening } =
    usePitch();
  const [isSamplerLoaded, setIsSamplerLoaded] = useState(false);
  const [keyboardActiveNotes, setKeyboardActiveNotes] = useState<Set<string>>(
    new Set(),
  );

  const samplerRef = useRef<Tone.Sampler | null>(null);
  const activeKeysRef = useRef<Set<string>>(new Set());
  const timeoutsRef = useRef<Map<string, number>>(new Map());

  const micNote = note !== "-" ? note : null;
  const activeNotes = micNote
    ? [micNote, ...keyboardActiveNotes].filter(
        (n, i, arr) => arr.indexOf(n) === i,
      )
    : [...keyboardActiveNotes];

  useEffect(() => {
    const sampler = new Tone.Sampler({
      urls: SAMPLER_URLS,
      baseUrl: SAMPLER_BASE_URL,
      onload: () => setIsSamplerLoaded(true),
      onerror: (err) => console.error("Sampler load error:", err),
    }).toDestination();

    samplerRef.current = sampler;

    return () => {
      sampler.dispose();
      samplerRef.current = null;
    };
  }, []);

  useEffect(() => {
    const unlock = async () => {
      if (Tone.context.state !== "running") {
        await Tone.start();
      }
      window.removeEventListener("click", unlock);
      window.removeEventListener("keydown", unlock);
    };

    window.addEventListener("click", unlock, { once: true });
    window.addEventListener("keydown", unlock, { once: true });

    return () => {
      window.removeEventListener("click", unlock);
      window.removeEventListener("keydown", unlock);
    };
  }, []);

  useEffect(() => {
    const timeouts = timeoutsRef.current;

    const highlightNote = (targetNote: string) => {
      setKeyboardActiveNotes((prev) => {
        const next = new Set(prev);
        next.add(targetNote);
        return next;
      });

      const existing = timeouts.get(targetNote);
      if (existing !== undefined) {
        window.clearTimeout(existing);
      }

      const timeoutId = window.setTimeout(() => {
        setKeyboardActiveNotes((prev) => {
          const next = new Set(prev);
          next.delete(targetNote);
          return next;
        });
        timeouts.delete(targetNote);
      }, KEYBOARD_NOTE_HIGHLIGHT_MS);

      timeouts.set(targetNote, timeoutId);
    };

    const handleKeyDown = async (e: KeyboardEvent) => {
      if (e.repeat) return;

      const targetNote: string | undefined = CODE_MAP[e.code];
      if (!targetNote || !isSamplerLoaded || !samplerRef.current) return;

      e.preventDefault();

      if (activeKeysRef.current.has(e.code)) return;
      activeKeysRef.current.add(e.code);

      if (Tone.context.state !== "running") {
        await Tone.start();
      }

      highlightNote(targetNote);
      samplerRef.current.triggerAttackRelease(targetNote, NOTE_RELEASE);
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      activeKeysRef.current.delete(e.code);
    };

    window.addEventListener("keydown", handleKeyDown, { capture: true });
    window.addEventListener("keyup", handleKeyUp, { capture: true });

    return () => {
      window.removeEventListener("keydown", handleKeyDown, { capture: true });
      window.removeEventListener("keyup", handleKeyUp, { capture: true });
      timeouts.forEach((id) => window.clearTimeout(id));
      timeouts.clear();
    };
  }, [isSamplerLoaded]);

  const playSound = async (fullNote: string): Promise<void> => {
    if (!isSamplerLoaded || !samplerRef.current) return;
    if (Tone.context.state !== "running") {
      await Tone.start();
    }
    samplerRef.current.triggerAttackRelease(fullNote, NOTE_RELEASE);

    setKeyboardActiveNotes((prev) => {
      const next = new Set(prev);
      next.add(fullNote);
      return next;
    });

    const existing = timeoutsRef.current.get(fullNote);
    if (existing !== undefined) {
      window.clearTimeout(existing);
    }

    const timeoutId = window.setTimeout(() => {
      setKeyboardActiveNotes((prev) => {
        const next = new Set(prev);
        next.delete(fullNote);
        return next;
      });
      timeoutsRef.current.delete(fullNote);
    }, KEYBOARD_NOTE_HIGHLIGHT_MS);

    timeoutsRef.current.set(fullNote, timeoutId);
  };

  const renderNote = (name: string, info: NotePosition, key: string) => {
    const startY = 110;
    const noteY = startY - info.line * 14;
    const hasAccidental = name.includes("#");
    const ruName = toRussianNote(name);

    return (
      <g key={key}>
        {hasAccidental && (
          <text
            x="85"
            y={noteY + 8}
            className="text-2xl fill-amber-400 font-bold"
          >
            ♯
          </text>
        )}
        <ellipse
          cx="110"
          cy={noteY}
          rx="8"
          ry="5.5"
          className="fill-amber-400 animate-pulse drop-shadow-[0_0_8px_rgba(251,191,36,0.8)]"
          transform={`rotate(-20 110 ${noteY})`}
        />
        {info.line <= 0 && (
          <line
            x1="95"
            y1="110"
            x2="125"
            y2="110"
            stroke="#fbbf24"
            strokeWidth="2"
          />
        )}
        <text
          x="132"
          y={noteY + 6}
          className="text-base fill-amber-300 font-bold select-none"
        >
          {ruName}
        </text>
      </g>
    );
  };

  const renderStaff = (notes: string[]) => {
    const bassNotes = notes
      .map((n) => ({ name: n, info: NOTE_POSITIONS[n] }))
      .filter(
        (n): n is { name: string; info: NotePosition } =>
          n.info?.clef === "bass",
      );

    const trebleNotes = notes
      .map((n) => ({ name: n, info: NOTE_POSITIONS[n] }))
      .filter(
        (n): n is { name: string; info: NotePosition } =>
          n.info?.clef === "treble",
      );

    return (
      <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 shadow-inner w-full max-w-xl mb-8 flex justify-around items-center">
        <div className="flex flex-col items-center">
          <span className="text-xs text-slate-500 mb-1 font-semibold">
            Басовый ключ (C2 – B3)
          </span>
          <svg
            width="200"
            height="150"
            className="overflow-visible"
            aria-label="Bass clef staff"
          >
            {[0, 1, 2, 3, 4].map((i) => (
              <line
                key={i}
                x1="10"
                y1={54 + i * 14}
                x2="190"
                y2={54 + i * 14}
                stroke="#475569"
                strokeWidth="2"
              />
            ))}
            <text
              x="15"
              y="94"
              className="text-4xl fill-cyan-500 font-serif select-none font-bold"
            >
              𝄢
            </text>
            {bassNotes.map(({ name, info }) =>
              renderNote(name, info, `bass-${name}`),
            )}
          </svg>
        </div>

        <div className="flex flex-col items-center">
          <span className="text-xs text-slate-500 mb-1 font-semibold">
            Скрипичный ключ (C4 – B5)
          </span>
          <svg
            width="200"
            height="150"
            className="overflow-visible"
            aria-label="Treble clef staff"
          >
            {[0, 1, 2, 3, 4].map((i) => (
              <line
                key={i}
                x1="10"
                y1={54 + i * 14}
                x2="190"
                y2={54 + i * 14}
                stroke="#475569"
                strokeWidth="2"
              />
            ))}
            <text
              x="15"
              y="98"
              className="text-5xl fill-cyan-500 font-serif select-none"
            >
              𝄞
            </text>
            {trebleNotes.map(({ name, info }) =>
              renderNote(name, info, `treble-${name}`),
            )}
          </svg>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-6 select-none">
      <h1 className="text-3xl font-bold mb-2 text-cyan-400 tracking-wide">
        Voice Pitch Tracker & Grand Piano
      </h1>

      <div className="mb-4 text-xs font-mono text-center text-slate-400">
        {isSamplerLoaded ? (
          <span className="text-emerald-400">
            ● Звук: Акустическое пианино готово.
          </span>
        ) : (
          <span className="text-amber-400 animate-pulse">
            ○ Загрузка реальных звуков пианино...
          </span>
        )}
        <span className="block mt-1 text-[11px]">
          Управление ПК: <kbd className="bg-slate-700 px-1 rounded">A</kbd>…
          <kbd className="bg-slate-700 px-1 rounded">J</kbd> (белые),{" "}
          <kbd className="bg-slate-700 px-1 rounded">W</kbd>…
          <kbd className="bg-slate-700 px-1 rounded">U</kbd> (чёрные)
        </span>
      </div>

      {renderStaff(activeNotes)}

      <div className="bg-slate-800 p-6 rounded-2xl shadow-xl w-full max-w-md text-center mb-10 border border-slate-700">
        <div className="text-4xl font-black text-amber-400 h-20 flex flex-col items-center justify-center tracking-wider drop-shadow-[0_0_10px_rgba(251,191,36,0.3)]">
          {activeNotes.length > 0 ? (
            <>
              <div className="text-5xl leading-none">
                {activeNotes.join(" + ")}
              </div>
              <div className="text-lg text-amber-300 mt-2 font-semibold">
                {activeNotes.map(toRussianNote).join(" + ")}
              </div>
            </>
          ) : (
            "-"
          )}
        </div>
        <div className="text-sm text-slate-400 mb-6 font-mono mt-2">
          {frequency > 0 ? `${frequency} Hz` : "Тишина"}
        </div>

        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={isListening ? stopListening : startListening}
          className={`px-6 py-3 rounded-full font-semibold transition-all duration-300 shadow-lg ${
            isListening
              ? "bg-rose-600 hover:bg-rose-500 shadow-rose-900/40"
              : "bg-cyan-600 hover:bg-cyan-500 shadow-cyan-900/40"
          }`}
        >
          {isListening ? "Остановить микрофон" : "Включить микрофон"}
        </button>
      </div>

      <div className="relative flex justify-center">
        {ALL_KEYS.map((key) => {
          if (key.isBlack) return null;
          const isActive = activeNotes.includes(key.fullNote);
          return (
            <button
              type="button"
              key={key.fullNote}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => playSound(key.fullNote)}
              className={`w-10 h-60 rounded-b border border-slate-300 flex flex-col justify-end items-center pb-3 font-bold text-[9px] transition-all duration-100 outline-none ${
                isActive
                  ? "bg-amber-400 text-slate-950 shadow-[0_5px_15px_rgba(251,191,36,0.6)] border-amber-500 translate-y-[2px]"
                  : "bg-white text-slate-700 hover:bg-slate-100"
              }`}
            >
              <span>
                {key.name}
                {key.octave}
              </span>
              <span className="text-[8px] opacity-70">
                {RU_NOTE_NAMES[key.name]}
              </span>
            </button>
          );
        })}

        {(() => {
          let whiteKeyCount = 0;
          return ALL_KEYS.map((key) => {
            if (!key.isBlack) {
              whiteKeyCount++;
              return null;
            }
            const isActive = activeNotes.includes(key.fullNote);
            const leftOffset = whiteKeyCount * 40 + 4;
            return (
              <button
                type="button"
                key={key.fullNote}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => playSound(key.fullNote)}
                style={{ left: `${leftOffset}px` }}
                className={`absolute top-4 w-5 h-36 rounded-b z-10 border border-black transition-all duration-100 outline-none ${
                  isActive
                    ? "bg-amber-400 shadow-[0_5px_10px_rgba(251,191,36,0.8)] border-amber-500"
                    : "bg-slate-800 hover:bg-slate-700"
                }`}
                title={`${key.fullNote} (${toRussianNote(key.fullNote)})`}
                aria-label={`${key.fullNote} ${toRussianNote(key.fullNote)}`}
              />
            );
          });
        })()}
      </div>
    </div>
  );
}
