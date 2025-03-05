document.addEventListener('DOMContentLoaded', () => {
  let currentDay = 'monday';

  // DOM Elements
  const monthNav = {
    display: document.getElementById('currentTime') // Reused for time display
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

  console.log('DOM fully loaded, initializing...');

  // Collect all items for autocomplete and search
  let allItems = [];
  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  days.forEach(day => {
    const key = `data-${day}`;
    const savedData = localStorage.getItem(key);
    if (savedData) {
      const data = JSON.parse(savedData);
      Object.keys(data.meals).forEach(mealType => {
        data.meals[mealType].forEach(item => {
          allItems.push({ text: item.text, timestamp: item.timestamp, day, type: 'meal', category: mealType });
        });
      });
      data.activity.forEach(item => {
        allItems.push({ text: item.text, timestamp: item.timestamp, day, type: 'activity', category: 'physical-activity' });
      });
    }
  });

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
  function searchItems(query, day = 'all', category = 'all') {
    const results = allItems.filter(item =>
      item.text.toLowerCase().includes(query.toLowerCase()) &&
      (day === 'all' || item.day === day) &&
      (category === 'all' || item.category === category)
    );
    displaySearchResults(results);
  }

  // Display Search Results in Modal with Delete Functionality
  function displaySearchResults(results) {
    searchResults.innerHTML = '';
    if (results.length === 0) {
      searchResults.innerHTML = '<li>No results found.</li>';
    } else {
      results.forEach(item => {
        const li = createListItem(item.text, item.timestamp);
        li.classList.add('search-result');
        li.dataset.day = item.day;
        li.dataset.type = item.type;
        li.dataset.category = item.category;
        searchResults.appendChild(li);

        // Add delete functionality for search results
        const deleteBtn = li.querySelector('.delete-btn');
        deleteBtn.addEventListener('click', () => {
          deleteSearchItem(li, item.day, item.type, item.category, item.text, item.timestamp);
        });
      });
    }
    searchModal.style.display = 'block';
  }

  // Delete Item from Search Results
  function deleteSearchItem(li, day, type, category, text, timestamp) {
    const key = `data-${day}`;
    const savedData = localStorage.getItem(key);
    if (savedData) {
      const data = JSON.parse(savedData);
      if (type === 'meal') {
        data.meals[category] = data.meals[category].filter(item =>
          item.text !== text || item.timestamp !== timestamp
        );
      } else if (type === 'activity') {
        data.activity = data.activity.filter(item =>
          item.text !== text || item.timestamp !== timestamp
        );
      }
      localStorage.setItem(key, JSON.stringify(data));
      li.remove();
      updateTotals(); // Update totals after deletion
      updateAnalytics(); // Update analytics after deletion
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
      showAutocomplete(query); // Show autocomplete suggestions
      searchItems(query, dayFilter.value, categoryFilter.value); // Perform search
    } else {
      autocompleteSuggestions.style.display = 'none';
      searchModal.style.display = 'none';
      searchResults.innerHTML = '';
    }
  });

  // Day and Category Filter Event Listeners
  dayFilter.addEventListener('change', (e) => {
    const query = searchInput.value.trim();
    if (query.length > 0) {
      searchItems(query, e.target.value, categoryFilter.value);
    }
  });

  categoryFilter.addEventListener('change', (e) => {
    const query = searchInput.value.trim();
    if (query.length > 0) {
      searchItems(query, dayFilter.value, e.target.value);
    }
  });

  // Update Day Navigation via Day Filter
  dayFilter.addEventListener('change', (e) => {
    currentDay = e.target.value === 'all' ? 'monday' : e.target.value;
    loadData();
    updateTotals();
    updateAnalytics();
    console.log(`Switched to ${currentDay} via day filter`);
  });

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
    monthNav.display.textContent = timeString; // Update time display
  }

  // Initialize and Update Time Every Second
  updateCurrentTime(); // Set initial time
  setInterval(updateCurrentTime, 1000); // Update every second

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
        const li = createListItem(text);
        list.appendChild(li);
        input.value = '';
        debouncedSave();
      }

      list.removeEventListener('click', handleListClick);
      list.addEventListener('click', handleListClick);
    });
  }

  // Create List Item with Timestamp
  function createListItem(text, timestamp = null) {
    console.log('Creating list item with text:', text, 'Timestamp:', timestamp);
    const li = document.createElement('li');
    const time = timestamp || new Date();
    const timeString = time.toLocaleString('en-US', {
      month: 'short', // e.g., "Mar"
      day: 'numeric', // e.g., "5"
      hour: 'numeric', // e.g., "3"
      minute: 'numeric', // e.g., "30"
      hour12: true // e.g., "PM"
    });
    li.textContent = text; // Text only in content
    li.setAttribute('data-timestamp', timeString);
    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'Delete';
    deleteBtn.className = 'delete-btn';
    li.appendChild(deleteBtn);
    setTimeout(() => li.classList.add('fadeIn'), 10);
    return li;
  }

  // Handle List Clicks
  function handleListClick(event) {
    const li = event.target.closest('li');
    if (!li) return;
  
    if (event.target.className === 'delete-btn') {
      li.classList.add('deleting');
      setTimeout(() => {
        li.parentElement.removeChild(li);
        debouncedSave();
      }, 500); // Match animation duration
    } else if (event.target.tagName === 'LI') {
      li.classList.toggle('complete');
      debouncedSave();
    }
  }

  // Update Time Display
  function updateTimeDisplay() {
    updateCurrentTime(); // Use existing time update function
  }

  // Update Analytics
  function updateAnalytics() {
    const key = `data-${currentDay}`;
    const savedData = localStorage.getItem(key);
    const mealTotals = document.getElementById('mealTotals');

    if (savedData) {
      const data = JSON.parse(savedData);
      let mealCount = 0, activityCount = 0;

      Object.keys(data.meals).forEach(mealType => {
        mealCount += data.meals[mealType].length;
      });
      activityCount = data.activity.length;

      mealTotals.textContent = `Total Meals: ${mealCount} | Total Activities: ${activityCount}`;
    } else {
      mealTotals.textContent = 'No data available for today.';
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
    list.querySelectorAll('li').forEach(li => {
      const [text, timestamp] = li.textContent.replace('Delete', '').trim().split(' - ');
      items.push({
        text: text || '',
        timestamp: timestamp || '',
        completed: li.classList.contains('complete')
      });
    });
    return items;
  }

 // Save Data with Debounce for All Days
 const debouncedSave = debounce(saveData, 500);

 function saveData() {
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

   const key = `data-${currentDay}`;
   localStorage.setItem(key, JSON.stringify(data));
   console.log(`Auto-saved data for ${key}:`, data);
   updateAllItems(); // Update allItems after saving
 }

  // Load Data - Enhanced for Debugging
  function loadData() {
    const key = `data-${currentDay}`;
    const savedData = localStorage.getItem(key);
    console.log(`Attempting to load data for ${key}:`, savedData);

    if (!dayContent) {
      console.error('dayContent element not found for loading data');
      return;
    }

    document.querySelectorAll('.meal-list').forEach(list => list.innerHTML = '');
    notesInput.value = '';

    if (savedData) {
      const data = JSON.parse(savedData);
      console.log('Parsed data:', data);

      Object.keys(data.meals).forEach(mealType => {
        const list = document.querySelector(`.meal-list[data-meal="${mealType}"]`);
        if (list) {
          console.log(`Loading meals for ${mealType}:`, data.meals[mealType]);
          data.meals[mealType].forEach(item => {
            const li = createListItem(item.text, item.timestamp);
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
          const li = createListItem(item.text, item.timestamp);
          if (item.completed) li.classList.add('complete');
          activityList.appendChild(li);
        });
      } else {
        console.error('Activity list not found');
      }

      notesInput.value = data.notes || '';
    } else {
      console.log(`No saved data found for ${key}`);
    }
    updateAnalytics(); // Update analytics after loading data
    updateTotals(); // Ensure totals update as well
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