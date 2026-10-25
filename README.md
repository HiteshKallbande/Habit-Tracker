# Habit Tracker 🎯

A sleek, responsive, and distraction-free Habit Tracker web application designed to help you build consistency and achieve your goals one day at a time.

## 🚀 Day 2 Progress & Enhancements

- **Interactive Daily Completion**:
  - Interactive checkboxes / completion buttons next to each habit for marking completion for the current day.
  - Micro-interactions with tactile scale feedback and animated SVG checkmark transitions.
  - Keyboard accessible (`role="checkbox"`, `aria-checked`, Enter/Space activation) with screen reader hints.
- **Daily Streak Tracking Engine**:
  - Consecutive daily streak calculation based on completion date records (`YYYY-MM-DD`).
  - Retains active streaks if completed yesterday, incrementing immediately upon completing today.
  - Handles habit completion toggling (toggling off cleanly rolls back streak count without losing historical completion dates).
  - Displays dynamic streak pill badges (`🔥 X days`) with distinct styles for new habits, active streaks, and completions today.
  - Tracks both current streak and all-time best streak per habit.
  - Added a dashboard "Top Streak" metric in the summary stats bar.
- **Visual Feedback & Rich Styling**:
  - Distinct strike-through typography with smooth color dimming on completed habit titles.
  - Glowing emerald card outline and subtle background tint when completed.
  - Status indicator pills (`Completed today ✓` vs `Not completed today`).
  - Warm amber glowing flame badges for active streaks.
  - Responsive 2x2 grid layout for summary statistics on mobile devices.
- **Data Persistence & Seamless Migration**:
  - Full completion history (`completedDates`), streak counts, and timestamps persist in `localStorage`.
  - Automatic backward-compatible migration for Day 1 data structures.

## 🚀 Day 1 Progress & Features

- **Project Architecture**: Lightweight, dependency-free vanilla HTML5, CSS3, and ES6 JavaScript.
- **Modern UI Layout**:
  - Dark-slate glassmorphism aesthetic with indigo and emerald highlights.
  - Responsive design optimized for both mobile and desktop screens.
  - Interactive header displaying current date and motivational subtitle.
  - Accessible input form with clean icon accents and autofocus support.
- **Core Habit Management**:
  - Add new habits seamlessly with the input field or by pressing `Enter`.
  - Toggle habits as completed / incomplete with animated visual checkmarks and strikethrough.
  - Delete habits when no longer needed.
  - Dynamic progress indicator: tracks total habits, completed count, and completion percentage in real time.
  - Clean empty state graphic when no habits are present.
- **Data Persistence**:
  - Automatically saves all habits to `localStorage` so data persists across browser refreshes and sessions.

## 📁 Project Structure

```text
Habit-Tracker/
├── index.html        # Semantic HTML5 layout, stats bar, and accessibility markup
├── styles.css        # Modern CSS theme, responsive styles, streak badges, and animations
├── app.js            # Core habit state management, streak logic, and localStorage persistence
└── README.md         # Project documentation and roadmap
```

## 🛠️ How to Run

No build step or external dependencies required!

1. Clone or navigate to this folder:
   ```bash
   cd Habit-Tracker
   ```
2. Open `index.html` directly in any web browser:
   - On Windows: double-click `index.html` or run:
     ```powershell
     Start-Process index.html
     ```
   - Or serve with any static web server (optional):
     ```powershell
     python -m http.server 8000
     ```
     Then visit `http://localhost:8000` in your browser.

## 🗺️ Roadmap (Upcoming Days)
- [x] Streak counter (track consecutive days completed)
- [ ] Habit categories and custom color tags
- [ ] Daily / Weekly / Monthly view
- [ ] Dark / Light mode toggle
- [ ] Export & import habit data (JSON backup)
