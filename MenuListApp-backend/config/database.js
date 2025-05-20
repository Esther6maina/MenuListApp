const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./food_tracker.db', (err) => {
  if (err) {
    console.error('Database connection error:', err);
  } else {
    console.log('Connected to SQLite database');
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE,
        email TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL
      )
    `);
    db.run(`
      CREATE TABLE IF NOT EXISTS data (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        day TEXT NOT NULL,
        meals TEXT,
        water TEXT,
        activities TEXT,
        fasting TEXT,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);
    db.run(`
      CREATE TABLE IF NOT EXISTS meals (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        day TEXT NOT NULL,
        category TEXT NOT NULL,
        name TEXT NOT NULL,
        calories INTEGER NOT NULL,
        dayOfWeek TEXT NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);
    db.run(`
      CREATE TABLE IF NOT EXISTS fasting (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        start_time TEXT NOT NULL,
        end_time TEXT,
        duration INTEGER,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);
  }
});

module.exports = db;