const express = require('express');
const cors = require('cors');
const winston = require('winston');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const PORT = process.env.PORT || 3000;

// Configure logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'server.log' }),
    new winston.transports.Console()
  ]
});

// Set up SQLite database
const db = new sqlite3.Database('food_tracker.db', (err) => {
  if (err) {
    logger.error('Error connecting to SQLite database:', err);
  } else {
    logger.info('Connected to SQLite database');
  }
});

// Create tables if they don't exist
db.serialize(() => {
  // Meals table
  db.run(`
    CREATE TABLE IF NOT EXISTS meals (
      id TEXT PRIMARY KEY,
      day TEXT,
      category TEXT,
      text TEXT,
      calories INTEGER,
      timestamp TEXT
    )
  `);

  // Activities table
  db.run(`
    CREATE TABLE IF NOT EXISTS activities (
      id TEXT PRIMARY KEY,
      day TEXT,
      text TEXT,
      calories INTEGER,
      completed BOOLEAN,
      timestamp TEXT
    )
  `);

  // Hydration table
  db.run(`
    CREATE TABLE IF NOT EXISTS hydration (
      id TEXT PRIMARY KEY,
      day TEXT,
      amount REAL,
      timestamp TEXT
    )
  `);

  // Fasting table
  db.run(`
    CREATE TABLE IF NOT EXISTS fasting (
      id TEXT PRIMARY KEY,
      day TEXT,
      startTime TEXT,
      endTime TEXT
    )
  `);
});

app.use(cors({ origin: 'http://localhost:3001' }));
app.use(express.json());

