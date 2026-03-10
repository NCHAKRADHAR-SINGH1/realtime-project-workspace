const express = require('express');
const router = express.Router();
const {
  getProjects,
  createProject,
  getProject,
  updateProject,
  deleteProject,
  addMember,
  getAnalytics,
} = require('../controllers/projectController');
const {
  createProjectValidator,
  updateProjectValidator,
  validate,
} = require('../validators/projectValidator');
const auth = require('../middleware/auth');

router.use(auth);

router.get('/', getProjects);
router.post('/', createProjectValidator, validate, createProject);
router.get('/:id', getProject);
router.put('/:id', updateProjectValidator, validate, updateProject);
router.delete('/:id', deleteProject);
router.post('/:id/members', addMember);
router.get('/:id/analytics', getAnalytics);

module.exports = router;
