const db = require('../config/database');

exports.planMeal = async (req, res) => {
  try {
    const { day, category, name, calories, dayOfWeek } = req.body;

    if (!day || !category || !name || !calories || !dayOfWeek) {
      return res.status(400).json({ error: 'Day, category, name, calories, and dayOfWeek are required' });
    }

    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(day)) {
      return res.status(400).json({ error: 'Invalid date format. Use YYYY-MM-DD' });
    }

    db.run(
      'INSERT INTO meals (user_id, day, category, name, calories, dayOfWeek) VALUES (?, ?, ?, ?, ?, ?)',
      [req.user.id, day, category, name, parseInt(calories), dayOfWeek],
      (err) => {
        if (err) {
          console.error('Error saving meal plan:', err);
          return res.status(500).json({ error: 'Failed to save meal plan' });
        }
        res.status(201).json({ message: 'Meal plan saved successfully' });
      }
    );
  } catch (error) {
    console.error('Error in /api/meals/plan:', error);
    res.status(500).json({ error: 'Failed to save meal plan' });
  }
};

exports.getMealPlan = async (req, res) => {
  try {
    const { day } = req.params;

    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(day)) {
      return res.status(400).json({ error: 'Invalid date format. Use YYYY-MM-DD' });
    }

    db.all('SELECT * FROM meals WHERE user_id = ? AND day = ?', [req.user.id, day], (err, rows) => {
      if (err) {
        console.error('Error fetching meal plan:', err);
        return res.status(500).json({ error: 'Failed to fetch meal plan' });
      }
      res.json(rows || []);
    });
  } catch (error) {
    console.error('Error in /api/meals/plan/:day:', error);
    res.status(500).json({ error: 'Failed to fetch meal plan' });
  }
};