/**
 * Habit Tracker - Core Application Logic
 * Day 1: Project setup, dynamic rendering, and localStorage persistence.
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
  const currentDateEl = document.getElementById('current-date');

  // Application State
  let habits = [];

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
   * Load habits from localStorage safely
   * @returns {Array} List of stored habits
   */
  function loadHabits() {
    try {
      const rawData = localStorage.getItem(STORAGE_KEY);
      if (!rawData) return [];
      const parsed = JSON.parse(rawData);
      return Array.isArray(parsed) ? parsed : [];
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
   * Update statistics counters and progress bar
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
        const li = document.createElement('li');
        li.className = `habit-item ${habit.completed ? 'completed' : ''}`;
        li.dataset.id = habit.id;

        // Toggle button with custom checkbox circle
        const toggleBtn = document.createElement('button');
        toggleBtn.type = 'button';
        toggleBtn.className = 'toggle-btn';
        toggleBtn.setAttribute('aria-label', habit.completed ? `Mark "${habit.title}" as incomplete` : `Mark "${habit.title}" as complete`);
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

        const titleSpan = document.createElement('span');
        titleSpan.className = 'habit-title';
        titleSpan.textContent = habit.title;

        const dateSpan = document.createElement('span');
        dateSpan.className = 'habit-date';
        dateSpan.textContent = `Added ${formatTimestamp(habit.createdAt)}`;

        contentDiv.appendChild(titleSpan);
        contentDiv.appendChild(dateSpan);

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
      createdAt: Date.now()
    };

    // Prepend to display newest first
    habits.unshift(newHabit);
    saveHabits();
    renderHabits();
  }

  /**
   * Toggle completion state of a habit
   * @param {string} id
   */
  function toggleHabit(id) {
    const habit = habits.find(h => h.id === id);
    if (!habit) return;

    habit.completed = !habit.completed;
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
