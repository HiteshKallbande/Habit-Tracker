# Habit Tracker 🎯

A sleek, responsive, and distraction-free Habit Tracker web application designed to help you build consistency and achieve your goals one day at a time.

## 🚀 Weekly Habit Matrix UI & Enhancements

- **Weekly Habit Matrix View**:
  - Full matrix/grid interface with habit rows and 7-day columns (Monday – Sunday).
  - Pinned sticky habit title column for smooth horizontal scrolling on mobile viewports.
  - Interactive "tick" cells for each day: click to mark a habit done with an animated emerald checkmark (`✓`) and pop micro-interaction.
  - Weekly navigation controls: browse previous/next weeks or jump directly to "Today".
  - Highlighting for the current calendar day ("TODAY" badge and glowing column border).
- **Row-Based Habit Creation**:
  - Add habits via the top action form or directly inside the matrix via the inline "+ Add another habit row..." input.
  - Delete habit rows with a single click.
- **Real-Time Streak & Progress Tracking**:
  - Per-row streak counter (`🔥 Xd`) dynamically calculated across completion history.
  - Per-row weekly completion score pill (e.g. `5/7` or glowing complete state at `7/7`).
  - Top summary dashboard metrics: Total Habits, Completed Today, Today's Progress %, and Top Streak.
- **Local Persistence & Data Integrity**:
  - Automatically persists all habit rows, dates, and streak metrics in `localStorage`.
  - Backward-compatible data migration.

## 📁 Project Structure

```text
Habit-Tracker/
├── index.html        # Semantic HTML5 layout, stats bar, and matrix table markup
├── styles.css        # Matrix grid styling, sticky columns, tick animations, and responsive theme
├── app.js            # Core habit state, week calculations, matrix rendering, and localStorage logic
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
- [x] Weekly matrix view with interactive daily ticks
- [ ] Habit categories and custom color tags
- [ ] Monthly heatmap view
- [ ] Dark / Light mode toggle
- [ ] Export & import habit data (JSON backup)
