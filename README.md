# FocusFlow 🌸📺🍒
### Aesthetic Study Timer & Habit Tracker for Students

FocusFlow is a premium study companion that brings together the calming atmosphere of scenic study spaces, the nostalgic charm of retro CRT & pixel art, and the clean utility of a modern editorial productivity dashboard.

---

## 🎨 Visual Identity & Reference Inspirations

1. **Scenic Cherry Blossom Timer**: Translucent glass-morphism pill controls layered over a breathtaking twilight cherry blossom lake, with high-legibility countdown digits and rounded controls.
2. **Retro CRT TV & Pixel Art**: Vintage monitor with rainbow phosphor test-patterns, pixelated smiley face celebration animations, custom pixel-art cherries, and 8-bit synthesized celebratory fanfares.
3. **Editorial Minimalist Grid**: Warm ivory background (`#F7F5F0`), fine subtle grid paper patterns, dark espresso typography (`#302729`), cherry-red accents (`#E53945`), and sage-green highlights (`#92AA7B`).

---

## 🎯 Answering the 5 Core Student Questions

Every part of the dashboard answers five essential questions from real session logs:
1. **How long have I studied today?** — Tracked down to the exact second in the header, dashboard metrics, and history.
2. **Which subject did I study?** — Color-coded subject badges and interactive breakdown.
3. **How much focused study time have I completed this week?** — 7-day interactive bar chart with daily averages and comparison to last week.
4. **Am I achieving my daily study goal?** — Live goal progress rings and progress bars (`2h 15m / 3h 00m`).
5. **How consistent am I with my study habits?** — Monthly calendar heatmap with study streaks and trend indicators.

---

## ⚡ Key Features

- **Accurate Timestamp Timer Engine**:
  - Uses `Date.now()` and target end-timestamp calculations rather than naive `setInterval` countdowns.
  - Recalculates accurately when waking from sleep or returning to backgrounded tabs.
  - Pausing preserves remaining duration; resuming sets a fresh target end time.
  - Resilient to page reloads and tab closes.
- **5 Selectable Aesthetic Themes**:
  - 🌸 **Cherry Blossom**: Scenic twilight lake with cherry blossoms.
  - 🍒 **Pixel Cherry**: Warm ivory minimalist grid with twin pixel cherries.
  - 📺 **Retro CRT**: Dark monitor casing, rainbow scanlines, and pixelated smiley.
  - 📐 **Paper & Grid**: Editorial graph paper layout with generous whitespace.
  - 🌙 **Midnight Focus**: Minimalist dark mode for late-night focus.
- **Distraction-Free Focus Mode**: Fullscreen mode enlarging countdown digits, hiding all distractions, and rotating subtle motivational quotes.
- **Synthesized Web Audio API**: Zero external audio dependencies; provides chiptune fanfare, meditative bell chimes, and soft wooden click feedback.
- **Subject Management**: Color-coded courses (Math, Science, English, Computer, etc.), weekly goal progress, total study time, and session counts.
- **Task Milestones**: Create tasks, set target study minutes, associate focus sessions, and track completion.
- **Study Analytics**: Real calculations of today's focused time, 7-day weekly bar chart, monthly calendar heatmap, streaks, and trend metrics.
- **Session History & CSV Export**: Inspect start/end times, filter by subject or date range, edit records, delete entries, and export complete audit logs to `.csv`.
- **Data Portability**: Complete backup JSON export and import with schema validation, plus a safe two-step data reset modal.

---

## ⌨️ Keyboard Shortcuts

- <kbd>Space</kbd>: Start / Pause / Resume Timer
- <kbd>R</kbd>: Reset Timer (prompts to save if >60s studied)
- <kbd>Esc</kbd>: Exit Focus Mode / Close Modals

---

## 🚀 Running the Project

```bash
# 1. Install dependencies
npm install

# 2. Start the development server
npm run dev

# 3. Build for production
npm run build
```
