const express = require('express');
const router = express.Router();
const { getActivitiesByProject } = require('../controllers/activityController');
const auth = require('../middleware/auth');

router.use(auth);

router.get('/project/:projectId', getActivitiesByProject);

module.exports = router;
