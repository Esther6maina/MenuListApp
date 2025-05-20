const express = require('express');
const router = express.Router();
const foodController = require('../controllers/foodController');
const authenticateToken = require('../middleware/auth');

router.get('/search', authenticateToken, foodController.searchFoods);

module.exports = router;