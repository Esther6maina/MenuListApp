const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const axios = require('axios');
const helmet = require('helmet');
const sqlite3 = require('sqlite3').verbose();
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

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
  }
});

app.use(
  helmet({
    contentSecurityPolicy: false,
    xPoweredBy: false,
  })
);

app.use(cors({ origin: 'http://localhost:3001' }));
app.use(express.json());

app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access denied: No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
    req.user = decoded;
    next();
  } catch (err) {
    res.status(403).json({ error: 'Invalid token' });
  }
};

app.post('/api/users/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Username, email, and password are required' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    db.get('SELECT * FROM users WHERE username = ? OR email = ?', [username, email], async (err, existingUser) => {
      if (err) {
        console.error('Error checking existing user:', err);
        return res.status(500).json({ error: 'User registration failed' });
      }

      if (existingUser) {
        return res.status(400).json({
          error: existingUser.username === username ? 'Username already exists' : 'Email already exists',
        });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      db.run('INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)', [username, email, hashedPassword], function (err) {
        if (err) {
          console.error('Error inserting user:', err);
          return res.status(500).json({ error: 'User registration failed' });
        }
        res.status(201).json({ message: 'User registered successfully' });
      });
    });
  } catch (error) {
    console.error('Error in /api/users/register:', error);
    res.status(500).json({ error: 'User registration failed' });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!(username || email) || !password) {
      return res.status(400).json({ error: 'Username or email and password are required' });
    }

    db.get('SELECT * FROM users WHERE username = ? OR email = ?', [username || email, email || username], async (err, user) => {
      if (err) {
        console.error('Error finding user:', err);
        return res.status(500).json({ error: 'Login failed' });
      }

      if (!user || !(await bcrypt.compare(password, user.password_hash))) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET || 'your_jwt_secret', { expiresIn: '1h' });
      res.json({ token });
    });
  } catch (error) {
    console.error('Error in /api/login:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

app.post('/api/data', authenticateToken, async (req, res) => {
  try {
    const { meals, water, activities, fasting, day } = req.body;

    if (!meals && !water && !activities && !fasting) {
      return res.status(400).json({ error: 'At least one data field (meals, water, activities, fasting) is required' });
    }

    const date = day || new Date().toISOString().split('T')[0];
    db.run(
      'INSERT OR REPLACE INTO data (user_id, day, meals, water, activities, fasting) VALUES (?, ?, ?, ?, ?, ?)',
      [
        req.user.id,
        date,
        meals ? JSON.stringify(meals) : '[]',
        water ? JSON.stringify(water) : '[]',
        activities ? JSON.stringify(activities) : '[]',
        fasting ? JSON.stringify(fasting) : '[]',
      ],
      (err) => {
        if (err) {
          console.error('Error saving data:', err);
          return res.status(500).json({ error: 'Failed to save data' });
        }
        res.status(201).json({ message: 'Data saved successfully' });
      }
    );
  } catch (error) {
    console.error('Error in /api/data:', error);
    res.status(500).json({ error: 'Failed to save data' });
  }
});

app.get('/api/data/:day', authenticateToken, async (req, res) => {
  try {
    const { day } = req.params;

    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(day)) {
      return res.status(400).json({ error: 'Invalid date format. Use YYYY-MM-DD' });
    }

    db.get('SELECT * FROM data WHERE user_id = ? AND day = ?', [req.user.id, day], (err, data) => {
      if (err) {
        console.error('Error fetching data:', err);
        return res.status(500).json({ error: 'Failed to fetch data' });
      }

      if (!data) {
        return res.json({ meals: [], water: [], activities: [], fasting: [] });
      }

      res.json({
        meals: data.meals ? JSON.parse(data.meals) : [],
        water: data.water ? JSON.parse(data.water) : [],
        activities: data.activities ? JSON.parse(data.activities) : [],
        fasting: data.fasting ? JSON.parse(data.fasting) : [],
      });
    });
  } catch (error) {
    console.error('Error in /api/data/:day:', error);
    res.status(500).json({ error: 'Failed to fetch data' });
  }
});

app.get('/api/spoonacular/search', authenticateToken, async (req, res) => {
  try {
    const { query } = req.query;

    if (!query) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    const SPOONACULAR_API_KEY = process.env.SPOONACULAR_API_KEY;
    if (!SPOONACULAR_API_KEY) {
      return res.status(500).json({ error: 'Spoonacular API key is not configured' });
    }

    const response = await axios.get('https://api.spoonacular.com/recipes/complexSearch', {
      params: {
        query,
        apiKey: SPOONACULAR_API_KEY,
        number: 10,
        addRecipeNutrition: true,
      },
    });

    res.json(response.data.results);
  } catch (error) {
    console.error('Spoonacular API error in /api/spoonacular/search:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to fetch recipes from Spoonacular' });
  }
});

app.post('/api/spoonacular/analyze', authenticateToken, async (req, res) => {
  try {
    const { ingredients } = req.body;

    if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
      return res.status(400).json({ error: 'Ingredients list is required and must be a non-empty array' });
    }

    const SPOONACULAR_API_KEY = process.env.SPOONACULAR_API_KEY;
    if (!SPOONACULAR_API_KEY) {
      return res.status(500).json({ error: 'Spoonacular API key is not configured' });
    }

    const ingredientList = ingredients.join('\n');
    const response = await axios.post(
      'https://api.spoonacular.com/recipes/analyze',
      {
        title: 'Custom Meal',
        ingredients: ingredientList,
        servings: 1,
      },
      {
        params: { apiKey: SPOONACULAR_API_KEY },
        headers: { 'Content-Type': 'application/json' },
      }
    );

    res.json(response.data);
  } catch (error) {
    console.error('Spoonacular API error in /api/spoonacular/analyze:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to analyze meal' });
  }
});

app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Something went wrong on the server' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

process.on('SIGINT', () => {
  db.close((err) => {
    if (err) {
      console.error('Error closing database:', err);
    }
    console.log('Database connection closed');
    process.exit(0);
  });
});