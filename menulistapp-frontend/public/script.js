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
async function createListItem(text, timestamp = null, calories = 0, duration = 0, id = null, document = global.document) {
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

  // Edit Button
  const editBtn = document.createElement('a');
  editBtn.href = `/edit-food/${id}`;
  editBtn.className = 'icon-btn edit-btn';
  editBtn.title = 'Edit';
  editBtn.innerHTML = '<i class="fas fa-edit"></i>';
  itemContent.appendChild(editBtn);

  // Delete Button
  const deleteBtn = document.createElement('button');
  deleteBtn.className = 'icon-btn delete-btn';
  deleteBtn.title = 'Delete';
  deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
  itemContent.appendChild(deleteBtn);

  // Nutrition Info Link
  const nutritionBtn = document.createElement('a');
  nutritionBtn.href = `/nutrition/${id}`;
  nutritionBtn.className = 'icon-btn';
  nutritionBtn.title = 'View Nutrition';
  nutritionBtn.innerHTML = '<i class="fas fa-info-circle"></i>';
  itemContent.appendChild(nutritionBtn);

  li.appendChild(itemContent);
  li.setAttribute('data-timestamp', timeString);
  li.dataset.calories = calories || 0;
  li.dataset.duration = duration || 0;
  li.dataset.id = id || '';

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
        duration: parseFloat(li.dataset.duration) || 0,
        id: li.dataset.id || ''
      });
    });
  }
  return items;
}

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
    const list = section.querySelector('.meal-list');

    if (!list) {
      console.error('Missing list in section:', { list });
      return;
    }

    list.removeEventListener('click', handleListClick);
    list.addEventListener('click', handleListClick);
  });
}

// Handle List Clicks
async function handleListClick(event) {
  const li = event.target.closest('li');
  if (!li) return;

  if (event.target.closest('.delete-btn')) {
    li.classList.add('deleting');
    setTimeout(async () => {
      try {
        const endpoint = li.closest('.activity-section') ? `/api/activities/${li.dataset.id}` : `/api/meals/${li.dataset.id}`;
        const response = await fetch(endpoint, { method: 'DELETE' });
        if (!response.ok) throw new Error('Failed to delete item');
        li.parentElement.removeChild(li);
        updateTotals();
      } catch (err) {
        console.error('Error deleting item:', err);
      }
    }, 500);
  } else if (event.target.closest('.item-content')) {
    li.classList.toggle('complete');
    debouncedSave();
  }
}

// Update Totals
function updateTotals() {
  const mealLists = document.querySelectorAll('.meal-section .meal-list');
  let mealCount = 0;

  mealLists.forEach(list => mealCount += list.children.length);

  const totalsElement = document.querySelector('.totals');
  if (totalsElement) {
    totalsElement.textContent = `Total Meals: ${mealCount}`;
  }
}

// Save Data with Debounce
const debouncedSave = debounce(saveData, 500);

async function saveData() {
  const dayContent = document.getElementById('dayContent');
  if (!dayContent) return;

  const data = {
    meals: {
      breakfast: getListData(document.querySelector('.meal-section[data-meal="breakfast"] .meal-list')),
      lunch: getListData(document.querySelector('.meal-section[data-meal="lunch"] .meal-list')),
      dinner: getListData(document.querySelector('.meal-section[data-meal="dinner"] .meal-list')),
      snacks: getListData(document.querySelector('.meal-section[data-meal="snacks"] .meal-list'))
    }
  };

  try {
    const response = await fetch(`/api/data/${currentDay}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to save data');
    console.info(`Data saved for ${currentDay}:`, data);
  } catch (err) {
    console.error('Error saving data:', err);
  }
}

// Load Data
async function loadData() {
  const dayContent = document.getElementById('dayContent');
  if (!dayContent) return;

  let currentDay = 'monday';
  try {
    const response = await fetch(`/api/data/${currentDay}`);
    if (!response.ok) throw new Error('Failed to load data');
    const data = await response.json();
    console.info(`Loaded data for ${currentDay}:`, data);

    document.querySelectorAll('.meal-list').forEach(list => list.innerHTML = '');

    Object.keys(data.meals).forEach(mealType => {
      const list = document.querySelector(`.meal-list[data-meal="${mealType}"]`);
      if (list) {
        console.info(`Loading meals for ${mealType}:`, data.meals[mealType]);
        data.meals[mealType].forEach(async item => {
          const li = await createListItem(item.text, item.timestamp, item.calories, item.duration, item.id);
          if (item.completed) li.classList.add('complete');
          list.appendChild(li);
        });
      } else {
        console.error(`Meal list for ${mealType} not found`);
      }
    });

    updateTotals();
  } catch (err) {
    console.error('Error loading data:', err);
  }
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
  const saveDataBtn = document.getElementById('saveData');
  const loadDataBtn = document.getElementById('loadData');

  if (saveDataBtn) saveDataBtn.addEventListener('click', saveData);
  if (loadDataBtn) loadDataBtn.addEventListener('click', loadData);

  initSections();
  loadData();
});

// Export for Node.js testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    createListItem,
    getListData,
    validate,
  };
}