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
app.get('/api/data/:day', (req, res) => {
  const day = req.params.day.toLowerCase();
  const responseData = { meals: {}, activity: [], notes: '' };

  // Get meals
  db.getMealsByDay(day, (err, meals) => {
    if (err) {
      return res.status(500).json({ error: 'Error fetching meals' });
    }

    // Group meals by meal_type
    responseData.meals = {
      breakfast: meals.filter(m => m.meal_type === 'breakfast'),
      lunch: meals.filter(m => m.meal_type === 'lunch'),
      dinner: meals.filter(m => m.meal_type === 'dinner'),
      snacks: meals.filter(m => m.meal_type === 'snacks')
    };

    // Get activities
    db.getActivitiesByDay(day, (err, activities) => {
      if (err) {
        return res.status(500).json({ error: 'Error fetching activities' });
      }
      responseData.activity = activities;

      // Get notes
      db.getNotesByDay(day, (err, note) => {
        if (err) {
          return res.status(500).json({ error: 'Error fetching notes' });
        }
        responseData.notes = note ? note.content : '';

        res.json(responseData);
      });
    });
  });
});

// Save data for a specific day
app.post('/api/data/:day', (req, res) => {
  const day = req.params.day.toLowerCase();
  const { meals, activity, notes } = req.body;

  // Delete existing meals for the day
  db.run(`DELETE FROM meals WHERE day = ?`, [day], (err) => {
    if (err) {
      return res.status(500).json({ error: 'Error clearing meals' });
    }

    // Add new meals
    const mealTypes = ['breakfast', 'lunch', 'dinner', 'snacks'];
    let mealsProcessed = 0;

    mealTypes.forEach(mealType => {
      const mealList = meals[mealType] || [];
      mealList.forEach(meal => {
        db.addMeal({ ...meal, day, meal_type: mealType }, (err) => {
          if (err) {
            console.error(`Error adding ${mealType}:`, err);
          }
          mealsProcessed++;
          if (mealsProcessed === mealTypes.reduce((sum, mt) => sum + (meals[mt] || []).length, 0)) {
            // Delete existing activities
            db.run(`DELETE FROM activities WHERE day = ?`, [day], (err) => {
              if (err) {
                return res.status(500).json({ error: 'Error clearing activities' });
              }

              // Add new activities
              let activitiesProcessed = 0;
              if (activity.length === 0) {
                saveNotes();
                return;
              }

              activity.forEach(act => {
                db.addActivity({ ...act, day }, (err) => {
                  if (err) {
                    console.error('Error adding activity:', err);
                  }
                  activitiesProcessed++;
                  if (activitiesProcessed === activity.length) {
                    saveNotes();
                  }
                });
              });
            });
          }
        });
      });
    });

    if (mealsProcessed === 0) {
      db.run(`DELETE FROM activities WHERE day = ?`, [day], (err) => {
        if (err) {
          return res.status(500).json({ error: 'Error clearing activities' });
        }
        saveNotes();
      });
    }

    function saveNotes() {
      // Delete existing notes for the day
      db.run(`DELETE FROM notes WHERE day = ?`, [day], (err) => {
        if (err) {
          return res.status(500).json({ error: 'Error clearing notes' });
        }

        // Add new notes if content exists
        if (notes) {
          db.saveNotes({ day, content: notes, timestamp: new Date().toISOString() }, (err) => {
            if (err) {
              return res.status(500).json({ error: 'Error saving notes' });
            }
            res.json({ message: 'Data saved successfully' });
          });
        } else {
          res.json({ message: 'Data saved successfully' });
        }
      });
    }
  });
});

// Delete a meal
app.delete('/api/meals/:id', (req, res) => {
  const id = req.params.id;
  db.deleteMeal(id, (err) => {
    if (err) {
      return res.status(500).json({ error: 'Error deleting meal' });
    }
    res.json({ message: 'Meal deleted successfully' });
  });
});

// Delete an activity
app.delete('/api/activities/:id', (req, res) => {
  const id = req.params.id;
  db.deleteActivity(id, (err) => {
    if (err) {
      return res.status(500).json({ error: 'Error deleting activity' });
    }
    res.json({ message: 'Activity deleted successfully' });
  });
});

// Search items
app.get('/api/search', (req, res) => {
  const { query, day, category } = req.query;
  db.searchItems(query, day || 'all', category || 'all', (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Error searching items' });
    }
    res.json(results);
  });
});

// Get search history
app.get('/api/search-history', (req, res) => {
  db.getSearchHistory((err, history) => {
    if (err) {
      return res.status(500).json({ error: 'Error fetching search history' });
    }
    res.json(history);
  });
});

// Add search query
app.post('/api/search-history', (req, res) => {
  const { query } = req.body;
  const timestamp = new Date().toISOString();
  db.addSearchQuery(query, timestamp, (err) => {
    if (err) {
      return res.status(500).json({ error: 'Error saving search query' });
    }
    res.json({ message: 'Search query saved successfully' });
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('Shutting down server...');
  db.close();
  process.exit(0);
});