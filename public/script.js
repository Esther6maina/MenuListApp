// public/script.js

// Export testable functions and objects (available in Node.js for testing)
const validate = {
  isNonEmpty: (value) => !!value && value.trim().length > 0,
  isValidDay: (value) => ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday', 'all'].includes(value.toLowerCase()),
  isValidCategory: (value) => ['all', 'breakfast', 'lunch', 'dinner', 'snacks', 'physical-activity'].includes(value.toLowerCase()),
};

// Fetch nutritional data from Nutritionix via backend
async function fetchNutritionalData(query) {
  try {
    const response = await fetch('/api/nutrition', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query })
    });
    if (!response.ok) throw new Error('Failed to fetch nutritional data');
    const data = await response.json();
    return data.foods && data.foods.length > 0 ? data.foods[0].nf_calories || 0 : 0;
  } catch (err) {
    console.error('Error fetching nutritional data:', err);
    return 0;
  }
}

// Fetch activity data from Nutritionix via backend
async function fetchActivityData(query) {
  try {
    const response = await fetch('/api/activity', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query })
    });
    if (!response.ok) throw new Error('Failed to fetch activity data');
    const data = await response.json();
    return {
      calories: data.exercises && data.exercises.length > 0 ? data.exercises[0].nf_calories || 0 : 0,
      duration: data.exercises && data.exercises.length > 0 ? data.exercises[0].duration_min || 0 : 0
    };
  } catch (err) {
    console.error('Error fetching activity data:', err);
    return { calories: 0, duration: 0 };
  }
}

// Create a list item with nutritional or activity data
async function createListItem(text, timestamp = null, calories = 0, duration = 0, document = global.document) {
  const li = document.createElement('li');
  const time = timestamp ? new Date(timestamp) : new Date();
  const timeString = time.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    hour12: true
  });

  const itemContent = document.createElement('div');
  itemContent.className = 'item-content';
  itemContent.textContent = text;

  const deleteBtn = document.createElement('button');
  deleteBtn.textContent = 'Delete';
  deleteBtn.className = 'delete-btn';
  itemContent.appendChild(deleteBtn);

  li.appendChild(itemContent);
  li.setAttribute('data-timestamp', timeString);
  li.dataset.calories = calories || 0;
  li.dataset.duration = duration || 0;

  // Fetch nutritional data for meals
  if (!li.closest('.activity-section') && text) {
    const calories = await fetchNutritionalData(text);
    li.dataset.calories = calories;
  }

  // Fetch activity data for activities
  if (li.closest('.activity-section') && text) {
    const { calories, duration } = await fetchActivityData(text);
    li.dataset.calories = calories;
    li.dataset.duration = duration;
  }

  setTimeout(() => li.classList.add('fadeIn'), 10);
  return li;
}

// Get data from a list
function getListData(list, document = global.document) {
  const items = [];
  if (list) {
    list.querySelectorAll('li').forEach(li => {
      const text = li.querySelector('.item-content').childNodes[0].textContent.trim();
      items.push({
        text: text || '',
        timestamp: li.getAttribute('data-timestamp') || '',
        completed: li.classList.contains('complete'),
        calories: parseFloat(li.dataset.calories) || 0,
        duration: parseFloat(li.dataset.duration) || 0
      });
    });
  }
  return items;
}

// Handle adding an item
async function handleAddItem(input, list, section, logger = console) {
  logger.info('Add button clicked!');
  const text = input.value.trim();
  logger.info('Input text:', { text });

  const errors = [];
  if (!validate.isNonEmpty(text)) {
    errors.push('Item text cannot be empty.');
  }
  if (errors.length > 0) {
    alert(errors.join('\n'));
    logger.warn('Validation errors:', { errors });
    return;
  }

  const existingItems = Array.from(list.querySelectorAll('li')).map(li =>
    li.querySelector('.item-content').childNodes[0].textContent.trim().toLowerCase()
  );
  logger.info('Existing items:', { existingItems });

  if (existingItems.includes(text.toLowerCase())) {
    alert('This item already exists!');
    logger.warn('Duplicate detected:', { text });
    return;
  }

  logger.info('Creating and adding item:', { text });
  const li = await createListItem(text);
  list.appendChild(li);
  input.value = '';
  debouncedSave();
}

// Update the current time display
function updateTimeDisplay() {
  const timeElement = document.querySelector('.current-time');
  if (timeElement) {
    const now = new Date();
    timeElement.textContent = now.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  }
}

// Set up the interval to update time every minute
function startTimeUpdate() {
  updateTimeDisplay(); // Initial call
  setInterval(updateTimeDisplay, 60000); // Update every minute
}

