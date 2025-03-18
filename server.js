// server.js
const express = require('express');
const cors = require('cors');
const db = require('./database.js');

const app = express();
const port = 3000;

// Middleware
app.use(cors()); // Allow cross-origin requests
app.use(express.json()); // Parse JSON bodies
app.use(express.static('.')); // Serve static files (index.html, style.css, script.js)

// API Endpoints

// Get all data for a specific day
app.get('/api/data/:day', async (req, res) => {
  try {
    const day = req.params.day.toLowerCase();
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
    responseData.notes = await db.getNotesByDay(day);

    res.json(responseData);
  } catch (err) {
    console.error('Error fetching data for day:', req.params.day, err);
    res.status(500).json({ error: 'Failed to fetch data', details: err.message });
  }
});

// Save data for a specific day
app.post('/api/data/:day', async (req, res) => {
  try {
    const day = req.params.day.toLowerCase();
    const { meals, activity, notes } = req.body;

    // Validate request body
    if (!meals || !activity || typeof notes !== 'string') {
      return res.status(400).json({ error: 'Invalid request body: meals, activity, and notes are required' });
    }

    // Delete existing data for the day
    await Promise.all([
      db.deleteMealsByDay(day),
      db.deleteActivitiesByDay(day),
      db.deleteNotesByDay(day),
    ]);

    // Add new meals
    const mealPromises = [];
    const mealTypes = ['breakfast', 'lunch', 'dinner', 'snacks'];
    mealTypes.forEach(mealType => {
      const mealList = meals[mealType] || [];
      mealList.forEach(meal => {
        mealPromises.push(
          db.addMeal({ ...meal, day, meal_type: mealType })
        );
      });
    });

    // Add new activities
    const activityPromises = activity.map(act =>
      db.addActivity({ ...act, day })
    );

    // Wait for all meals and activities to be added
    await Promise.all([...mealPromises, ...activityPromises]);

    // Add notes if provided
    if (notes) {
      await db.saveNotes({ day, content: notes, timestamp: new Date().toISOString() });
    }

    res.json({ message: 'Data saved successfully' });
  } catch (err) {
    console.error('Error saving data for day:', req.params.day, err);
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
    await db.deleteMeal(id);
    res.json({ message: 'Meal deleted successfully' });
  } catch (err) {
    console.error('Error deleting meal:', req.params.id, err);
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
    await db.deleteActivity(id);
    res.json({ message: 'Activity deleted successfully' });
  } catch (err) {
    console.error('Error deleting activity:', req.params.id, err);
    res.status(500).json({ error: 'Failed to delete activity', details: err.message });
  }
});

// Search items
app.get('/api/search', async (req, res) => {
  try {
    const { query, day, category } = req.query;
    if (!query) {
      return res.status(400).json({ error: 'Query parameter is required' });
    }
    const results = await db.searchItems(query, day || 'all', category || 'all');
    res.json(results);
  } catch (err) {
    console.error('Error searching items:', req.query, err);
    res.status(500).json({ error: 'Failed to search items', details: err.message });
  }
});

// Get search history
app.get('/api/search-history', async (req, res) => {
  try {
    const history = await db.getSearchHistory();
    res.json(history);
  } catch (err) {
    console.error('Error fetching search history:', err);
    res.status(500).json({ error: 'Failed to fetch search history', details: err.message });
  }
});

// Add search query
app.post('/api/search-history', async (req, res) => {
  try {
    const { query } = req.body;
    if (!query || typeof query !== 'string') {
      return res.status(400).json({ error: 'Invalid query in request body' });
    }
    const timestamp = new Date().toISOString();
    await db.addSearchQuery(query, timestamp);
    res.json({ message: 'Search query saved successfully' });
  } catch (err) {
    console.error('Error saving search query:', req.body, err);
    res.status(500).json({ error: 'Failed to save search query', details: err.message });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

// Graceful shutdown
const gracefulShutdown = async () => {
  console.log('Shutting down server...');
  try {
    await db.close();
    process.exit(0);
  } catch (err) {
    console.error('Error during shutdown:', err);
    process.exit(1);
  }
};

process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);