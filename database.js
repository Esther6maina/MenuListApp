const sqlite3 = require('sqlite3').verbose();

// Initialize SQLite database
const db = new sqlite3.Database('./food_tracker.db', (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to SQLite database.');
  }
});

// Create tables
db.serialize(() => {
  // Table for meals
  db.run(`
    CREATE TABLE IF NOT EXISTS meals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      day TEXT NOT NULL,
      meal_type TEXT NOT NULL,
      text TEXT NOT NULL,
      timestamp TEXT NOT NULL,
      calories INTEGER DEFAULT 0,
      completed BOOLEAN DEFAULT FALSE
    )
  `);

  // Table for activities
  db.run(`
    CREATE TABLE IF NOT EXISTS activities (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      day TEXT NOT NULL,
      text TEXT NOT NULL,
      timestamp TEXT NOT NULL,
      calories INTEGER DEFAULT 0,
      duration INTEGER DEFAULT 0,
      completed BOOLEAN DEFAULT FALSE
    )
  `);

  // Table for notes
  db.run(`
    CREATE TABLE IF NOT EXISTS notes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      day TEXT NOT NULL,
      content TEXT,
      timestamp TEXT NOT NULL
    )
  `);

  // Table for search history (optional, for storing recent searches)
  db.run(`
    CREATE TABLE IF NOT EXISTS search_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      query TEXT NOT NULL,
      timestamp TEXT NOT NULL
    )
  `);
});

// Export database functions
module.exports = {
  // Meals
  getMealsByDay: (day, callback) => {
    const query = `
      SELECT * FROM meals WHERE day = ?
    `;
    db.all(query, [day], callback);
  },

  addMeal: (meal, callback) => {
    const query = `
      INSERT INTO meals (day, meal_type, text, timestamp, calories, completed)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    db.run(
      query,
      [meal.day, meal.meal_type, meal.text, meal.timestamp, meal.calories || 0, meal.completed || false],
      function (err) {
        callback(err, this.lastID);
      }
    );
  },

  updateMeal: (id, updates, callback) => {
    const query = `
      UPDATE meals
      SET text = ?, calories = ?, completed = ?
      WHERE id = ?
    `;
    db.run(
      query,
      [updates.text, updates.calories || 0, updates.completed || false, id],
      callback
    );
  },

  deleteMeal: (id, callback) => {
    const query = `
      DELETE FROM meals WHERE id = ?
    `;
    db.run(query, [id], callback);
  },

  // Activities
  getActivitiesByDay: (day, callback) => {
    const query = `
      SELECT * FROM activities WHERE day = ?
    `;
    db.all(query, [day], callback);
  },

  addActivity: (activity, callback) => {
    const query = `
      INSERT INTO activities (day, text, timestamp, calories, duration, completed)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    db.run(
      query,
      [activity.day, activity.text, activity.timestamp, activity.calories || 0, activity.duration || 0, activity.completed || false],
      function (err) {
        callback(err, this.lastID);
      }
    );
  },

  updateActivity: (id, updates, callback) => {
    const query = `
      UPDATE activities
      SET text = ?, calories = ?, duration = ?, completed = ?
      WHERE id = ?
    `;
    db.run(
      query,
      [updates.text, updates.calories || 0, updates.duration || 0, updates.completed || false, id],
      callback
    );
  },

  deleteActivity: (id, callback) => {
    const query = `
      DELETE FROM activities WHERE id = ?
    `;
    db.run(query, [id], callback);
  },

  // Notes
  getNotesByDay: (day, callback) => {
    const query = `
      SELECT * FROM notes WHERE day = ?
      ORDER BY timestamp DESC LIMIT 1
    `;
    db.get(query, [day], callback);
  },

  saveNotes: (note, callback) => {
    const query = `
      INSERT INTO notes (day, content, timestamp)
      VALUES (?, ?, ?)
    `;
    db.run(query, [note.day, note.content, note.timestamp], function (err) {
      callback(err, this.lastID);
    });
  },

  // Search History
  getSearchHistory: (callback) => {
    const query = `
      SELECT query, timestamp FROM search_history
      ORDER BY timestamp DESC LIMIT 5
    `;
    db.all(query, [], callback);
  },

  addSearchQuery: (query, timestamp, callback) => {
    // First, check if query exists to avoid duplicates
    db.get(`SELECT id FROM search_history WHERE query = ?`, [query], (err, row) => {
      if (row) {
        // If exists, update timestamp
        db.run(
          `UPDATE search_history SET timestamp = ? WHERE id = ?`,
          [timestamp, row.id],
          callback
        );
      } else {
        // Insert new query
        db.run(
          `INSERT INTO search_history (query, timestamp) VALUES (?, ?)`,
          [query, timestamp],
          function (err) {
            // Keep only the latest 5 entries
            db.run(`
              DELETE FROM search_history
              WHERE id NOT IN (
                SELECT id FROM search_history
                ORDER BY timestamp DESC LIMIT 5
              )
            `);
            callback(err, this.lastID);
          }
        );
      }
    });
  },

  // Search Items (meals and activities)
  searchItems: (query, day, category, callback) => {
    let mealsQuery = `
      SELECT id, day, meal_type AS category, text, timestamp, calories, 'meal' AS type
      FROM meals
      WHERE text LIKE ?
    `;
    let activitiesQuery = `
      SELECT id, day, 'physical-activity' AS category, text, timestamp, calories, duration, 'activity' AS type
      FROM activities
      WHERE text LIKE ?
    `;

    const params = [`%${query}%`];
    if (day !== 'all') {
      mealsQuery += ` AND day = ?`;
      activitiesQuery += ` AND day = ?`;
      params.push(day);
    }
    if (category !== 'all' && category !== 'physical-activity') {
      mealsQuery += ` AND meal_type = ?`;
      params.push(category);
    }

    mealsQuery += ` UNION ` + activitiesQuery;

    if (category === 'physical-activity' && day !== 'all') {
      activitiesQuery += ` AND day = ?`;
      params.push(day);
      mealsQuery = activitiesQuery;
    } else if (category === 'physical-activity') {
      mealsQuery = activitiesQuery;
    }

    db.all(mealsQuery, params, callback);
  },

  // Close database on app shutdown (optional)
  close: () => {
    db.close((err) => {
      if (err) {
        console.error('Error closing database:', err.message);
      } else {
        console.log('Database connection closed.');
      }
    });
  }
};