const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const app = express();

// Middleware
app.use(cors({ origin: 'http://localhost:3000' }));
app.use(express.json());

// Mock database (replace with actual database in production)
const users = [];
const userData = {};

// Routes
app.post('/api/users/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    users.push({ username, email, password: hashedPassword });
    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Registration failed' });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = users.find(u => u.email === email);
    if (!user) return res.status(400).json({ error: 'User not found' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ email }, 'your_jwt_secret', { expiresIn: '1h' });
    res.json({ token });
  } catch (err) {
    res.status(500).json({ error: 'Login failed' });
  }
});

app.get('/api/data/:day', (req, res) => {
  const { day } = req.params;
  res.json(userData[day] || { meals: [], water: [], activities: [] });
});

app.post('/api/data', (req, res) => {
  const { meals, day } = req.body;
  userData[day] = { ...userData[day], meals };
  res.json({ message: 'Data saved' });
});

// Mock Spoonacular API endpoint
app.get('/api/spoonacular/search', (req, res) => {
  const { query } = req.query;
  res.json({ results: [{ id: 1, title: `Mock Recipe for ${query}` }] });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));


// const express = require('express');
// const cors = require('cors');
// const helmet = require('helmet');
// require('dotenv').config();

// // Import routes
// const userRoutes = require('./routes/users');
// const dataRoutes = require('./routes/data');
// const foodRoutes = require('./routes/foods');
// const mealRoutes = require('./routes/meals');
// const fastingRoutes = require('./routes/fasting');
// const spoonacularRoutes = require('./routes/spoonacular');

// const app = express();
// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// app.use(
//   helmet({
//     contentSecurityPolicy: false,
//     xPoweredBy: false,
//   })
// );

// app.use(cors({ origin: 'http://localhost:3001' }));
// app.use(express.json());

// app.use((req, res, next) => {
//   console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
//   next();
// });

// // Use routes
// app.use('/api/users', userRoutes);
// app.use('/api/data', dataRoutes);
// app.use('/api/foods', foodRoutes);
// app.use('/api/meals', mealRoutes);
// app.use('/api/fasting', fastingRoutes);
// app.use('/api/spoonacular', spoonacularRoutes);

// app.use((err, req, res, next) => {
//   console.error('Unhandled error:', err);
//   res.status(500).json({ error: 'Something went wrong on the server' });
// });

// app.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
// });