const express = require('express');
const router = express.Router();
const { getProjectActivities } = require('../controllers/activityController');
const auth = require('../middleware/auth');

router.use(auth);

router.get('/project/:projectId', getProjectActivities);

module.exports = router;