// API routes for meals
app.get('/api/data/:day', (req, res) => {
  const day = req.params.day;
  const meals = { breakfast: [], lunch: [], dinner: [], snacks: [] };

  // Fetch meals
  db.all('SELECT * FROM meals WHERE day = ?', [day], (err, rows) => {
    if (err) {
      logger.error('Error fetching meals:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }

    rows.forEach(row => {
      meals[row.category].push(row);
    });

    // Fetch activities
    db.all('SELECT * FROM activities WHERE day = ?', [day], (err, activities) => {
      if (err) {
        logger.error('Error fetching activities:', err);
        return res.status(500).json({ error: 'Internal server error' });
      }

      res.json({ meals, activity: activities, notes: '' });
    });
  });
});

app.post('/api/data/:day', (req, res) => {
  const day = req.params.day;
  const { meals } = req.body;

  // Clear existing meals for the day
  db.run('DELETE FROM meals WHERE day = ?', [day], (err) => {
    if (err) {
      logger.error('Error deleting meals:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }

    // Insert new meals
    const stmt = db.prepare('INSERT INTO meals (id, day, category, text, calories, timestamp) VALUES (?, ?, ?, ?, ?, ?)');
    Object.keys(meals).forEach(category => {
      meals[category].forEach(meal => {
        stmt.run(meal.id, day, category, meal.text, meal.calories || 0, meal.timestamp);
      });
    });
    stmt.finalize();

    res.status(200).json({ message: 'Data saved' });
  });
});

app.post('/api/meals', (req, res) => {
  const newMeal = { id: Date.now().toString(), ...req.body, calories: 100 };
  db.run(
    'INSERT INTO meals (id, day, category, text, calories, timestamp) VALUES (?, ?, ?, ?, ?, ?)',
    [newMeal.id, newMeal.day, newMeal.category, newMeal.text, newMeal.calories, newMeal.timestamp],
    (err) => {
      if (err) {
        logger.error('Error adding meal:', err);
        return res.status(500).json({ error: 'Internal server error' });
      }
      res.status(201).json(newMeal);
    }
  );
});

app.put('/api/meals/:id', (req, res) => {
  const id = req.params.id;
  const updatedMeal = req.body;
  db.run(
    'UPDATE meals SET day = ?, category = ?, text = ?, calories = ?, timestamp = ? WHERE id = ?',
    [updatedMeal.day, updatedMeal.category, updatedMeal.text, updatedMeal.calories || 0, updatedMeal.timestamp, id],
    (err) => {
      if (err) {
        logger.error('Error updating meal:', err);
        return res.status(500).json({ error: 'Internal server error' });
      }
      res.status(200).json({ message: 'Meal updated' });
    }
  );
});

app.delete('/api/meals/:id', (req, res) => {
  const id = req.params.id;
  db.run('DELETE FROM meals WHERE id = ?', [id], (err) => {
    if (err) {
      logger.error('Error deleting meal:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
    res.status(200).json({ message: 'Meal deleted' });
  });
});

app.get('/api/meals/:id', (req, res) => {
  const id = req.params.id;
  db.get('SELECT * FROM meals WHERE id = ?', [id], (err, row) => {
    if (err) {
      logger.error('Error fetching meal:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
    res.json(row || {});
  });
});

// API routes for activities
app.get('/api/activities/:day', (req, res) => {
  const day = req.params.day;
  db.all('SELECT * FROM activities WHERE day = ?', [day], (err, rows) => {
    if (err) {
      logger.error('Error fetching activities:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
    res.json(rows);
  });
});

app.post('/api/activities', (req, res) => {
  const newActivity = { id: Date.now().toString(), ...req.body, calories: 50 };
  db.run(
    'INSERT INTO activities (id, day, text, calories, completed, timestamp) VALUES (?, ?, ?, ?, ?, ?)',
    [newActivity.id, newActivity.day, newActivity.text, newActivity.calories, newActivity.completed ? 1 : 0, newActivity.timestamp],
    (err) => {
      if (err) {
        logger.error('Error adding activity:', err);
        return res.status(500).json({ error: 'Internal server error' });
      }
      res.status(201).json(newActivity);
    }
  );
});

app.put('/api/activities/:id', (req, res) => {
  const id = req.params.id;
  const updatedActivity = req.body;
  db.run(
    'UPDATE activities SET day = ?, text = ?, calories = ?, completed = ?, timestamp = ? WHERE id = ?',
    [updatedActivity.day, updatedActivity.text, updatedActivity.calories || 0, updatedActivity.completed ? 1 : 0, updatedActivity.timestamp, id],
    (err) => {
      if (err) {
        logger.error('Error updating activity:', err);
        return res.status(500).json({ error: 'Internal server error' });
      }
      res.status(200).json({ message: 'Activity updated' });
    }
  );
});

app.delete('/api/activities/:id', (req, res) => {
  const id = req.params.id;
  db.run('DELETE FROM activities WHERE id = ?', [id], (err) => {
    if (err) {
      logger.error('Error deleting activity:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
    res.status(200).json({ message: 'Activity deleted' });
  });
});

// API routes for hydration
app.get('/api/hydration/:day', (req, res) => {
  const day = req.params.day;
  db.all('SELECT * FROM hydration WHERE day = ?', [day], (err, rows) => {
    if (err) {
      logger.error('Error fetching hydration:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
    res.json(rows);
  });
});

app.post('/api/hydration', (req, res) => {
  const newEntry = { id: Date.now().toString(), ...req.body };
  db.run(
    'INSERT INTO hydration (id, day, amount, timestamp) VALUES (?, ?, ?, ?)',
    [newEntry.id, newEntry.day, newEntry.amount, newEntry.timestamp],
    (err) => {
      if (err) {
        logger.error('Error adding hydration:', err);
        return res.status(500).json({ error: 'Internal server error' });
      }
      res.status(201).json(newEntry);
    }
  );
});

app.delete('/api/hydration/:id', (req, res) => {
  const id = req.params.id;
  db.run('DELETE FROM hydration WHERE id = ?', [id], (err) => {
    if (err) {
      logger.error('Error deleting hydration:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
    res.status(200).json({ message: 'Water entry deleted' });
  });
});

// API routes for fasting
app.get('/api/fasting/:day', (req, res) => {
  const day = req.params.day;
  db.all('SELECT * FROM fasting WHERE day = ?', [day], (err, rows) => {
    if (err) {
      logger.error('Error fetching fasting:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
    res.json(rows);
  });
});

app.post('/api/fasting', (req, res) => {
  const newEntry = { id: Date.now().toString(), ...req.body };
  db.run(
    'INSERT INTO fasting (id, day, startTime, endTime) VALUES (?, ?, ?, ?)',
    [newEntry.id, newEntry.day, newEntry.startTime, newEntry.endTime || null],
    (err) => {
      if (err) {
        logger.error('Error adding fasting:', err);
        return res.status(500).json({ error: 'Internal server error' });
      }
      res.status(201).json(newEntry);
    }
  );
});

app.put('/api/fasting/:id', (req, res) => {
  const id = req.params.id;
  const updatedEntry = req.body;
  db.run(
    'UPDATE fasting SET day = ?, startTime = ?, endTime = ? WHERE id = ?',
    [updatedEntry.day, updatedEntry.startTime, updatedEntry.endTime || null, id],
    (err) => {
      if (err) {
        logger.error('Error updating fasting:', err);
        return res.status(500).json({ error: 'Internal server error' });
      }
      res.status(200).json({ message: 'Fasting updated' });
    }
  );
});

app.delete('/api/fasting/:id', (req, res) => {
  const id = req.params.id;
  db.run('DELETE FROM fasting WHERE id = ?', [id], (err) => {
    if (err) {
      logger.error('Error deleting fasting:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
    res.status(200).json({ message: 'Fasting period deleted' });
  });
});

// Nutritionix API route (simplified)
app.post('/api/nutrition', async (req, res) => {
  res.json({ foods: [{ nf_calories: 100, nf_protein: 5, nf_total_fat: 3, nf_total_carbohydrate: 15 }] });
});

app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});

// Close the database connection on server shutdown
process.on('SIGINT', () => {
  db.close((err) => {
    if (err) {
      logger.error('Error closing database:', err);
    }
    logger.info('Database connection closed');
    process.exit(0);
  });
});