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
  const dayButtons = {
    monday: document.getElementById('mondayBtn'),
    tuesday: document.getElementById('tuesdayBtn'),
    wednesday: document.getElementById('wednesdayBtn'),
    thursday: document.getElementById('thursdayBtn'),
    friday: document.getElementById('fridayBtn'),
    saturday: document.getElementById('saturdayBtn'),
    sunday: document.getElementById('sundayBtn')
  };
  const toggleSidebarBtn = document.getElementById('toggleSidebar');
  if (!toggleSidebarBtn) {
    console.error('Toggle sidebar button not found in DOM. Check index.html for id="toggleSidebar"');
    return;
  }
  const sidebar = document.querySelector('.sidebar');
  const mainContent = document.querySelector('.main-content');

  console.log('DOM fully loaded, initializing...');

  // Sidebar Toggle Functionality
  function toggleSidebar() {
    const isClosed = sidebar.classList.toggle('closed');
    mainContent.classList.toggle('with-sidebar', !isClosed);
    console.log('Sidebar toggled:', isClosed ? 'Closed' : 'Open');
  }

  if (toggleSidebarBtn) {
    toggleSidebarBtn.addEventListener('click', toggleSidebar);
  } else {
    console.error('Cannot add click listener to toggleSidebarBtn: element is null');
  }

  // Day Selection via Sidebar
  Object.keys(dayButtons).forEach(day => {
    const button = dayButtons[day];
    if (button) {
      button.addEventListener('click', () => {
        currentDay = day;
        switchDay();
        console.log(`Switched to ${currentDay}`); // Debug: Confirm day switch
      });
    } else {
      console.error(`Day button for ${day} not found`);
    }
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
    month: 'short', // e.g., "Feb"
    day: 'numeric', // e.g., "28"
    hour: 'numeric', // e.g., "8"
    minute: 'numeric', // e.g., "49"
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
      li.parentElement.removeChild(li);
      debouncedSave();
    } else if (event.target.tagName === 'LI') {
      li.classList.toggle('complete');
      debouncedSave();
    }
  }

  // Update Time Display
  function updateTimeDisplay() {
    updateCurrentTime(); // Use existing time update function
  }

  // Switch Day - Enhanced for Debugging
  function switchDay() {
    if (!dayContent) {
      console.error('dayContent element not found');
      return;
    }
    dayContent.classList.add('fade');
    
    Object.keys(dayButtons).forEach(day => {
      const button = dayButtons[day];
      if (button) {
        button.classList.remove('active');
        if (day === currentDay) {
          button.classList.add('active');
        }
      }
    });

    setTimeout(() => {
      loadData();
      initSections(); // Reinitialize to ensure add buttons work after switching
      console.log(`Loaded data for ${currentDay}:`, localStorage.getItem(`data-${currentDay}`)); // Debug: Log loaded data
      dayContent.classList.remove('fade');
    }, 300);
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

  // Save Data with Debounce
  const debouncedSave = debounce(saveData, 500);

  function saveData() {
    const data = {
      meals: {},
      activity: [],
      notes: notesInput.value
    };

    document.querySelectorAll('.meal-section').forEach(section => {
      const mealType = section.querySelector('.meal-list').dataset.meal;
      data.meals[mealType] = getListData(section.querySelector('.meal-list'));
    });

    const activitySection = document.querySelector('.activity-section');
    data.activity = getListData(activitySection.querySelector('.meal-list'));

    // CHANGE: Removed currentMonth from key
    // Explanation: Since we removed month navigation, use only currentDay for storage
    const key = `data-${currentDay}`;
    localStorage.setItem(key, JSON.stringify(data));
    console.log(`Auto-saved data for ${key}:`, data);
  }

  // Load Data - Enhanced for Debugging
  function loadData() {
    // CHANGE: Removed currentMonth from key
    // Explanation: Simplified key to use only currentDay, fixing the undefined error
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
  }
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

  // Event Listeners
  if (saveNotesBtn) saveNotesBtn.addEventListener('click', saveData);
  if (saveDataBtn) saveDataBtn.addEventListener('click', saveData);
  if (loadDataBtn) loadDataBtn.addEventListener('click', loadData);

  // Initialize
  console.log('Initial setup starting...');
  updateTimeDisplay();
  initSections();
  loadData(); // Load initial data for default day (monday)
});