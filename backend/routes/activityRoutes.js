const express = require('express');
const router = express.Router();
const { getActivitiesByProject } = require('../controllers/activityController');
const auth = require('../middleware/auth');
const { apiLimiter } = require('../middleware/rateLimiter');

router.use(apiLimiter);
router.use(auth);

router.get('/project/:projectId', getActivitiesByProject);

module.exports = router;
