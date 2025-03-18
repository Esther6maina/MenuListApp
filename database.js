// database.js
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

  // Table for notes with UNIQUE constraint on day
  db.run(`
    CREATE TABLE IF NOT EXISTS notes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      day TEXT NOT NULL UNIQUE,
      content TEXT,
      timestamp TEXT NOT NULL
    )
  `);

  // Table for search history
  db.run(`
    CREATE TABLE IF NOT EXISTS search_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      query TEXT NOT NULL,
      timestamp TEXT NOT NULL
    )
  `);
});

// Helper functions to promisify SQLite operations
const runQuery = (query, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(query, params, function (err) {
      if (err) reject(err);
      else resolve(this);
    });
  });
};

const allQuery = (query, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(query, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

const getQuery = (query, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(query, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

// Export database functions
module.exports = {
  // Meals
  getMealsByDay: async (day) => {
    const query = `SELECT * FROM meals WHERE day = ?`;
    return await allQuery(query, [day]);
  },

  addMeal: async (meal) => {
    const query = `
      INSERT INTO meals (day, meal_type, text, timestamp, calories, completed)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    const result = await runQuery(query, [
      meal.day,
      meal.meal_type,
      meal.text,
      meal.timestamp,
      meal.calories || 0,
      meal.completed ? 1 : 0,
    ]);
    return result.lastID;
  },

  updateMeal: async (id, updates) => {
    const query = `
      UPDATE meals
      SET text = ?, calories = ?, completed = ?
      WHERE id = ?
    `;
    await runQuery(query, [
      updates.text,
      updates.calories || 0,
      updates.completed ? 1 : 0,
      id,
    ]);
  },

  deleteMeal: async (id) => {
    const query = `DELETE FROM meals WHERE id = ?`;
    await runQuery(query, [id]);
  },

  deleteMealsByDay: async (day) => {
    const query = `DELETE FROM meals WHERE day = ?`;
    await runQuery(query, [day]);
  },

  // Activities
  getActivitiesByDay: async (day) => {
    const query = `SELECT * FROM activities WHERE day = ?`;
    return await allQuery(query, [day]);
  },

  addActivity: async (activity) => {
    const query = `
      INSERT INTO activities (day, text, timestamp, calories, duration, completed)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    const result = await runQuery(query, [
      activity.day,
      activity.text,
      activity.timestamp,
      activity.calories || 0,
      activity.duration || 0,
      activity.completed ? 1 : 0,
    ]);
    return result.lastID;
  },

  updateActivity: async (id, updates) => {
    const query = `
      UPDATE activities
      SET text = ?, calories = ?, duration = ?, completed = ?
      WHERE id = ?
    `;
    await runQuery(query, [
      updates.text,
      updates.calories || 0,
      updates.duration || 0,
      updates.completed ? 1 : 0,
      id,
    ]);
  },

  deleteActivity: async (id) => {
    const query = `DELETE FROM activities WHERE id = ?`;
    await runQuery(query, [id]);
  },

  deleteActivitiesByDay: async (day) => {
    const query = `DELETE FROM activities WHERE day = ?`;
    await runQuery(query, [day]);
  },

  // Notes
  getNotesByDay: async (day) => {
    const query = `SELECT * FROM notes WHERE day = ?`;
    const note = await getQuery(query, [day]);
    return note ? note.content : '';
  },

  saveNotes: async (note) => {
    // Use INSERT OR REPLACE to handle the UNIQUE constraint on day
    const query = `
      INSERT OR REPLACE INTO notes (day, content, timestamp)
      VALUES (?, ?, ?)
    `;
    const result = await runQuery(query, [note.day, note.content, note.timestamp]);
    return result.lastID;
  },

  deleteNotesByDay: async (day) => {
    const query = `DELETE FROM notes WHERE day = ?`;
    await runQuery(query, [day]);
  },

  // Search History
  getSearchHistory: async () => {
    const query = `
      SELECT query, timestamp FROM search_history
      ORDER BY timestamp DESC LIMIT 5
    `;
    return await allQuery(query, []);
  },

  addSearchQuery: async (query, timestamp) => {
    const existing = await getQuery(`SELECT id FROM search_history WHERE query = ?`, [query]);
    if (existing) {
      // Update timestamp if query exists
      await runQuery(
        `UPDATE search_history SET timestamp = ? WHERE id = ?`,
        [timestamp, existing.id]
      );
    } else {
      // Insert new query
      const result = await runQuery(
        `INSERT INTO search_history (query, timestamp) VALUES (?, ?)`,
        [query, timestamp]
      );
      // Keep only the latest 5 entries
      await runQuery(`
        DELETE FROM search_history
        WHERE id NOT IN (
          SELECT id FROM search_history
          ORDER BY timestamp DESC LIMIT 5
        )
      `);
      return result.lastID;
    }
  },

  // Search Items (meals and activities)
  searchItems: async (query, day, category) => {
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

    let finalQuery = mealsQuery + ` UNION ` + activitiesQuery;
    if (category === 'physical-activity' && day !== 'all') {
      activitiesQuery += ` AND day = ?`;
      params.push(day); // Push day again for activities query
      finalQuery = activitiesQuery;
    } else if (category === 'physical-activity') {
      finalQuery = activitiesQuery;
    }

    return await allQuery(finalQuery, params);
  },

  // Close database on app shutdown
  close: () => {
    return new Promise((resolve, reject) => {
      db.close((err) => {
        if (err) {
          console.error('Error closing database:', err.message);
          reject(err);
        } else {
          console.log('Database connection closed.');
          resolve();
        }
      });
    });
  },
};