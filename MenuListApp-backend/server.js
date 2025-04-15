const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const axios = require('axios');
const helmet = require('helmet');
require('dotenv').config();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
// Configure helmet with specific options
app.use(
  helmet({
    contentSecurityPolicy: false, // Disable CSP for simplicity (can be configured later)
    xPoweredBy: false, // Explicitly disable X-Powered-By header
  })
);

// Configure CORS to allow requests only from your frontend
app.use(cors({ origin: 'http://localhost:3001' }));
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/foodtracker';
mongoose.connect(MONGODB_URI)
  .then(() => console.log('MongoDB connected successfully'))
  .catch(err => console.error('MongoDB connection error:', err));

// Models
const User = require('./models/User');
const Data = require('./models/Data');

// JWT Middleware for Authentication
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Extract token from "Bearer <token>"

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

// Routes

// User Registration
app.post('/api/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Input validation
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Username, email, and password are required' });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Check if user already exists (by username or email)
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      return res.status(400).json({
        error: existingUser.username === username ? 'Username already exists' : 'Email already exists',
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, email, password: hashedPassword });
    await user.save();

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error('Error in /api/register:', error);
    res.status(500).json({ error: 'User registration failed' });
  }
});

// User Login
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Input validation
    if (!username || !password) {
      return res.status(400).json({ error: 'Username or email and password are required' });
    }

    // Find user by username or email
    const user = await User.findOne({ $or: [{ username }, { email: username }] });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'your_jwt_secret', {
      expiresIn: '1h',
    });

    res.json({ token });
  } catch (error) {
    console.error('Error in /api/login:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Save User Data (Meals, Water, Activities, Fasting)
app.post('/api/data', authenticateToken, async (req, res) => {
  try {
    const { meals, water, activities, fasting } = req.body;

    // Input validation
    if (!meals && !water && !activities && !fasting) {
      return res.status(400).json({ error: 'At least one data field (meals, water, activities, fasting) is required' });
    }

    const data = new Data({
      userId: req.user.id,
      day: new Date().toISOString().split('T')[0], // Use current date
      meals: meals || [],
      water: water || [],
      activities: activities || [],
      fasting: fasting || [],
    });

    await data.save();
    res.status(201).json({ message: 'Data saved successfully' });
  } catch (error) {
    console.error('Error in /api/data:', error);
    res.status(500).json({ error: 'Failed to save data' });
  }
});

// Fetch User Data for a Specific Day
app.get('/api/data/:day', authenticateToken, async (req, res) => {
  try {
    const { day } = req.params;

    // Validate date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(day)) {
      return res.status(400).json({ error: 'Invalid date format. Use YYYY-MM-DD' });
    }

    const data = await Data.findOne({ userId: req.user.id, day });

    // If no data exists, return an empty object to match frontend expectations
    if (!data) {
      return res.json({ meals: [], water: [], activities: [], fasting: [] });
    }

    res.json(data);
  } catch (error) {
    console.error('Error in /api/data/:day:', error);
    res.status(500).json({ error: 'Failed to fetch data' });
  }
});

// Spoonacular API Search Route
app.get('/api/spoonacular/search', authenticateToken, async (req, res) => {
  try {
    const { query } = req.query;

    // Input validation
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

// Spoonacular API Analyze Route
app.post('/api/spoonacular/analyze', authenticateToken, async (req, res) => {
  try {
    const { ingredients } = req.body;

    // Input validation
    if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
      return res.status(400).json({ error: 'Ingredients list is required and must be a non-empty array' });
    }

    const SPOONACULAR_API_KEY = process.env.SPOONACULAR_API_KEY;
    if (!SPOONACULAR_API_KEY) {
      return res.status(500).json({ error: 'Spoonacular API key is not configured' });
    }

    // Format ingredients for Spoonacular API
    const ingredientList = ingredients.join('\n');
    const response = await axios.post(
      'https://api.spoonacular.com/recipes/analyze',
      {
        title: 'Custom Meal',
        ingredients: ingredientList,
        servings: 1,
      },
      {
        params: {
          apiKey: SPOONACULAR_API_KEY,
        },
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    res.json(response.data);
  } catch (error) {
    console.error('Spoonacular API error in /api/spoonacular/analyze:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to analyze meal' });
  }
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Something went wrong on the server' });
});

// Start the Server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});