// Browser-specific code wrapped in DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
  let currentDay = 'monday';

  // DOM Elements
  const dayContent = document.getElementById('dayContent');
  const notesInput = document.getElementById('notesInput');
  const saveNotesBtn = document.getElementById('saveNotes');
  const saveDataBtn = document.getElementById('saveData');
  const loadDataBtn = document.getElementById('loadData');
  const searchInput = document.getElementById('searchInput');
  const dayFilter = document.getElementById('dayFilter');
  const categoryFilter = document.getElementById('categoryFilter');
  const searchResultsContainer = document.getElementById('searchResultsContainer');
  const searchResults = document.getElementById('searchResults');
  const autocompleteSuggestions = document.querySelector('.autocomplete-suggestions');
  const searchHistorySuggestions = document.querySelector('.search-history-suggestions');
  const historyBtn = document.getElementById('historyBtn');

  console.log('DOM fully loaded, initializing...');

  // Use console as the default logger in the browser
  const logger = console;

  // Collect all items for autocomplete and search
  let allItems = [];
  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  updateAllItems();

  // Fetch all items from the backend for autocomplete and search
  async function updateAllItems() {
    allItems = [];
    try {
      for (const day of days) {
        const response = await fetch(`/api/search?query=.*&day=${day}`);
        if (!response.ok) throw new Error(`Failed to fetch items for day ${day}`);
        const items = await response.json();
        allItems.push(...items);
      }
    } catch (err) {
      logger.error('Error fetching items for autocomplete:', { error: err.message });
    }
  }

  // Autocomplete Functionality
  function showAutocomplete(query) {
    searchHistorySuggestions.style.display = 'none';
    autocompleteSuggestions.style.display = 'block';
    const suggestions = allItems
      .filter(item => item.text.toLowerCase().includes(query.toLowerCase()))
      .slice(0, 5)
      .map(item => item.text);
    autocompleteSuggestions.innerHTML = '';
    if (suggestions.length > 0) {
      suggestions.forEach(suggestion => {
        const li = document.createElement('li');
        li.textContent = suggestion;
        li.addEventListener('click', () => {
          searchInput.value = suggestion;
          autocompleteSuggestions.style.display = 'none';
          searchItems(suggestion, dayFilter.value, categoryFilter.value).then(displaySearchResults);
        });
        autocompleteSuggestions.appendChild(li);
      });
    } else {
      autocompleteSuggestions.innerHTML = '<li>No suggestions</li>';
    }
  }

  // Hide Autocomplete on Blur or Outside Click
  searchInput.addEventListener('blur', () => {
    setTimeout(() => {
      autocompleteSuggestions.style.display = 'none';
      searchHistorySuggestions.style.display = 'none';
    }, 200);
  });

  window.addEventListener('click', (event) => {
    if (!searchInput.contains(event.target) && !autocompleteSuggestions.contains(event.target) && !searchHistorySuggestions.contains(event.target)) {
      autocompleteSuggestions.style.display = 'none';
      searchHistorySuggestions.style.display = 'none';
    }
  });

  // Search Functionality with Day and Category Filters
  async function searchItems(query, day = 'all', category = 'all') {
    if (!query || query.trim() === '') {
      console.warn('Empty query, skipping search');
      return [];
    }

    try {
      const response = await fetch(`/api/search?query=${encodeURIComponent(query)}&day=${day}&category=${category}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (err) {
      console.error('Error fetching items for search:', err);
      return [];
    }
  }

  // Display Search Results Inline
  async function displaySearchResults(results) {
    searchResults.innerHTML = '';
    if (results.length === 0) {
      searchResults.innerHTML = '<li>No results found.</li>';
    } else {
      for (const item of results) {
        const li = await createListItem(item.text, item.timestamp, item.calories, item.duration);
        li.classList.add('search-result');
        li.dataset.id = item.id;
        li.dataset.day = item.day;
        li.dataset.type = item.type;
        li.dataset.category = item.category;
        searchResults.appendChild(li);

        const deleteBtn = li.querySelector('.delete-btn');
        deleteBtn.addEventListener('click', () => {
          deleteSearchItem(li, item.id, item.day, item.type, item.category);
        });
      }
    }
    searchResultsContainer.style.display = 'block';
  }

  // Delete Item from Search Results
  async function deleteSearchItem(li, id, day, type, category) {
    try {
      const endpoint = type === 'meal' ? `/api/meals/${id}` : `/api/activities/${id}`;
      const response = await fetch(endpoint, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete item');
      li.remove();
      if (searchResults.children.length === 0) {
        searchResultsContainer.style.display = 'none';
      }
      updateTotals();
      updateAnalytics();
      updateAllItems();
    } catch (err) {
      logger.error('Error deleting item:', { id, day, type, category, error: err.message });
    }
  }

  // Search Input Event Listener with Autocomplete and Filters
  searchInput.addEventListener('input', (e) => {
    const query = e.target.value.trim();

    if (query.length > 0 && !validate.isNonEmpty(query)) {
      alert('Search query cannot be empty or just whitespace.');
      searchInput.value = '';
      autocompleteSuggestions.style.display = 'none';
      searchResultsContainer.style.display = 'none';
      searchResults.innerHTML = '';
      logger.warn('Invalid search query attempted:', { query });
      return;
    }
    if (query.length > 0) {
      logger.info('Showing autocomplete for query:', { query });
      showAutocomplete(query);
    } else {
      logger.info('Clearing search UI due to empty query');
      autocompleteSuggestions.style.display = 'none';
      searchResultsContainer.style.display = 'none';
      searchResults.innerHTML = '';
    }
  });

  // Search on Enter
  searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      const query = searchInput.value.trim();
      if (query.length > 0) {
        searchItems(query, dayFilter.value, categoryFilter.value).then(displaySearchResults);
        saveSearch(query);
        autocompleteSuggestions.style.display = 'none';
      }
    }
  });

  // Day and Category Filter Event Listeners
  dayFilter.addEventListener('change', (e) => {
    currentDay = e.target.value === 'all' ? 'monday' : e.target.value;
    const query = searchInput.value.trim();
    if (query.length > 0) {
      searchItems(query, e.target.value, categoryFilter.value).then(displaySearchResults);
    }
    loadData();
    updateTotals();
    updateAnalytics();
    console.log(`Switched to ${currentDay} via day filter`);
  });

  categoryFilter.addEventListener('change', (e) => {
    const query = searchInput.value.trim();
    if (query.length > 0) {
      searchItems(query, dayFilter.value, e.target.value).then(displaySearchResults);
    }
  });

  // Search History Management
  async function saveSearch(query) {
    try {
      await fetch('/api/search-history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query })
      });
    } catch (err) {
      logger.error('Error saving search query:', { error: err.message });
    }
  }

  async function showSearchHistory() {
    try {
      const response = await fetch('/api/search-history');
      const searchHistory = await response.json();

      autocompleteSuggestions.style.display = 'none';
      searchHistorySuggestions.style.display = 'block';
      searchHistorySuggestions.innerHTML = '';

      if (searchHistory.length === 0) {
        searchHistorySuggestions.innerHTML = '<li>No search history</li>';
      } else {
        searchHistory.forEach(item => {
          const li = document.createElement('li');
          li.textContent = item.query;
          li.addEventListener('click', () => {
            searchInput.value = item.query;
            searchItems(item.query, dayFilter.value, categoryFilter.value).then(displaySearchResults);
            searchHistorySuggestions.style.display = 'none';
          });
          searchHistorySuggestions.appendChild(li);
        });
      }
    } catch (err) {
      logger.error('Error fetching search history:', { error: err.message });
    }
  }

  if (historyBtn) historyBtn.addEventListener('click', showSearchHistory);

  // Debounce Utility for Auto-Save
  function debounce(func, wait) {
    let timeout;
    return function (...args) {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    };
  }

  // Initialize Sections
  function initSections() {
    console.log('Initializing sections...');
    document.querySelectorAll('.meal-section, .activity-section').forEach(section => {
      const addBtn = section.querySelector('.add-meal') || section.querySelector('.add-activity');
      const input = section.querySelector('.meal-input');
      const list = section.querySelector('.meal-list');

      if (!addBtn || !input || !list) {
        console.error('Missing elements in section:', { addBtn, input, list });
        return;
      }

      console.log('Found add button:', addBtn);

      // Remove any existing listeners to prevent duplicates
      addBtn.removeEventListener('click', handleAddItem);
      addBtn.addEventListener('click', () => {
        console.log('Add button clicked for section:', section);
        handleAddItem(input, list, section, logger);
      });
      list.removeEventListener('click', handleListClick);
      list.addEventListener('click', handleListClick);
    });
  }

  // Handle List Clicks
  async function handleListClick(event) {
    const li = event.target.closest('li');
    if (!li) return;

    if (event.target.className === 'delete-btn') {
      li.classList.add('deleting');
      setTimeout(async () => {
        try {
          const endpoint = li.closest('.activity-section') ? `/api/activities/${li.dataset.id}` : `/api/meals/${li.dataset.id}`;
          const response = await fetch(endpoint, { method: 'DELETE' });
          if (!response.ok) throw new Error('Failed to delete item');
          li.parentElement.removeChild(li);
          updateTotals();
          updateAnalytics();
          updateAllItems();
        } catch (err) {
          logger.error('Error deleting item:', { error: err.message });
        }
      }, 500);
    } else if (event.target.tagName === 'LI' || event.target.className === 'item-content') {
      li.classList.toggle('complete');
      debouncedSave();
    }
  }

  // Update Analytics
  async function updateAnalytics() {
    try {
      const response = await fetch(`/api/data/${currentDay}`);
      const data = await response.json();
      const mealTotals = document.getElementById('mealTotals');

      let mealCount = 0, activityCount = 0, totalCalories = 0, totalDuration = 0;

      Object.keys(data.meals).forEach(mealType => {
        mealCount += data.meals[mealType].length;
        data.meals[mealType].forEach(item => totalCalories += item.calories || 0);
      });
      activityCount = data.activity.length;
      data.activity.forEach(item => {
        totalCalories -= item.calories || 0;
        totalDuration += item.duration || 0;
      });

      mealTotals.textContent = `Total Meals: ${mealCount} (${totalCalories} calories) | Total Activities: ${activityCount} (${totalDuration} min)`;
    } catch (err) {
      logger.error('Error updating analytics:', { error: err.message });
      document.getElementById('mealTotals').textContent = 'Error loading analytics.';
    }
  }

  // Update Totals
  function updateTotals() {
    const mealLists = document.querySelectorAll('.meal-section .meal-list');
    const activityList = document.querySelector('.activity-section .meal-list');
    let mealCount = 0, activityCount = 0;

    mealLists.forEach(list => mealCount += list.children.length);
    if (activityList) activityCount = activityList.children.length;

    const totalsElement = document.querySelector('.totals');
    if (totalsElement) {
      totalsElement.textContent = `Total Meals: ${mealCount} | Total Activities: ${activityCount}`;
    }
  }

  // Save Data with Debounce
  const debouncedSave = debounce(saveData, 500);

  async function saveData() {
    const data = {
      meals: {
        breakfast: getListData(document.querySelector('.meal-section[data-meal="breakfast"] .meal-list')),
        lunch: getListData(document.querySelector('.meal-section[data-meal="lunch"] .meal-list')),
        dinner: getListData(document.querySelector('.meal-section[data-meal="dinner"] .meal-list')),
        snacks: getListData(document.querySelector('.meal-section[data-meal="snacks"] .meal-list'))
      },
      activity: getListData(document.querySelector('.activity-section .meal-list')),
      notes: notesInput.value
    };

    try {
      const response = await fetch(`/api/data/${currentDay}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Failed to save data');
      logger.info(`Data saved for ${currentDay}:`, data);
      updateAllItems();
    } catch (err) {
      logger.error('Error saving data:', { error: err.message });
    }
  }

  // Load Data
  async function loadData() {
    try {
      const response = await fetch(`/api/data/${currentDay}`);
      if (!response.ok) throw new Error('Failed to load data');
      const data = await response.json();
      logger.info(`Loaded data for ${currentDay}:`, data);

      if (!dayContent) {
        logger.error('dayContent element not found for loading data');
        return;
      }

      document.querySelectorAll('.meal-list').forEach(list => list.innerHTML = '');
      notesInput.value = '';

      Object.keys(data.meals).forEach(mealType => {
        const list = document.querySelector(`.meal-list[data-meal="${mealType}"]`);
        if (list) {
          logger.info(`Loading meals for ${mealType}:`, data.meals[mealType]);
          data.meals[mealType].forEach(async item => {
            const li = await createListItem(item.text, item.timestamp, item.calories, item.duration);
            li.dataset.id = item.id;
            if (item.completed) li.classList.add('complete');
            list.appendChild(li);
          });
        } else {
          logger.error(`Meal list for ${mealType} not found`);
        }
      });

      const activityList = document.querySelector('.activity-section .meal-list');
      if (activityList) {
        logger.info('Loading activities:', data.activity);
        data.activity.forEach(async item => {
          const li = await createListItem(item.text, item.timestamp, item.calories, item.duration);
          li.dataset.id = item.id;
          if (item.completed) li.classList.add('complete');
          activityList.appendChild(li);
        });
      } else {
        logger.error('Activity list not found');
      }

      notesInput.value = data.notes || '';
      updateAnalytics();
      updateTotals();
    } catch (err) {
      logger.error('Error loading data:', { error: err.message });
    }
  }

  // Event Listeners
  if (saveNotesBtn) saveNotesBtn.addEventListener('click', saveData);
  if (saveDataBtn) saveDataBtn.addEventListener('click', saveData);
  if (loadDataBtn) loadDataBtn.addEventListener('click', loadData);

  // Initialize
  console.log('Initial setup starting...');
  updateTimeDisplay();
  startTimeUpdate();
  initSections();
  loadData();
});

// Export for Node.js testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    handleAddItem,
    createListItem,
    getListData,
    validate,
  };
}