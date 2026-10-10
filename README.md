# 🎹 Voice Pitch Tracker & Grand Piano

An interactive web app that detects the pitch of your voice in real time, displays the note on a musical staff, and lets you play a virtual piano with your keyboard or mouse — all at the same time.

### 🔗 **[Live Demo →](https://pitchfinder-phi.vercel.app/)**

![React](https://img.shields.io/badge/React-18-blue) ![TypeScript](https://img.shields.io/badge/TypeScript-5-blue) ![Tone.js](https://img.shields.io/badge/Tone.js-14-orange) ![Vite](https://img.shields.io/badge/Vite-5-purple)

---

## ✨ Features

- 🎤 **Voice pitch detection** — sing a note and see it appear on a musical staff (bass and treble clefs).
- 🎹 **Virtual piano** — play with your mouse or computer keyboard (DAW-style layout).
- 🔀 **Simultaneous display** — sing one note and play another; both appear on the staff and light up on the keys.
- 🎼 **English & Russian note names** — see `C4` and `До4` side by side.
- 🔊 **Realistic sound** — Salamander grand piano samples.
- 📊 **Frequency readout** — current detected frequency in Hz.

---

## 🚀 Try It Now

👉 **[https://pitchfinder-phi.vercel.app/](https://pitchfinder-phi.vercel.app/)**

Just open the link, click **"Включить микрофон"** (Enable Microphone), allow mic access, and start singing. You can also play the piano right away with your keyboard — no installation needed.

> ⚠️ The app requires **HTTPS** for microphone access — the Vercel demo already provides that.

---

## 🚀 Quick Start (Local Development)

### Requirements

- **Node.js** 18+ and npm (or pnpm / yarn)
- A modern browser: **Chrome**, **Edge**, **Firefox**, or **Safari**
- A microphone (for voice pitch detection)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/your-username/voice-pitch-tracker.git
cd voice-pitch-tracker

# 2. Install dependencies
npm install

# 3. Start the dev server
npm run dev
