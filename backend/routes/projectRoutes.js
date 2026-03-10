const express = require('express');
const router = express.Router();
const {
  getProjects, createProject, getProject, updateProject,
  deleteProject, addMember, getProjectAnalytics,
} = require('../controllers/projectController');
const { createProjectValidator, updateProjectValidator } = require('../validators/projectValidator');
const auth = require('../middleware/auth');

router.use(auth);

router.get('/', getProjects);
router.post('/', createProjectValidator, createProject);
router.get('/:id', getProject);
router.put('/:id', updateProjectValidator, updateProject);
router.delete('/:id', deleteProject);
router.post('/:id/members', addMember);
router.get('/:id/analytics', getProjectAnalytics);

module.exports = router;
