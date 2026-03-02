const express = require('express');
const { getRules, updateRule } = require('../controllers/ruleController');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');

const router = express.Router();

// Any authenticated user can read rules (needed for all dashboards)
router.get('/', authMiddleware, getRules);

// Only admins can update rules
router.put('/:id', authMiddleware, roleMiddleware(['admin']), updateRule);

module.exports = router;
