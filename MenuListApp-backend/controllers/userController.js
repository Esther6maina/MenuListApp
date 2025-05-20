const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database');

exports.register = async (req, res) => {
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
      db.run('INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)', [username, email, hashedPassword], (err) => {
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
};

exports.login = async (req, res) => {
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

      const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
      res.json({ token });
    });
  } catch (error) {
    console.error('Error in /api/login:', error);
    res.status(500).json({ error: 'Login failed' });
  }
};