# Habit Tracker 🎯

A sleek, responsive, and distraction-free Habit Tracker web application designed to help you build consistency and achieve your goals one day at a time.

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
├── index.html        # Semantic HTML5 layout and accessibility markup
├── styles.css        # Modern CSS theme, responsive styles, and micro-animations
├── app.js            # Core habit state management, DOM rendering, and localStorage logic
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
- [ ] Streak counter (track consecutive days completed)
- [ ] Habit categories and custom color tags
- [ ] Daily / Weekly / Monthly view
- [ ] Dark / Light mode toggle
- [ ] Export & import habit data (JSON backup)
