/**
 * Habit Tracker - Core Application Logic
 * Day 2: Interactive daily completion, streak tracking, visual cues, and localStorage persistence.
 */

(() => {
  'use strict';

  // Constants
  const STORAGE_KEY = 'habit_tracker_habits_v1';

  // DOM Elements
  const habitForm = document.getElementById('habit-form');
  const habitInput = document.getElementById('habit-input');
  const habitList = document.getElementById('habit-list');
  const emptyState = document.getElementById('empty-state');
  const totalCountEl = document.getElementById('total-count');
  const completedCountEl = document.getElementById('completed-count');
  const progressPercentEl = document.getElementById('progress-percent');
  const progressFillEl = document.getElementById('progress-fill');
  const activeBadgeEl = document.getElementById('active-badge');
  const topStreakCountEl = document.getElementById('top-streak-count');
  const currentDateEl = document.getElementById('current-date');

  // Application State
  let habits = [];

  /**
   * Returns a local calendar date string in YYYY-MM-DD format.
   * Uses local time to prevent timezone offset discrepancies.
   * @param {Date} [date=new Date()]
   * @returns {string}
   */
  function getLocalDateString(date = new Date()) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * Parses a YYYY-MM-DD date string into a local Date object.
   * @param {string} dateStr
   * @returns {Date}
   */
  function parseLocalDateString(dateStr) {
    const [year, month, day] = dateStr.split('-').map(Number);
    return new Date(year, month - 1, day);
  }

  /**
   * Returns the YYYY-MM-DD date string for the calendar day immediately preceding dateStr.
   * @param {string} dateStr
   * @returns {string}
   */
  function getPreviousDateString(dateStr) {
    const date = parseLocalDateString(dateStr);
    date.setDate(date.getDate() - 1);
    return getLocalDateString(date);
  }

  /**
   * Calculates the current consecutive daily streak ending today or yesterday.
   * - If completed today: counts consecutive completed days ending today.
   * - If not completed today: if completed yesterday, streak is maintained ending yesterday.
   * - If neither completed today nor yesterday: streak is 0.
   * @param {string[]} completedDates Array of YYYY-MM-DD strings
   * @param {string} [todayStr=getLocalDateString()]
   * @returns {number}
   */
  function calculateCurrentStreak(completedDates, todayStr = getLocalDateString()) {
    if (!Array.isArray(completedDates) || completedDates.length === 0) {
      return 0;
    }
    const dateSet = new Set(completedDates);

    let currentTarget;
    if (dateSet.has(todayStr)) {
      currentTarget = todayStr;
    } else {
      const yesterdayStr = getPreviousDateString(todayStr);
      if (dateSet.has(yesterdayStr)) {
        currentTarget = yesterdayStr;
      } else {
        return 0;
      }
    }

    let streak = 0;
    let curr = currentTarget;
    while (dateSet.has(curr)) {
      streak++;
      curr = getPreviousDateString(curr);
    }
    return streak;
  }

  /**
   * Calculates the best (longest) streak across completion history.
   * @param {string[]} completedDates Array of YYYY-MM-DD strings
   * @returns {number}
   */
  function calculateBestStreak(completedDates) {
    if (!Array.isArray(completedDates) || completedDates.length === 0) {
      return 0;
    }
    const sorted = Array.from(new Set(completedDates)).sort();
    let best = 0;
    let current = 0;
    let prevDate = null;

    for (const dateStr of sorted) {
      const curDate = parseLocalDateString(dateStr);
      if (prevDate) {
        const diffTime = curDate.getTime() - prevDate.getTime();
        const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays === 1) {
          current++;
        } else {
          current = 1;
        }
      } else {
        current = 1;
      }
      if (current > best) {
        best = current;
      }
      prevDate = curDate;
    }
    return best;
  }

  /**
   * Format current date for the header subtitle
   */
  function displayCurrentDate() {
    if (!currentDateEl) return;
    const options = { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' };
    const today = new Date().toLocaleDateString(undefined, options);
    currentDateEl.textContent = `Today is ${today} • Build consistency one day at a time.`;
  }

  /**
   * Load habits from localStorage safely, with automatic migration for Day 1 data.
   * @returns {Array} List of stored habits
   */
  function loadHabits() {
    try {
      const rawData = localStorage.getItem(STORAGE_KEY);
      if (!rawData) return [];
      const parsed = JSON.parse(rawData);
      if (!Array.isArray(parsed)) return [];

      const todayStr = getLocalDateString();

      return parsed.map(habit => {
        // Sanitize and migrate completedDates
        let completedDates = Array.isArray(habit.completedDates) ? [...habit.completedDates] : [];

        // Backward compatibility: If habit was marked completed in Day 1 without completedDates
        if (completedDates.length === 0 && habit.completed) {
          const createdDateStr = getLocalDateString(new Date(habit.createdAt || Date.now()));
          completedDates.push(createdDateStr);
        }

        // Keep only unique, valid YYYY-MM-DD date strings
        completedDates = Array.from(new Set(
          completedDates.filter(d => typeof d === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(d))
        )).sort();

        const isCompletedToday = completedDates.includes(todayStr);
        const currentStreak = calculateCurrentStreak(completedDates, todayStr);
        const bestStreak = Math.max(habit.bestStreak || 0, calculateBestStreak(completedDates));

        return {
          id: habit.id || (Date.now().toString() + Math.random().toString(36).substring(2, 6)),
          title: habit.title || 'Untitled Habit',
          completed: isCompletedToday,
          completedDates: completedDates,
          streak: currentStreak,
          bestStreak: bestStreak,
          createdAt: habit.createdAt || Date.now()
        };
      });
    } catch (error) {
      console.error('Failed to load habits from localStorage:', error);
      return [];
    }
  }

  /**
   * Save habits to localStorage safely
   */
  function saveHabits() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(habits));
    } catch (error) {
      console.error('Failed to save habits to localStorage:', error);
    }
  }

  /**
   * Update statistics counters, streak indicator, and progress bar
   */
  function updateStats() {
    const total = habits.length;
    const completed = habits.filter(h => h.completed).length;
    const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);

    totalCountEl.textContent = total;
    completedCountEl.textContent = completed;
    progressPercentEl.textContent = `${percentage}%`;
    progressFillEl.style.width = `${percentage}%`;

    const activeCount = total - completed;
    activeBadgeEl.textContent = `${activeCount} remaining`;

    if (topStreakCountEl) {
      const topStreak = habits.reduce((max, h) => Math.max(max, h.streak || 0), 0);
      topStreakCountEl.textContent = `${topStreak} 🔥`;
    }
  }

  /**
   * Format a timestamp into a human-readable string
   * @param {number} timestamp
   * @returns {string}
   */
  function formatTimestamp(timestamp) {
    if (!timestamp) return 'Just now';
    const date = new Date(timestamp);
    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric'
    });
  }

  /**
   * Render the list of habits to the DOM
   */
  function renderHabits() {
    habitList.innerHTML = '';

    if (habits.length === 0) {
      emptyState.classList.add('visible');
    } else {
      emptyState.classList.remove('visible');

      habits.forEach(habit => {
        const isCompletedToday = Boolean(habit.completed);
        const streak = habit.streak || 0;
        const best = habit.bestStreak || 0;

        const li = document.createElement('li');
        li.className = `habit-item ${isCompletedToday ? 'completed' : ''}`;
        li.dataset.id = habit.id;

        // Toggle button with custom checkbox circle
        const toggleBtn = document.createElement('button');
        toggleBtn.type = 'button';
        toggleBtn.className = 'toggle-btn';
        toggleBtn.setAttribute('role', 'checkbox');
        toggleBtn.setAttribute('aria-checked', isCompletedToday ? 'true' : 'false');
        toggleBtn.setAttribute('aria-label', isCompletedToday
          ? `Mark habit "${habit.title}" as incomplete for today`
          : `Mark habit "${habit.title}" as complete for today`
        );
        toggleBtn.dataset.action = 'toggle';

        const circle = document.createElement('span');
        circle.className = 'toggle-circle';
        circle.innerHTML = `
          <svg class="check-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        `;
        toggleBtn.appendChild(circle);

        // Habit info
        const contentDiv = document.createElement('div');
        contentDiv.className = 'habit-content';

        // Title row: title text + streak badge
        const titleRow = document.createElement('div');
        titleRow.className = 'habit-title-row';

        const titleSpan = document.createElement('span');
        titleSpan.className = 'habit-title';
        titleSpan.textContent = habit.title;

        // Streak Badge
        const streakBadge = document.createElement('span');
        let streakBadgeClass = 'streak-badge';
        if (streak === 0) {
          streakBadgeClass += ' zero';
        } else if (isCompletedToday) {
          streakBadgeClass += ' active completed-today';
        } else {
          streakBadgeClass += ' active';
        }
        streakBadge.className = streakBadgeClass;
        streakBadge.title = `Current streak: ${streak} ${streak === 1 ? 'day' : 'days'} (Best: ${best} ${best === 1 ? 'day' : 'days'})`;

        streakBadge.innerHTML = `
          <svg class="streak-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M12 2c-.6 1.8-1.7 3.3-3 4.5C7.2 8.3 6 10.8 6 13.5 6 17.1 8.7 20 12 20s6-2.9 6-6.5c0-2-1-3.9-2.5-5.2-.4 1.5-1.5 2.7-3 3.2 0-3.3-1.5-6.5-3.5-9.5z"/>
          </svg>
          <span class="streak-text">${streak} ${streak === 1 ? 'day' : 'days'}</span>
        `;

        titleRow.appendChild(titleSpan);
        titleRow.appendChild(streakBadge);

        // Meta details: status pill + creation date
        const metaDiv = document.createElement('div');
        metaDiv.className = 'habit-meta';

        const statusPill = document.createElement('span');
        statusPill.className = `habit-status-pill ${isCompletedToday ? 'completed' : 'pending'}`;
        statusPill.textContent = isCompletedToday ? 'Completed today ✓' : 'Not completed today';

        const dotSpan = document.createElement('span');
        dotSpan.className = 'meta-dot';
        dotSpan.innerHTML = '&bull;';

        const dateSpan = document.createElement('span');
        dateSpan.className = 'habit-date';
        dateSpan.textContent = `Added ${formatTimestamp(habit.createdAt)}`;

        metaDiv.appendChild(statusPill);
        metaDiv.appendChild(dotSpan);
        metaDiv.appendChild(dateSpan);

        contentDiv.appendChild(titleRow);
        contentDiv.appendChild(metaDiv);

        const leftDiv = document.createElement('div');
        leftDiv.className = 'habit-left';
        leftDiv.appendChild(toggleBtn);
        leftDiv.appendChild(contentDiv);

        // Actions (Delete button)
        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'habit-actions';

        const deleteBtn = document.createElement('button');
        deleteBtn.type = 'button';
        deleteBtn.className = 'action-btn delete-btn';
        deleteBtn.setAttribute('aria-label', `Delete habit "${habit.title}"`);
        deleteBtn.dataset.action = 'delete';
        deleteBtn.innerHTML = `
          <svg class="action-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            <line x1="10" y1="11" x2="10" y2="17"></line>
            <line x1="14" y1="11" x2="14" y2="17"></line>
          </svg>
        `;
        actionsDiv.appendChild(deleteBtn);

        li.appendChild(leftDiv);
        li.appendChild(actionsDiv);
        habitList.appendChild(li);
      });
    }

    updateStats();
  }

  /**
   * Add a new habit
   * @param {string} title
   */
  function addHabit(title) {
    const trimmed = title.trim();
    if (!trimmed) return;

    const newHabit = {
      id: Date.now().toString() + Math.random().toString(36).substring(2, 6),
      title: trimmed,
      completed: false,
      completedDates: [],
      streak: 0,
      bestStreak: 0,
      createdAt: Date.now()
    };

    // Prepend to display newest first
    habits.unshift(newHabit);
    saveHabits();
    renderHabits();
  }

  /**
   * Toggle completion state of a habit for today
   * @param {string} id
   */
  function toggleHabit(id) {
    const habit = habits.find(h => h.id === id);
    if (!habit) return;

    const todayStr = getLocalDateString();
    const dateSet = new Set(habit.completedDates || []);

    if (dateSet.has(todayStr)) {
      dateSet.delete(todayStr);
    } else {
      dateSet.add(todayStr);
    }

    habit.completedDates = Array.from(dateSet).sort();
    habit.completed = habit.completedDates.includes(todayStr);
    habit.streak = calculateCurrentStreak(habit.completedDates, todayStr);
    habit.bestStreak = Math.max(habit.bestStreak || 0, calculateBestStreak(habit.completedDates));

    saveHabits();
    renderHabits();
  }

  /**
   * Delete a habit
   * @param {string} id
   */
  function deleteHabit(id) {
    habits = habits.filter(h => h.id !== id);
    saveHabits();
    renderHabits();
  }

  /**
   * Initialize Event Listeners
   */
  function initEvents() {
    // Form submit listener
    habitForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const value = habitInput.value;
      if (value.trim()) {
        addHabit(value);
        habitInput.value = '';
        habitInput.focus();
      }
    });

    // Delegated click handling on habit list
    habitList.addEventListener('click', (e) => {
      const actionBtn = e.target.closest('[data-action]');
      if (!actionBtn) return;

      const habitItem = actionBtn.closest('.habit-item');
      if (!habitItem) return;

      const habitId = habitItem.dataset.id;
      const action = actionBtn.dataset.action;

      if (action === 'toggle') {
        toggleHabit(habitId);
      } else if (action === 'delete') {
        deleteHabit(habitId);
      }
    });
  }

  /**
   * App Bootstrap
   */
  function init() {
    displayCurrentDate();
    habits = loadHabits();
    initEvents();
    renderHabits();
  }

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
