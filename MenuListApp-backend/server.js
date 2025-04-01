const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect('mongodb://localhost:27017/foodtracker')
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Models
const User = require('./models/User');
const Data = require('./models/Data');

// JWT Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Access denied' });

  jwt.verify(token, 'your_jwt_secret', (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = user;
    next();
  });
};

// Routes
app.post('/api/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, password: hashedPassword });
    await user.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    res.status(400).json({ error: 'User registration failed' });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const token = jwt.sign({ id: user._id }, 'your_jwt_secret', { expiresIn: '1h' });
    res.json({ token });
  } catch (error) {
    res.status(400).json({ error: 'Login failed' });
  }
});

app.post('/api/data', authenticateToken, async (req, res) => {
  try {
    const { meals, water, activities, fasting } = req.body;
    const data = new Data({
      userId: req.user.id,
      day: new Date().toISOString().split('T')[0],
      meals,
      water,
      activities,
      fasting,
    });
    await data.save();
    res.status(201).json({ message: 'Data saved successfully' });
  } catch (error) {
    res.status(400).json({ error: 'Failed to save data' });
  }
});

app.get('/api/data/:day', authenticateToken, async (req, res) => {
  try {
    const data = await Data.findOne({ userId: req.user.id, day: req.params.day });
    if (!data) return res.status(404).json({ error: 'Data not found' });
    res.json(data);
  } catch (error) {
    res.status(400).json({ error: 'Failed to fetch data' });
  }
});

// Spoonacular API Search Route
app.get('/api/spoonacular/search', authenticateToken, async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    const SPOONACULAR_API_KEY = process.env.SPOONACULAR_API_KEY;

    const response = await axios.get('https://api.spoonacular.com/recipes/complexSearch', {
      params: {
        query: query,
        apiKey: SPOONACULAR_API_KEY,
        number: 10,
        addRecipeNutrition: true,
      },
    });

    res.json(response.data.results);
  } catch (error) {
    console.error('Spoonacular API error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to fetch recipes from Spoonacular' });
  }
});

// Spoonacular API Analyze Route
app.post('/api/spoonacular/analyze', authenticateToken, async (req, res) => {
  try {
    const { ingredients } = req.body;
    if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
      return res.status(400).json({ error: 'Ingredients list is required' });
    }

    const SPOONACULAR_API_KEY = process.env.SPOONACULAR_API_KEY;

    // Format ingredients for Spoonacular API
    const ingredientList = ingredients.join('\n');
    const response = await axios.post('https://api.spoonacular.com/recipes/analyze', {
      title: 'Custom Meal',
      ingredients: ingredientList,
      servings: 1,
    }, {
      params: {
        apiKey: SPOONACULAR_API_KEY,
      },
      headers: {
        'Content-Type': 'application/json',
      },
    });

    res.json(response.data);
  } catch (error) {
    console.error('Spoonacular Analyze API error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to analyze meal' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});