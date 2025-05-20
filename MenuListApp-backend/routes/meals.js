const express = require('express');
const router = express.Router();
const mealController = require('../controllers/mealController');
const authenticateToken = require('../middleware/auth');

router.post('/plan', authenticateToken, mealController.planMeal);
router.get('/plan/:day', authenticateToken, mealController.getMealPlan);

module.exports = router;