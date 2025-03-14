document.addEventListener('DOMContentLoaded', () => {
  let currentDay = 'monday';

  // DOM Elements
  const monthNav = {
    display: document.getElementById('currentTime')
  };
  const dayContent = document.getElementById('dayContent');
  const notesInput = document.getElementById('notesInput');
  const saveNotesBtn = document.getElementById('saveNotes');
  const saveDataBtn = document.getElementById('saveData');
  const loadDataBtn = document.getElementById('loadData');
  const searchInput = document.getElementById('searchInput');
  const dayFilter = document.getElementById('dayFilter');
  const categoryFilter = document.getElementById('categoryFilter');
  const searchModal = document.getElementById('searchModal');
  const closeModal = document.querySelector('.close-modal');
  const searchResults = document.getElementById('searchResults');
  const autocompleteSuggestions = document.createElement('ul');
  autocompleteSuggestions.className = 'autocomplete-suggestions';
  searchInput.parentNode.appendChild(autocompleteSuggestions);
  const historyBtn = document.getElementById('historyBtn');

  console.log('DOM fully loaded, initializing...');

  // Collect all items for autocomplete and search
  let allItems = [];
  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  updateAllItems(); // Initialize allItems with current data

  // Fetch all items from the backend for autocomplete and search
  async function updateAllItems() {
    allItems = [];
    try {
      for (const day of days) {
        const response = await fetch(`/api/search?query=&day=${day}`);
        const items = await response.json();
        allItems.push(...items);
      }
    } catch (err) {
      console.error('Error fetching items for autocomplete:', err);
    }
  }

  // Autocomplete Functionality
  function showAutocomplete(query) {
    autocompleteSuggestions.style.display = 'block';
    const suggestions = allItems
      .filter(item => item.text.toLowerCase().includes(query.toLowerCase()))
      .slice(0, 5) // Show top 5 suggestions
      .map(item => item.text);
    autocompleteSuggestions.innerHTML = '';
    if (suggestions.length > 0) {
      suggestions.forEach(suggestion => {
        const li = document.createElement('li');
        li.textContent = suggestion;
        li.addEventListener('click', () => {
          searchInput.value = suggestion;
          autocompleteSuggestions.style.display = 'none';
          searchItems(suggestion, dayFilter.value, categoryFilter.value);
        });
        autocompleteSuggestions.appendChild(li);
      });
    } else {
      autocompleteSuggestions.innerHTML = '<li>No suggestions</li>';
    }
  }

  // Hide Autocomplete on Blur or Outside Click
  searchInput.addEventListener('blur', () => {
    setTimeout(() => autocompleteSuggestions.style.display = 'none', 200);
  });

  window.addEventListener('click', (event) => {
    if (!searchInput.contains(event.target) && !autocompleteSuggestions.contains(event.target)) {
      autocompleteSuggestions.style.display = 'none';
    }
  });

  // Search Functionality with Day and Category Filters
  async function searchItems(query, day = 'all', category = 'all') {
    try {
      const response = await fetch(`/api/search?query=${encodeURIComponent(query)}&day=${day}&category=${category}`);
      const results = await response.json();
      displaySearchResults(results);
    } catch (err) {
      console.error('Error searching items:', err);
      displaySearchResults([]);
    }
  }

  // Display Search Results in Modal with Delete Functionality
  function displaySearchResults(results) {
    searchResults.innerHTML = '';
    if (results.length === 0) {
      searchResults.innerHTML = '<li>No results found.</li>';
    } else {
      results.forEach(item => {
        const li = createListItem(item.text, item.timestamp, item.calories, item.duration);
        li.classList.add('search-result');
        li.dataset.id = item.id;
        li.dataset.day = item.day;
        li.dataset.type = item.type;
        li.dataset.category = item.category;
        searchResults.appendChild(li);

        // Add delete functionality for search results
        const deleteBtn = li.querySelector('.delete-btn');
        deleteBtn.addEventListener('click', () => {
          deleteSearchItem(li, item.id, item.day, item.type, item.category);
        });
      });
    }
    searchModal.style.display = 'block';
  }

  // Delete Item from Search Results
  async function deleteSearchItem(li, id, day, type, category) {
    try {
      const endpoint = type === 'meal' ? `/api/meals/${id}` : `/api/activities/${id}`;
      const response = await fetch(endpoint, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete item');
      li.remove();
      updateTotals();
      updateAnalytics();
      updateAllItems();
    } catch (err) {
      console.error('Error deleting item:', err);
    }
  }

  // Close Modal
  closeModal.addEventListener('click', () => {
    searchModal.style.display = 'none';
  });

  // Close Modal on Outside Click
  window.addEventListener('click', (event) => {
    if (event.target === searchModal) {
      searchModal.style.display = 'none';
    }
  });

  // Search Input Event Listener with Autocomplete and Filters
  searchInput.addEventListener('input', (e) => {
    const query = e.target.value.trim();
    if (query.length > 0) {
      showAutocomplete(query);
      searchItems(query, dayFilter.value, categoryFilter.value);
      saveSearch(query); // Save search history
    } else {
      autocompleteSuggestions.style.display = 'none';
      searchModal.style.display = 'none';
      searchResults.innerHTML = '';
    }
  });

  // Day and Category Filter Event Listeners
  dayFilter.addEventListener('change', (e) => {
    currentDay = e.target.value === 'all' ? 'monday' : e.target.value;
    const query = searchInput.value.trim();
    if (query.length > 0) {
      searchItems(query, e.target.value, categoryFilter.value);
    }
    loadData();
    updateTotals();
    updateAnalytics();
    console.log(`Switched to ${currentDay} via day filter`);
  });

  categoryFilter.addEventListener('change', (e) => {
    const query = searchInput.value.trim();
    if (query.length > 0) {
      searchItems(query, dayFilter.value, e.target.value);
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
      console.error('Error saving search query:', err);
    }
  }

  async function showSearchHistory() {
    try {
      const response = await fetch('/api/search-history');
      const searchHistory = await response.json();

      const historyModal = document.createElement('div');
      historyModal.className = 'modal';
      historyModal.innerHTML = `
        <div class="modal-content">
          <span class="close-modal">×</span>
          <h2>Search History</h2>
          <ul id="searchHistoryList" class="meal-list"></ul>
        </div>
      `;
      document.body.appendChild(historyModal);

      const searchHistoryList = historyModal.querySelector('#searchHistoryList');
      searchHistory.forEach(item => {
        const li = document.createElement('li');
        li.textContent = item.query;
        li.addEventListener('click', () => {
          searchInput.value = item.query;
          searchItems(item.query, dayFilter.value, categoryFilter.value);
          document.body.removeChild(historyModal);
        });
        searchHistoryList.appendChild(li);
      });

      const closeHistoryModal = historyModal.querySelector('.close-modal');
      closeHistoryModal.addEventListener('click', () => document.body.removeChild(historyModal));
      window.addEventListener('click', (event) => {
        if (event.target === historyModal) document.body.removeChild(historyModal);
      });
    } catch (err) {
      console.error('Error fetching search history:', err);
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

  // Auto-Update Current Time
  function updateCurrentTime() {
    const now = new Date();
    const timeString = now.toLocaleString('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short'
    });
    monthNav.display.textContent = timeString;
  }

  // Initialize and Update Time Every Second
  updateCurrentTime();
  setInterval(updateCurrentTime, 1000);

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

      addBtn.removeEventListener('click', handleAddItem);
      addBtn.addEventListener('click', handleAddItem);

      function handleAddItem() {
        console.log('Add button clicked!');
        const text = input.value.trim();
        console.log('Input text:', text);

        if (!text) {
          alert('Please enter an item!');
          console.log('Empty input detected');
          return;
        }

        const existingItems = Array.from(list.querySelectorAll('li')).map(li =>
          li.textContent.split(' - ')[0].trim().toLowerCase()
        );
        console.log('Existing items:', existingItems);

        if (existingItems.includes(text.toLowerCase())) {
          alert('This item already exists!');
          console.log('Duplicate detected');
          return;
        }

        console.log('Creating and adding item:', text);
        const li = createListItem(text, null, null, section.querySelector('.add-activity') ? null : 0);
        list.appendChild(li);
        input.value = '';
        debouncedSave();
      }

      list.removeEventListener('click', handleListClick);
      list.addEventListener('click', handleListClick);
    });
  }

  // Create List Item with Timestamp
  function createListItem(text, timestamp = null, calories = 0, duration = 0) {
    console.log('Creating list item with text:', text, 'Timestamp:', timestamp);
    const li = document.createElement('li');
    const time = timestamp || new Date();
    const timeString = time.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    });
    li.textContent = text;
    li.setAttribute('data-timestamp', timeString);
    li.dataset.calories = calories;
    li.dataset.duration = duration;

    // Prompt for calories for meals
    if (!li.closest('.activity-section')) {
      const calorieInput = prompt('Enter calories for this item (optional):');
      if (calorieInput) li.dataset.calories = parseInt(calorieInput) || 0;
    }

    // Prompt for duration for activities
    if (li.closest('.activity-section')) {
      const durationInput = prompt('Enter duration in minutes (optional):');
      if (durationInput) li.dataset.duration = parseInt(durationInput) || 0;
    }

    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'Delete';
    deleteBtn.className = 'delete-btn';
    li.appendChild(deleteBtn);
    setTimeout(() => li.classList.add('fadeIn'), 10);
    return li;
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
          console.error('Error deleting item:', err);
        }
      }, 500);
    } else if (event.target.tagName === 'LI') {
      li.classList.toggle('complete');
      debouncedSave();
    }
  }

  // Update Time Display
  function updateTimeDisplay() {
    updateCurrentTime();
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
      console.error('Error updating analytics:', err);
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

  // Get List Data
  function getListData(list) {
    const items = [];
    if (list) {
      list.querySelectorAll('li').forEach(li => {
        const [text, timestamp] = li.textContent.replace('Delete', '').trim().split(' - ');
        items.push({
          text: text || '',
          timestamp: timestamp || '',
          completed: li.classList.contains('complete'),
          calories: parseInt(li.dataset.calories) || 0,
          duration: parseInt(li.dataset.duration) || 0
        });
      });
    }
    return items;
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
      console.log(`Data saved for ${currentDay}:`, data);
      updateAllItems();
    } catch (err) {
      console.error('Error saving data:', err);
    }
  }

  // Load Data
  async function loadData() {
    try {
      const response = await fetch(`/api/data/${currentDay}`);
      if (!response.ok) throw new Error('Failed to load data');
      const data = await response.json();
      console.log(`Loaded data for ${currentDay}:`, data);

      if (!dayContent) {
        console.error('dayContent element not found for loading data');
        return;
      }

      document.querySelectorAll('.meal-list').forEach(list => list.innerHTML = '');
      notesInput.value = '';

      Object.keys(data.meals).forEach(mealType => {
        const list = document.querySelector(`.meal-list[data-meal="${mealType}"]`);
        if (list) {
          console.log(`Loading meals for ${mealType}:`, data.meals[mealType]);
          data.meals[mealType].forEach(item => {
            const li = createListItem(item.text, item.timestamp, item.calories, item.duration);
            li.dataset.id = item.id;
            if (item.completed) li.classList.add('complete');
            list.appendChild(li);
          });
        } else {
          console.error(`Meal list for ${mealType} not found`);
        }
      });

      const activityList = document.querySelector('.activity-section .meal-list');
      if (activityList) {
        console.log('Loading activities:', data.activity);
        data.activity.forEach(item => {
          const li = createListItem(item.text, item.timestamp, item.calories, item.duration);
          li.dataset.id = item.id;
          if (item.completed) li.classList.add('complete');
          activityList.appendChild(li);
        });
      } else {
        console.error('Activity list not found');
      }

      notesInput.value = data.notes || '';
      updateAnalytics();
      updateTotals();
    } catch (err) {
      console.error('Error loading data:', err);
    }
  }

  // Event Listeners
  if (saveNotesBtn) saveNotesBtn.addEventListener('click', saveData);
  if (saveDataBtn) saveDataBtn.addEventListener('click', saveData);
  if (loadDataBtn) loadDataBtn.addEventListener('click', loadData);

  // Initialize
  console.log('Initial setup starting...');
  updateTimeDisplay();
  initSections();
  loadData();
});