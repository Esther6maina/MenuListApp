// server.js
const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./database.js');
const winston = require('winston'); // For logging

const app = express();
const PORT = process.env.PORT || 3000;

// Configure Winston logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'server.log' }),
    new winston.transports.Console(),
  ],
});

// Middleware
app.use(cors()); // Allow cross-origin requests
app.use(express.json()); // Parse JSON bodies
app.use(express.static(path.join(__dirname, 'public'))); // Serve static files (index.html, style.css, script.js)
app.use((req, res, next) => {
  logger.info('Incoming request:', {
    method: req.method,
    url: req.url,
    query: req.query,
    body: req.body,
  });
  next();
});

// API Endpoints

// Get all data for a specific day
app.get('/api/data/:day', async (req, res) => {
  try {
    const day = req.params.day.toLowerCase();
    if (!['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].includes(day)) {
      return res.status(400).json({ error: 'Invalid day parameter' });
    }

    const responseData = { meals: {}, activity: [], notes: '' };

    // Get meals
    const meals = await db.getMealsByDay(day);
    responseData.meals = {
      breakfast: meals.filter(m => m.meal_type === 'breakfast'),
      lunch: meals.filter(m => m.meal_type === 'lunch'),
      dinner: meals.filter(m => m.meal_type === 'dinner'),
      snacks: meals.filter(m => m.meal_type === 'snacks'),
    };

    // Get activities
    responseData.activity = await db.getActivitiesByDay(day);

    // Get notes
    const notes = await db.getNotesByDay(day);
    responseData.notes = notes || '';

    res.json(responseData);
  } catch (err) {
    logger.error('Error fetching data for day:', { day: req.params.day, error: err.message });
    res.status(500).json({ error: 'Failed to fetch data', details: err.message });
  }
});

// Save data for a specific day
app.post('/api/data/:day', async (req, res) => {
  try {
    const day = req.params.day.toLowerCase();
    if (!['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].includes(day)) {
      return res.status(400).json({ error: 'Invalid day parameter' });
    }

    const { meals, activity, notes } = req.body;

    // Validate request body
    if (!meals || !Array.isArray(activity) || typeof notes !== 'string') {
      return res.status(400).json({ error: 'Invalid request body: meals (object), activity (array), and notes (string) are required' });
    }

    // Validate meals structure
    const mealTypes = ['breakfast', 'lunch', 'dinner', 'snacks'];
    for (const mealType of mealTypes) {
      if (!meals[mealType] || !Array.isArray(meals[mealType])) {
        return res.status(400).json({ error: `Invalid meals structure: ${mealType} must be an array` });
      }
    }

    // Delete existing data for the day
    await Promise.all([
      db.deleteMealsByDay(day),
      db.deleteActivitiesByDay(day),
      db.deleteNotesByDay(day),
    ]);

    // Add new meals
    const mealPromises = [];
    mealTypes.forEach(mealType => {
      const mealList = meals[mealType] || [];
      mealList.forEach(meal => {
        if (!meal.text || typeof meal.calories !== 'number') {
          logger.warn('Skipping invalid meal:', { meal, day, mealType });
          return;
        }
        mealPromises.push(
          db.addMeal({ ...meal, day, meal_type: mealType })
        );
      });
    });

    // Add new activities
    const activityPromises = activity.map(act => {
      if (!act.text || typeof act.duration !== 'number') {
        logger.warn('Skipping invalid activity:', { act, day });
        return Promise.resolve();
      }
      return db.addActivity({ ...act, day });
    });

    // Wait for all meals and activities to be added
    await Promise.all([...mealPromises, ...activityPromises]);

    // Add notes if provided
    if (notes.trim()) {
      await db.saveNotes({ day, content: notes, timestamp: new Date().toISOString() });
    }

    res.json({ message: 'Data saved successfully' });
  } catch (err) {
    logger.error('Error saving data for day:', { day: req.params.day, error: err.message });
    res.status(500).json({ error: 'Failed to save data', details: err.message });
  }
});

// Delete a meal
app.delete('/api/meals/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid meal ID' });
    }
    const deleted = await db.deleteMeal(id);
    if (!deleted) {
      return res.status(404).json({ error: 'Meal not found' });
    }
    res.json({ message: 'Meal deleted successfully' });
  } catch (err) {
    logger.error('Error deleting meal:', { id: req.params.id, error: err.message });
    res.status(500).json({ error: 'Failed to delete meal', details: err.message });
  }
});

// Delete an activity
app.delete('/api/activities/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid activity ID' });
    }
    const deleted = await db.deleteActivity(id);
    if (!deleted) {
      return res.status(404).json({ error: 'Activity not found' });
    }
    res.json({ message: 'Activity deleted successfully' });
  } catch (err) {
    logger.error('Error deleting activity:', { id: req.params.id, error: err.message });
    res.status(500).json({ error: 'Failed to delete activity', details: err.message });
  }
});

// Search items
app.get('/api/search', async (req, res) => {
  try {
    const { query, day, category } = req.query;
    if (!query || typeof query !== 'string') {
      return res.status(400).json({ error: 'Query parameter must be a non-empty string' });
    }
    const validDays = ['all', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const validCategories = ['all', 'breakfast', 'lunch', 'dinner', 'snacks', 'physical-activity'];
    if (day && !validDays.includes(day.toLowerCase())) {
      return res.status(400).json({ error: 'Invalid day parameter' });
    }
    if (category && !validCategories.includes(category.toLowerCase())) {
      return res.status(400).json({ error: 'Invalid category parameter' });
    }
    const results = await db.searchItems(query, day || 'all', category || 'all');
    res.json(results);
  } catch (err) {
    logger.error('Error searching items:', { query: req.query, error: err.message });
    res.status(500).json({ error: 'Failed to search items', details: err.message });
  }
});

// Get search history
app.get('/api/search-history', async (req, res) => {
  try {
    const history = await db.getSearchHistory();
    res.json(history);
  } catch (err) {
    logger.error('Error fetching search history:', { error: err.message });
    res.status(500).json({ error: 'Failed to fetch search history', details: err.message });
  }
});

// Add search query
app.post('/api/search-history', async (req, res) => {
  try {
    const { query } = req.body;
    if (!query || typeof query !== 'string' || query.trim() === '') {
      return res.status(400).json({ error: 'Invalid query in request body: must be a non-empty string' });
    }
    const timestamp = new Date().toISOString();
    await db.addSearchQuery(query.trim(), timestamp);
    res.json({ message: 'Search query saved successfully' });
  } catch (err) {
    logger.error('Error saving search query:', { query: req.body, error: err.message });
    res.status(500).json({ error: 'Failed to save search query', details: err.message });
  }
});

// Fallback route to serve index.html for client-side routing (if needed)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start the server
app.listen(PORT, () => {
  logger.info(`Server running on http://localhost:${PORT}`);
});

// Graceful shutdown
const gracefulShutdown = async () => {
  logger.info('Shutting down server...');
  try {
    await db.close();
    logger.info('Database connection closed');
    process.exit(0);
  } catch (err) {
    logger.error('Error during shutdown:', { error: err.message });
    process.exit(1);
  }
};

process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);