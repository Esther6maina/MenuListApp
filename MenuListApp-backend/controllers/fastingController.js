const db = require('../config/database');

exports.trackFasting = async (req, res) => {
  try {
    const { start_time, end_time, duration } = req.body;

    if (!start_time) {
      return res.status(400).json({ error: 'Start time is required' });
    }

    const isoDateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z$/;
    if (!isoDateRegex.test(start_time) || (end_time && !isoDateRegex.test(end_time))) {
      return res.status(400).json({ error: 'Invalid date format. Use ISO 8601 format (e.g., 2025-05-15T13:00:00Z)' });
    }

    db.run(
      'INSERT INTO fasting (user_id, start_time, end_time, duration) VALUES (?, ?, ?, ?)',
      [req.user.id, start_time, end_time || null, duration || null],
      (err) => {
        if (err) {
          console.error('Error saving fasting record:', err);
          return res.status(500).json({ error: 'Failed to save fasting record' });
        }
        res.status(201).json({ message: 'Fasting record saved successfully' });
      }
    );
  } catch (error) {
    console.error('Error in /api/fasting/track:', error);
    res.status(500).json({ error: 'Failed to save fasting record' });
  }
};

exports.getFasting = async (req, res) => {
  try {
    const { day } = req.params;

    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(day)) {
      return res.status(400).json({ error: 'Invalid date format. Use YYYY-MM-DD' });
    }

    db.all('SELECT * FROM fasting WHERE user_id = ? AND start_time LIKE ?', [req.user.id, `${day}%`], (err, rows) => {
      if (err) {
        console.error('Error fetching fasting records:', err);
        return res.status(500).json({ error: 'Failed to fetch fasting records' });
      }
      res.json(rows || []);
    });
  } catch (error) {
    console.error('Error in /api/fasting/track/:day:', error);
    res.status(500).json({ error: 'Failed to fetch fasting records' });
  }
};