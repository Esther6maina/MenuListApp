const express = require('express');
const router = express.Router();
const dataController = require('../controllers/dataController');
const authenticateToken = require('../middleware/auth');

router.get('/:day', authenticateToken, dataController.getData);
router.post('/', authenticateToken, dataController.saveData);

module.exports = router;