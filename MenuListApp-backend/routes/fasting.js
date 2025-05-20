const express = require('express');
const router = express.Router();
const fastingController = require('../controllers/fastingController');
const authenticateToken = require('../middleware/auth');

router.post('/track', authenticateToken, fastingController.trackFasting);
router.get('/track/:day', authenticateToken, fastingController.getFasting);

module.exports = router;