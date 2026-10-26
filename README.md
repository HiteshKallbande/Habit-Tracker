# Habit Tracker 🎯

A sleek, responsive, and distraction-free Habit Tracker web application designed to help you build lifelong consistency, track daily routines, and celebrate your wins one day at a time.

Built with pure semantic HTML5, modern CSS3 (with custom properties, glassmorphism, and micro-interactions), and vanilla JavaScript (ES6+). Zero build steps or external dependencies required.

---

## ✨ Features

### 📅 Weekly Habit Matrix UI
- **7-Day Grid View**: Interactive weekly matrix displaying columns for Monday through Sunday.
- **Interactive Daily Ticks**: Click any day cell to toggle completion with a micro-pop animation, emerald checkmark (`✓`), and glow effect.
- **Pinned Sticky Column**: Habit titles remain sticky on the left during horizontal scrolling, ensuring seamless navigation on mobile devices.
- **Week Navigation**: Effortlessly browse past weeks, future weeks, or jump instantly to "Today".
- **Current Day Highlighting**: The active calendar day features a distinct `TODAY` badge and subtle emerald glow.

### ✏️ Habit Management (Edit & Delete)
- **Inline Habit Renaming**:
  - Click the **Edit** (pencil) button in the Actions column or **double-click** any habit title to enter inline edit mode.
  - Press <kbd>Enter</kbd> to save or <kbd>Esc</kbd> to cancel.
  - Includes input validation to prevent blank habit names.
- **Safe Habit Deletion**:
  - Click the **Delete** (trash) button on any habit row.
  - A custom modal confirmation dialog prevents accidental data loss and clearly indicates which habit is being removed.
  - Press <kbd>Esc</kbd> or click the backdrop to cancel.
- **Multiple Creation Points**: Add habits via the top action bar or directly inside the table using the inline `＋ Add another habit row...` input.

### 📊 Executive Summary Dashboard
- **Active Habits Metric**: Live count of habits currently being tracked.
- **Completed Today**: Real-time counter of habits completed today.
- **Completion Rate (%)**: Dynamic percentage calculation with motivational feedback (e.g., *"Almost there, finish strong!"*, *"All habits completed! 🎉"*).
- **Top Streak Tracker**: Highlights your longest active streak (`🔥 Xd`) across all habits.
- **Animated Progress Bar**: Smooth gradient progress track with live fraction ratio (e.g., `3 / 5 completed`).

### 🔥 Streak Engine & Consistency Metrics
- **Dynamic Daily Streaks**: Automatically calculates consecutive active days ending today or yesterday.
- **Historical Best Streak**: Persists and updates your all-time personal record for each habit.
- **Weekly Score Pill**: Displays weekly completion count for each habit row (e.g. `5/7`), glowing green on a perfect `7/7` week.

### 🎨 Refined UI / UX & Responsive Design
- **Dark Glassmorphic Theme**: Deep space navy palette, frosted glass cards (`backdrop-filter: blur`), subtle glowing borders, and clean typographic hierarchy using *Plus Jakarta Sans*.
- **Tactile Transitions**: Smooth hover elevations, button press scale effects, and animated checkmarks.
- **Floating Toast Notifications**: Instant, unobtrusive feedback when habits are added, renamed, or deleted.
- **Mobile First & Responsive**: Optimized breakpoints for desktop, tablet, and mobile (down to 320px). Features touch-friendly tap targets (min 40-44px) and a mobile horizontal scroll indicator.

### 🔒 100% Offline & Private
- All habit data, dates, and streak metrics are persisted in the browser's `localStorage`.
- Zero analytics, zero cookies, zero external API tracking.

---

## 📁 Project Structure

```text
Habit-Tracker/
├── index.html        # Semantic HTML5 layout, dashboard cards, matrix table, and modal dialog
├── styles.css        # Glassmorphic dark styling, responsive grid, animations, and transitions
├── app.js            # State management, local date math, streak calculations, inline editing, and modal logic
└── README.md         # Documentation and local setup instructions
```

---

## 🛠️ How to Run Locally

Because this project uses vanilla web standards, no compilation, package managers, or local server setups are required.

### Option 1: Open Directly in Your Browser (Quickest)
- **Windows**: Double-click `index.html`, or run:
  ```powershell
  Start-Process index.html
  ```
- **macOS**:
  ```bash
  open index.html
  ```
- **Linux**:
  ```bash
  xdg-open index.html
  ```

### Option 2: Run with Python HTTP Server
If you prefer running through `localhost`:
```bash
# Navigate to the repository folder
cd Habit-Tracker

# Start Python's built-in web server
python -m http.server 8000
```
Then open your browser and navigate to:
```text
http://localhost:8000
```

### Option 3: VS Code Live Server
1. Open the `Habit-Tracker` folder in [Visual Studio Code](https://code.visualstudio.com/).
2. Install the **Live Server** extension (by Ritwick Dey).
3. Right-click `index.html` and select **"Open with Live Server"**.

---

## ⌨️ Keyboard Shortcuts & Accessibility

| Key | Action |
| --- | --- |
| <kbd>Enter</kbd> (in top input) | Adds the new habit |
| <kbd>Enter</kbd> (in inline edit) | Saves the updated habit title |
| <kbd>Esc</kbd> (in inline edit) | Cancels habit renaming |
| <kbd>Esc</kbd> (in delete modal) | Closes delete confirmation modal |
| <kbd>Tab</kbd> / <kbd>Shift+Tab</kbd> | Navigates through interactive controls with visible focus rings |
| Double-click habit name | Enters inline edit mode |

---

## 🌐 Browser Compatibility

Tested and supported across all modern evergreen browsers:
- Google Chrome (latest)
- Microsoft Edge (latest)
- Mozilla Firefox (latest)
- Safari (iOS & macOS)
- Opera / Brave / Vivaldi

---

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).
