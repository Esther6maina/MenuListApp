const express = require('express');
const helmet = require('helmet');

const app = express();

app.use(helmet());

app.get('/test', (req, res) => {
  res.json({ message: 'Test route' });
});

app.listen(3001, () => {
  console.log('Test server running on port 3001');
});