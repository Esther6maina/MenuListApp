const db = require('../config/database');

exports.getData = async (req, res) => {
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
};

exports.saveData = async (req, res) => {
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
};