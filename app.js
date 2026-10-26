/**
 * Habit Tracker - Core Application Logic
 * Day 3 Final Edition: Weekly Matrix, Inline Habit Editing, Safe Habit Deletion,
 * Live Summary Dashboard, Real-time Streaks, and localStorage Persistence.
 */

(() => {
  'use strict';

  // Storage Key & Constants
  const STORAGE_KEY = 'habit_tracker_habits_v1';
  const DAY_NAMES = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

  // DOM Elements
  const habitForm = document.getElementById('habit-form');
  const habitInput = document.getElementById('habit-input');
  const matrixHeaderRow = document.getElementById('matrix-header-row');
  const matrixBody = document.getElementById('matrix-body');
  const emptyState = document.getElementById('empty-state');
  const weekRangeLabel = document.getElementById('week-range-label');
  const prevWeekBtn = document.getElementById('prev-week-btn');
  const nextWeekBtn = document.getElementById('next-week-btn');
  const todayWeekBtn = document.getElementById('today-week-btn');
  const activeBadgeEl = document.getElementById('active-badge');
  const currentDateEl = document.getElementById('current-date');

  // Dashboard Stats Elements
  const totalCountEl = document.getElementById('total-count');
  const totalSubtextEl = document.getElementById('total-subtext');
  const completedCountEl = document.getElementById('completed-count');
  const completedSubtextEl = document.getElementById('completed-subtext');
  const progressPercentEl = document.getElementById('progress-percent');
  const progressSubtextEl = document.getElementById('progress-subtext');
  const topStreakCountEl = document.getElementById('top-streak-count');
  const streakSubtextEl = document.getElementById('streak-subtext');
  const progressFillEl = document.getElementById('progress-fill');
  const progressRatioEl = document.getElementById('progress-ratio');

  // Delete Modal Elements
  const deleteModal = document.getElementById('delete-modal');
  const deleteHabitName = document.getElementById('delete-habit-name');
  const cancelDeleteBtn = document.getElementById('cancel-delete-btn');
  const confirmDeleteBtn = document.getElementById('confirm-delete-btn');

  // Toast Container
  const toastContainer = document.getElementById('toast-container');

  // Application State
  let habits = [];
  let currentWeekOffset = 0; // 0 = current week, -1 = last week, +1 = next week
  let editingHabitId = null;  // ID of habit currently being edited inline
  let pendingDeleteHabitId = null; // ID of habit awaiting delete confirmation

  /**
   * Escape HTML to prevent injection issues in template literals
   * @param {string} str
   * @returns {string}
   */
  function escapeHtml(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  /**
   * Show a modern floating toast notification
   * @param {string} message
   * @param {'info' | 'success' | 'danger'} [type='info']
   */
  function showToast(message, type = 'info') {
    if (!toastContainer) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    let iconSvg = '';
    if (type === 'success') {
      iconSvg = `
        <svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
      `;
    } else if (type === 'danger') {
      iconSvg = `
        <svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="3 6 5 6 21 6"></polyline>
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
        </svg>
      `;
    } else {
      iconSvg = `
        <svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="16" x2="12" y2="12"></line>
          <line x1="12" y1="8" x2="12.01" y2="8"></line>
        </svg>
      `;
    }

    toast.innerHTML = `
      ${iconSvg}
      <span class="toast-text">${escapeHtml(message)}</span>
    `;

    toastContainer.appendChild(toast);

    // Trigger slide-in animation
    requestAnimationFrame(() => {
      toast.classList.add('visible');
    });

    // Auto dismiss after 2.8s
    setTimeout(() => {
      toast.classList.remove('visible');
      setTimeout(() => {
        if (toast.parentNode) {
          toast.remove();
        }
      }, 250);
    }, 2800);
  }

  /**
   * Returns a local calendar date string in YYYY-MM-DD format.
   * Uses local calendar time to eliminate UTC offset shifts.
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
   * Returns an array of 7 Date objects (Monday through Sunday) for the specified week offset.
   * @param {number} offsetWeeks
   * @returns {Date[]}
   */
  function getWeekDays(offsetWeeks = 0) {
    const now = new Date();
    now.setDate(now.getDate() + offsetWeeks * 7);

    // In JS, getDay() returns 0 for Sunday, 1 for Monday, etc.
    const dayOfWeek = now.getDay();
    const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;

    const monday = new Date(now);
    monday.setDate(now.getDate() + diffToMonday);

    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      days.push(d);
    }
    return days;
  }

  /**
   * Formats a human-friendly week date range string (e.g. "Oct 19 – Oct 25, 2026").
   * @param {Date} monday
   * @param {Date} sunday
   * @returns {string}
   */
  function formatWeekRange(monday, sunday) {
    const optionsMonth = { month: 'short', day: 'numeric' };
    const optionsFull = { month: 'short', day: 'numeric', year: 'numeric' };

    if (monday.getFullYear() !== sunday.getFullYear()) {
      return `${monday.toLocaleDateString(undefined, optionsFull)} – ${sunday.toLocaleDateString(undefined, optionsFull)}`;
    }
    if (monday.getMonth() !== sunday.getMonth()) {
      return `${monday.toLocaleDateString(undefined, optionsMonth)} – ${sunday.toLocaleDateString(undefined, optionsFull)}`;
    }
    return `${monday.toLocaleDateString(undefined, optionsMonth)} – ${sunday.getDate()}, ${sunday.getFullYear()}`;
  }

  /**
   * Calculates the current consecutive daily streak ending today or yesterday.
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
    currentDateEl.textContent = `Today is ${today} • Weekly habit consistency matrix.`;
  }

  /**
   * Load habits from localStorage safely with backward compatibility.
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
        let completedDates = Array.isArray(habit.completedDates) ? [...habit.completedDates] : [];

        if (completedDates.length === 0 && habit.completed) {
          const createdDateStr = getLocalDateString(new Date(habit.createdAt || Date.now()));
          completedDates.push(createdDateStr);
        }

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
   * Update statistics counters, streak indicator, and progress bar in the dashboard
   */
  function updateDashboard() {
    const total = habits.length;
    const completedToday = habits.filter(h => h.completed).length;
    const percentage = total === 0 ? 0 : Math.round((completedToday / total) * 100);
    const remainingToday = total - completedToday;

    // 1. Total Active Habits
    if (totalCountEl) totalCountEl.textContent = total;
    if (totalSubtextEl) {
      totalSubtextEl.textContent = total === 1 ? '1 active habit' : `${total} active habits`;
    }

    // 2. Completed Today
    if (completedCountEl) completedCountEl.textContent = completedToday;
    if (completedSubtextEl) {
      completedSubtextEl.textContent = `${completedToday} of ${total} done`;
    }

    // 3. Completion Rate & Dynamic Motivator
    if (progressPercentEl) progressPercentEl.textContent = `${percentage}%`;
    if (progressSubtextEl) {
      if (total === 0) {
        progressSubtextEl.textContent = 'Add your first habit above';
      } else if (percentage === 100) {
        progressSubtextEl.textContent = 'All habits completed! 🎉';
      } else if (percentage >= 75) {
        progressSubtextEl.textContent = 'Almost there, finish strong!';
      } else if (percentage >= 50) {
        progressSubtextEl.textContent = 'Over halfway there!';
      } else if (percentage > 0) {
        progressSubtextEl.textContent = 'Great momentum started!';
      } else {
        progressSubtextEl.textContent = 'Ready to conquer today?';
      }
    }

    // 4. Top Streak
    const topStreak = habits.reduce((max, h) => Math.max(max, h.streak || 0), 0);
    if (topStreakCountEl) {
      topStreakCountEl.textContent = `${topStreak} 🔥`;
    }
    if (streakSubtextEl) {
      if (topStreak > 0) {
        streakSubtextEl.textContent = `${topStreak} consecutive ${topStreak === 1 ? 'day' : 'days'}`;
      } else {
        streakSubtextEl.textContent = 'Start your streak today';
      }
    }

    // 5. Progress Fill Bar & Ratio
    if (progressFillEl) {
      progressFillEl.style.width = `${percentage}%`;
    }
    if (progressRatioEl) {
      progressRatioEl.textContent = `${completedToday} / ${total} completed`;
    }

    // 6. Section Badge
    if (activeBadgeEl) {
      activeBadgeEl.textContent = `${remainingToday} remaining today`;
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
   * Start inline editing for a habit row
   * @param {string} habitId
   */
  function startEditing(habitId) {
    editingHabitId = habitId;
    renderMatrix();
  }

  /**
   * Cancel inline editing
   */
  function cancelEditing() {
    editingHabitId = null;
    renderMatrix();
  }

  /**
   * Save edited habit title
   * @param {string} habitId
   * @param {string} newTitle
   */
  function saveHabitTitle(habitId, newTitle) {
    const trimmed = (newTitle || '').trim();
    if (!trimmed) {
      showToast('Habit title cannot be empty', 'danger');
      return;
    }

    const habit = habits.find(h => h.id === habitId);
    if (!habit) {
      cancelEditing();
      return;
    }

    if (habit.title !== trimmed) {
      const oldTitle = habit.title;
      habit.title = trimmed;
      saveHabits();
      showToast(`Renamed to "${trimmed}"`, 'success');
    }

    editingHabitId = null;
    renderMatrix();
  }

  /**
   * Open delete confirmation modal
   * @param {string} habitId
   */
  function openDeleteModal(habitId) {
    const habit = habits.find(h => h.id === habitId);
    if (!habit) return;

    pendingDeleteHabitId = habitId;
    if (deleteHabitName) {
      deleteHabitName.textContent = `"${habit.title}"`;
    }

    if (deleteModal) {
      deleteModal.classList.add('active');
      deleteModal.setAttribute('aria-hidden', 'false');
      if (cancelDeleteBtn) {
        cancelDeleteBtn.focus();
      }
    }
  }

  /**
   * Close delete confirmation modal
   */
  function closeDeleteModal() {
    pendingDeleteHabitId = null;
    if (deleteModal) {
      deleteModal.classList.remove('active');
      deleteModal.setAttribute('aria-hidden', 'true');
    }
  }

  /**
   * Confirm deletion of the pending habit
   */
  function confirmDeleteHabit() {
    if (!pendingDeleteHabitId) return;

    const habitToDelete = habits.find(h => h.id === pendingDeleteHabitId);
    const title = habitToDelete ? habitToDelete.title : 'Habit';

    habits = habits.filter(h => h.id !== pendingDeleteHabitId);
    saveHabits();
    closeDeleteModal();

    if (editingHabitId === pendingDeleteHabitId) {
      editingHabitId = null;
    }

    renderMatrix();
    showToast(`Deleted "${title}"`, 'danger');
  }

  /**
   * Render the Matrix UI: Header columns, habit rows with interactive ticks, inline editing, and inline add row.
   */
  function renderMatrix() {
    const weekDays = getWeekDays(currentWeekOffset);
    const todayStr = getLocalDateString();

    // 1. Update week navigation label
    if (weekRangeLabel) {
      weekRangeLabel.textContent = formatWeekRange(weekDays[0], weekDays[6]);
    }

    if (todayWeekBtn) {
      todayWeekBtn.style.opacity = currentWeekOffset === 0 ? '1' : '0.75';
    }

    // 2. Render Matrix Header Row
    matrixHeaderRow.innerHTML = '';

    // Habit Column Header
    const thHabit = document.createElement('th');
    thHabit.className = 'matrix-th th-habit';
    thHabit.textContent = 'Habit';
    matrixHeaderRow.appendChild(thHabit);

    // 7 Day Headers
    weekDays.forEach((day, idx) => {
      const dateStr = getLocalDateString(day);
      const isToday = dateStr === todayStr;

      const thDay = document.createElement('th');
      thDay.className = `matrix-th th-day ${isToday ? 'is-today' : ''}`;

      const wrap = document.createElement('div');
      wrap.className = 'day-header-wrap';

      const nameSpan = document.createElement('span');
      nameSpan.className = 'day-name';
      nameSpan.textContent = DAY_NAMES[idx];

      const numSpan = document.createElement('span');
      numSpan.className = 'day-num';
      numSpan.textContent = day.getDate();

      wrap.appendChild(nameSpan);
      wrap.appendChild(numSpan);

      if (isToday) {
        const pill = document.createElement('span');
        pill.className = 'today-pill';
        pill.textContent = 'TODAY';
        wrap.appendChild(pill);
      }

      thDay.appendChild(wrap);
      matrixHeaderRow.appendChild(thDay);
    });

    // Streak Column Header
    const thStreak = document.createElement('th');
    thStreak.className = 'matrix-th th-streak';
    thStreak.textContent = 'Streak';
    matrixHeaderRow.appendChild(thStreak);

    // Week Score Column Header
    const thScore = document.createElement('th');
    thScore.className = 'matrix-th th-score';
    thScore.textContent = 'Week';
    matrixHeaderRow.appendChild(thScore);

    // Actions Column Header
    const thAction = document.createElement('th');
    thAction.className = 'matrix-th th-action';
    thAction.textContent = 'Actions';
    matrixHeaderRow.appendChild(thAction);

    // 3. Render Matrix Body Rows
    matrixBody.innerHTML = '';

    if (habits.length === 0) {
      emptyState.classList.add('visible');
    } else {
      emptyState.classList.remove('visible');

      habits.forEach(habit => {
        const streak = habit.streak || 0;
        const best = habit.bestStreak || 0;
        const isEditing = habit.id === editingHabitId;

        const tr = document.createElement('tr');
        tr.className = `matrix-row ${isEditing ? 'is-row-editing' : ''}`;
        tr.dataset.id = habit.id;

        // Habit Name Cell (Sticky Left)
        const nameTd = document.createElement('td');
        nameTd.className = `habit-name-cell ${isEditing ? 'editing' : ''}`;

        if (isEditing) {
          // Render Inline Edit Form
          const editForm = document.createElement('form');
          editForm.className = 'inline-edit-form';
          editForm.dataset.habitId = habit.id;
          editForm.setAttribute('autocomplete', 'off');

          const editInput = document.createElement('input');
          editInput.type = 'text';
          editInput.className = 'inline-edit-input';
          editInput.value = habit.title;
          editInput.maxLength = 80;
          editInput.setAttribute('aria-label', `Edit habit title: ${habit.title}`);
          editInput.required = true;

          const btnGroup = document.createElement('div');
          btnGroup.className = 'inline-edit-btn-group';

          const saveBtn = document.createElement('button');
          saveBtn.type = 'submit';
          saveBtn.className = 'inline-edit-btn save-btn';
          saveBtn.setAttribute('title', 'Save changes (Enter)');
          saveBtn.setAttribute('aria-label', 'Save changes');
          saveBtn.innerHTML = `
            <svg class="edit-btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          `;

          const cancelBtn = document.createElement('button');
          cancelBtn.type = 'button';
          cancelBtn.className = 'inline-edit-btn cancel-btn';
          cancelBtn.dataset.action = 'cancel-edit';
          cancelBtn.setAttribute('title', 'Cancel (Esc)');
          cancelBtn.setAttribute('aria-label', 'Cancel editing');
          cancelBtn.innerHTML = `
            <svg class="edit-btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          `;

          btnGroup.appendChild(saveBtn);
          btnGroup.appendChild(cancelBtn);
          editForm.appendChild(editInput);
          editForm.appendChild(btnGroup);
          nameTd.appendChild(editForm);

          // Focus and select input after DOM node is inserted
          setTimeout(() => {
            editInput.focus();
            editInput.select();
          }, 0);
        } else {
          // Regular view mode
          const nameWrap = document.createElement('div');
          nameWrap.className = 'habit-name-wrap';

          const titleSpan = document.createElement('span');
          titleSpan.className = 'habit-title';
          titleSpan.textContent = habit.title;
          titleSpan.title = `${habit.title} (Double-click to edit)`;
          titleSpan.dataset.action = 'start-edit';
          titleSpan.dataset.habitId = habit.id;

          const dateSpan = document.createElement('span');
          dateSpan.className = 'habit-created-date';
          dateSpan.textContent = `Added ${formatTimestamp(habit.createdAt)}`;

          nameWrap.appendChild(titleSpan);
          nameWrap.appendChild(dateSpan);
          nameTd.appendChild(nameWrap);
        }

        tr.appendChild(nameTd);

        // 7 Day Tick Cells
        let weekCompletedCount = 0;

        weekDays.forEach((day, idx) => {
          const dateStr = getLocalDateString(day);
          const isTicked = habit.completedDates.includes(dateStr);
          const isToday = dateStr === todayStr;

          if (isTicked) {
            weekCompletedCount++;
          }

          const dayTd = document.createElement('td');
          dayTd.className = `tick-cell ${isToday ? 'is-today' : ''}`;

          const tickBtn = document.createElement('button');
          tickBtn.type = 'button';
          tickBtn.className = `tick-btn ${isTicked ? 'ticked' : ''}`;
          tickBtn.dataset.action = 'toggle-date';
          tickBtn.dataset.habitId = habit.id;
          tickBtn.dataset.date = dateStr;
          tickBtn.setAttribute('role', 'checkbox');
          tickBtn.setAttribute('aria-checked', isTicked ? 'true' : 'false');
          tickBtn.setAttribute('aria-label', `${isTicked ? 'Untick' : 'Tick'} "${habit.title}" for ${DAY_NAMES[idx]}, ${dateStr}`);

          tickBtn.innerHTML = `
            <svg class="tick-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          `;

          dayTd.appendChild(tickBtn);
          tr.appendChild(dayTd);
        });

        // Streak Cell
        const streakTd = document.createElement('td');
        streakTd.className = 'streak-cell';

        const streakBadge = document.createElement('span');
        let streakClass = 'streak-badge';
        if (streak === 0) {
          streakClass += ' zero';
        } else if (habit.completed) {
          streakClass += ' active completed-today';
        } else {
          streakClass += ' active';
        }
        streakBadge.className = streakClass;
        streakBadge.title = `Current streak: ${streak} ${streak === 1 ? 'day' : 'days'} (Best: ${best} ${best === 1 ? 'day' : 'days'})`;
        streakBadge.innerHTML = `
          <svg class="streak-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M12 2c-.6 1.8-1.7 3.3-3 4.5C7.2 8.3 6 10.8 6 13.5 6 17.1 8.7 20 12 20s6-2.9 6-6.5c0-2-1-3.9-2.5-5.2-.4 1.5-1.5 2.7-3 3.2 0-3.3-1.5-6.5-3.5-9.5z"/>
          </svg>
          <span>${streak}d</span>
        `;
        streakTd.appendChild(streakBadge);
        tr.appendChild(streakTd);

        // Week Score Cell
        const scoreTd = document.createElement('td');
        scoreTd.className = 'score-cell';
        const scorePill = document.createElement('span');
        scorePill.className = `week-score-pill ${weekCompletedCount === 7 ? 'complete' : ''}`;
        scorePill.textContent = `${weekCompletedCount}/7`;
        scoreTd.appendChild(scorePill);
        tr.appendChild(scoreTd);

        // Action Cell (Edit & Delete Buttons)
        const actionTd = document.createElement('td');
        actionTd.className = 'action-cell';

        const actionGroup = document.createElement('div');
        actionGroup.className = 'action-btn-group';

        // Edit Button
        const editBtn = document.createElement('button');
        editBtn.type = 'button';
        editBtn.className = 'action-btn edit-btn';
        editBtn.dataset.action = 'start-edit';
        editBtn.dataset.habitId = habit.id;
        editBtn.setAttribute('title', `Edit habit "${habit.title}"`);
        editBtn.setAttribute('aria-label', `Edit habit "${habit.title}"`);
        editBtn.innerHTML = `
          <svg class="action-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
          </svg>
        `;

        // Delete Button
        const deleteBtn = document.createElement('button');
        deleteBtn.type = 'button';
        deleteBtn.className = 'action-btn delete-btn';
        deleteBtn.dataset.action = 'open-delete';
        deleteBtn.dataset.habitId = habit.id;
        deleteBtn.setAttribute('title', `Delete habit "${habit.title}"`);
        deleteBtn.setAttribute('aria-label', `Delete habit "${habit.title}"`);
        deleteBtn.innerHTML = `
          <svg class="action-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
          </svg>
        `;

        actionGroup.appendChild(editBtn);
        actionGroup.appendChild(deleteBtn);
        actionTd.appendChild(actionGroup);
        tr.appendChild(actionTd);

        matrixBody.appendChild(tr);
      });
    }

    // 4. Append Inline "Add habit row" to the Matrix
    const addRow = document.createElement('tr');
    addRow.className = 'matrix-add-row';

    const addCell = document.createElement('td');
    addCell.colSpan = 11;
    addCell.className = 'matrix-add-cell';

    const inlineForm = document.createElement('form');
    inlineForm.className = 'matrix-inline-form';
    inlineForm.id = 'matrix-inline-form';
    inlineForm.setAttribute('autocomplete', 'off');

    const inlineInput = document.createElement('input');
    inlineInput.type = 'text';
    inlineInput.className = 'matrix-inline-input';
    inlineInput.placeholder = '＋ Add another habit row...';
    inlineInput.maxLength = 80;
    inlineInput.setAttribute('aria-label', 'New habit row name');

    const inlineBtn = document.createElement('button');
    inlineBtn.type = 'submit';
    inlineBtn.className = 'btn btn-primary matrix-inline-btn';
    inlineBtn.innerHTML = '<span>Add Row</span>';

    inlineForm.appendChild(inlineInput);
    inlineForm.appendChild(inlineBtn);
    addCell.appendChild(inlineForm);
    addRow.appendChild(addCell);
    matrixBody.appendChild(addRow);

    updateDashboard();
  }

  /**
   * Add a new habit as a new row in the matrix
   * @param {string} title
   */
  function addHabit(title) {
    const trimmed = (title || '').trim();
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

    habits.push(newHabit);
    saveHabits();
    renderMatrix();
    showToast(`Added habit "${trimmed}"`, 'success');
  }

  /**
   * Toggle completion (tick) of a habit for a specific date
   * @param {string} habitId
   * @param {string} dateStr YYYY-MM-DD
   */
  function toggleHabitDate(habitId, dateStr) {
    const habit = habits.find(h => h.id === habitId);
    if (!habit) return;

    const todayStr = getLocalDateString();
    const dateSet = new Set(habit.completedDates || []);

    const wasTicked = dateSet.has(dateStr);
    if (wasTicked) {
      dateSet.delete(dateStr);
    } else {
      dateSet.add(dateStr);
    }

    habit.completedDates = Array.from(dateSet).sort();
    habit.completed = habit.completedDates.includes(todayStr);
    habit.streak = calculateCurrentStreak(habit.completedDates, todayStr);
    habit.bestStreak = Math.max(habit.bestStreak || 0, calculateBestStreak(habit.completedDates));

    saveHabits();
    renderMatrix();

    if (!wasTicked && dateStr === todayStr) {
      if (habit.streak > 1) {
        showToast(`Streak active: ${habit.streak} days on "${habit.title}"! 🔥`, 'success');
      }
    }
  }

  /**
   * Initialize all event listeners
   */
  function initEvents() {
    // Top habit form submit listener
    if (habitForm && habitInput) {
      habitForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const value = habitInput.value;
        if (value.trim()) {
          addHabit(value);
          habitInput.value = '';
          habitInput.focus();
        }
      });
    }

    // Week navigation listeners
    if (prevWeekBtn) {
      prevWeekBtn.addEventListener('click', () => {
        currentWeekOffset--;
        renderMatrix();
      });
    }

    if (nextWeekBtn) {
      nextWeekBtn.addEventListener('click', () => {
        currentWeekOffset++;
        renderMatrix();
      });
    }

    if (todayWeekBtn) {
      todayWeekBtn.addEventListener('click', () => {
        currentWeekOffset = 0;
        renderMatrix();
      });
    }

    // Matrix Body Click Listener (Delegated)
    if (matrixBody) {
      matrixBody.addEventListener('click', (e) => {
        // 1. Action button clicks
        const actionBtn = e.target.closest('[data-action]');
        if (actionBtn) {
          const action = actionBtn.dataset.action;
          const habitId = actionBtn.dataset.habitId;

          if (action === 'toggle-date') {
            const date = actionBtn.dataset.date;
            if (habitId && date) {
              toggleHabitDate(habitId, date);
            }
          } else if (action === 'start-edit') {
            if (habitId) {
              startEditing(habitId);
            }
          } else if (action === 'cancel-edit') {
            cancelEditing();
          } else if (action === 'open-delete') {
            if (habitId) {
              openDeleteModal(habitId);
            }
          }
          return;
        }
      });

      // Double-click habit title to edit
      matrixBody.addEventListener('dblclick', (e) => {
        const titleEl = e.target.closest('.habit-title');
        if (titleEl && titleEl.dataset.habitId) {
          startEditing(titleEl.dataset.habitId);
        }
      });

      // Matrix Form Submissions: Inline Edit and Inline Add
      matrixBody.addEventListener('submit', (e) => {
        // A. Inline Edit Form
        if (e.target && e.target.classList.contains('inline-edit-form')) {
          e.preventDefault();
          const habitId = e.target.dataset.habitId;
          const input = e.target.querySelector('.inline-edit-input');
          if (habitId && input) {
            saveHabitTitle(habitId, input.value);
          }
          return;
        }

        // B. Inline Add Row Form
        if (e.target && e.target.id === 'matrix-inline-form') {
          e.preventDefault();
          const input = e.target.querySelector('.matrix-inline-input');
          if (input && input.value.trim()) {
            addHabit(input.value);
            input.value = '';
            input.focus();
          }
        }
      });

      // Escape key to cancel editing inside input
      matrixBody.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && e.target.classList.contains('inline-edit-input')) {
          e.preventDefault();
          cancelEditing();
        }
      });
    }

    // Delete Confirmation Modal Listeners
    if (cancelDeleteBtn) {
      cancelDeleteBtn.addEventListener('click', closeDeleteModal);
    }

    if (confirmDeleteBtn) {
      confirmDeleteBtn.addEventListener('click', confirmDeleteHabit);
    }

    if (deleteModal) {
      deleteModal.addEventListener('click', (e) => {
        if (e.target === deleteModal) {
          closeDeleteModal();
        }
      });
    }

    // Global Keydown Listeners (Escape for modal/inline edit)
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (deleteModal && deleteModal.classList.contains('active')) {
          closeDeleteModal();
        } else if (editingHabitId) {
          cancelEditing();
        }
      }
    });
  }

  /**
   * Bootstrap Application
   */
  function init() {
    displayCurrentDate();
    habits = loadHabits();
    initEvents();
    renderMatrix();
  }

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
