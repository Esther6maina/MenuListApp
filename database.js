// database.js
const fs = require('fs').promises;
const path = require('path');

const DB_FILE = path.join(__dirname, 'database.json');

let db = {
  meals: [],
  activities: [],
  notes: [],
  searchHistory: [],
};

let nextMealId = 1;
let nextActivityId = 1;

// Initialize database
async function init() {
  try {
    const data = await fs.readFile(DB_FILE, 'utf8');
    db = JSON.parse(data);
    // Find the highest IDs to avoid conflicts
    nextMealId = db.meals.length > 0 ? Math.max(...db.meals.map(m => m.id)) + 1 : 1;
    nextActivityId = db.activities.length > 0 ? Math.max(...db.activities.map(a => a.id)) + 1 : 1;
  } catch (err) {
    if (err.code === 'ENOENT') {
      // File doesn't exist, create a new one
      await fs.writeFile(DB_FILE, JSON.stringify(db, null, 2));
    } else {
      throw err;
    }
  }
}

// Save database to file
async function save() {
  await fs.writeFile(DB_FILE, JSON.stringify(db, null, 2));
}

// Get meals by day
async function getMealsByDay(day) {
  await init();
  return db.meals.filter(meal => meal.day === day);
}

// Get activities by day
async function getActivitiesByDay(day) {
  await init();
  return db.activities.filter(activity => activity.day === day);
}

// Get notes by day
async function getNotesByDay(day) {
  await init();
  return db.notes.find(note => note.day === day);
}

// Delete meals by day
async function deleteMealsByDay(day) {
  await init();
  db.meals = db.meals.filter(meal => meal.day !== day);
  await save();
}

// Delete activities by day
async function deleteActivitiesByDay(day) {
  await init();
  db.activities = db.activities.filter(activity => activity.day !== day);
  await save();
}

// Delete notes by day
async function deleteNotesByDay(day) {
  await init();
  db.notes = db.notes.filter(note => note.day !== day);
  await save();
}

// Add a meal
async function addMeal(meal) {
  await init();
  const mealWithId = { ...meal, id: nextMealId++ };
  db.meals.push(mealWithId);
  await save();
  return mealWithId;
}

// Add an activity
async function addActivity(activity) {
  await init();
  const activityWithId = { ...activity, id: nextActivityId++ };
  db.activities.push(activityWithId);
  await save();
  return activityWithId;
}

// Delete a meal by ID
async function deleteMeal(id) {
  await init();
  const initialLength = db.meals.length;
  db.meals = db.meals.filter(meal => meal.id !== id);
  await save();
  return initialLength !== db.meals.length;
}

// Delete an activity by ID
async function deleteActivity(id) {
  await init();
  const initialLength = db.activities.length;
  db.activities = db.activities.filter(activity => activity.id !== id);
  await save();
  return initialLength !== db.activities.length;
}

// Save notes
async function saveNotes(note) {
  await init();
  db.notes = db.notes.filter(n => n.day !== note.day); // Remove existing notes for the day
  db.notes.push(note);
  await save();
}

// Search items
async function searchItems(query, day, category) {
  await init();
  const regex = new RegExp(query, 'i');
  const results = [];

  // Search meals
  const meals = day === 'all' ? db.meals : db.meals.filter(m => m.day === day);
  meals.forEach(meal => {
    if (regex.test(meal.text) && (category === 'all' || meal.meal_type === category)) {
      results.push({ ...meal, type: 'meal', category: meal.meal_type });
    }
  });

  // Search activities
  const activities = day === 'all' ? db.activities : db.activities.filter(a => a.day === day);
  if (category === 'all' || category === 'physical-activity') {
    activities.forEach(activity => {
      if (regex.test(activity.text)) {
        results.push({ ...activity, type: 'activity', category: 'physical-activity' });
      }
    });
  }

  return results;
}

// Add search query
async function addSearchQuery(query, timestamp) {
  await init();
  db.searchHistory.push({ query, timestamp });
  if (db.searchHistory.length > 50) {
    db.searchHistory.shift(); // Keep only the last 50 searches
  }
  await save();
}

// Get search history
async function getSearchHistory() {
  await init();
  return db.searchHistory;
}

// Close database (for graceful shutdown)
async function close() {
  await save();
}

module.exports = {
  getMealsByDay,
  getActivitiesByDay,
  getNotesByDay,
  deleteMealsByDay,
  deleteActivitiesByDay,
  deleteNotesByDay,
  addMeal,
  addActivity,
  deleteMeal,
  deleteActivity,
  saveNotes,
  searchItems,
  addSearchQuery,
  getSearchHistory,
  close,
};