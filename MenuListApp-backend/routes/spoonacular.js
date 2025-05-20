const express = require('express');
const router = express.Router();
const spoonacularController = require('../controllers/spoonacularController');
const authenticateToken = require('../middleware/auth');

router.get('/search', authenticateToken, spoonacularController.searchRecipes);
router.post('/analyze', authenticateToken, spoonacularController.analyzeMeal);

module.exports = router;