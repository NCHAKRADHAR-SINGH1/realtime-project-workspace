const { Op } = require('sequelize');
const { Project, Task, Activity, User } = require('../models');
const asyncHandler = require('../middleware/asyncHandler');
const { success, error } = require('../utils/apiResponse');
const { getPagination, getPagingData } = require('../utils/pagination');

const getProjects = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, search } = req.query;
  const { limit: lim, offset } = getPagination(page, limit);

  const where = { ownerId: req.user.id };
  if (search) {
    where.title = { [Op.iLike]: `%${search}%` };
  }

  const data = await Project.findAndCountAll({
    where,
    include: [
      {
        model: User,
        as: 'owner',
        attributes: ['id', 'name', 'email', 'avatar'],
      },
    ],
    limit: lim,
    offset,
    order: [['createdAt', 'DESC']],
    distinct: true,
  });

  const result = getPagingData(data, page, limit);
  return success(res, result);
});

const createProject = asyncHandler(async (req, res) => {
  const { title, description } = req.body;

  const project = await Project.create({
    title,
    description,
    ownerId: req.user.id,
  });

  await Activity.create({
    action: `Created project "${title}"`,
    projectId: project.id,
    userId: req.user.id,
    metadata: { projectTitle: title },
  });

  const projectWithOwner = await Project.findByPk(project.id, {
    include: [
      {
        model: User,
        as: 'owner',
        attributes: ['id', 'name', 'email', 'avatar'],
      },
    ],
  });

  return success(res, { message: 'Project created successfully', project: projectWithOwner }, 201);
});

const getProject = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const project = await Project.findByPk(id, {
    include: [
      {
        model: User,
        as: 'owner',
        attributes: ['id', 'name', 'email', 'avatar'],
      },
    ],
  });

  if (!project) {
    return error(res, 'Project not found', 404);
  }

  const taskCount = await Task.count({ where: { projectId: id } });

  return success(res, { project: { ...project.toJSON(), taskCount } });
});

const updateProject = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { title, description } = req.body;

  const project = await Project.findByPk(id);
  if (!project) {
    return error(res, 'Project not found', 404);
  }

  if (project.ownerId !== req.user.id && req.user.role !== 'admin') {
    return error(res, 'Access denied. Only the owner or admin can update this project.', 403);
  }

  const oldTitle = project.title;
  await project.update({ title, description });

  await Activity.create({
    action: `Updated project "${project.title}"`,
    projectId: project.id,
    userId: req.user.id,
    metadata: { oldTitle, newTitle: project.title },
  });

  return success(res, { message: 'Project updated successfully', project });
});

const deleteProject = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const project = await Project.findByPk(id);
  if (!project) {
    return error(res, 'Project not found', 404);
  }

  if (project.ownerId !== req.user.id && req.user.role !== 'admin') {
    return error(res, 'Access denied. Only the owner or admin can delete this project.', 403);
  }

  const projectTitle = project.title;

  // Activities will cascade-delete; tasks will cascade-delete
  await project.destroy();

  return success(res, { message: `Project "${projectTitle}" deleted successfully` });
});

const addMember = asyncHandler(async (req, res) => {
  // Stub for future members table implementation
  return success(res, { message: 'Member functionality coming soon' });
});

const getAnalytics = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const project = await Project.findByPk(id);
  if (!project) {
    return error(res, 'Project not found', 404);
  }

  const tasks = await Task.findAll({
    where: { projectId: id },
    include: [
      {
        model: User,
        as: 'assignee',
        attributes: ['id', 'name', 'avatar'],
      },
    ],
  });

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === 'done').length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const tasksByStatus = {
    todo: tasks.filter((t) => t.status === 'todo').length,
    'in-progress': tasks.filter((t) => t.status === 'in-progress').length,
    done: completedTasks,
  };

  const tasksByPriority = {
    low: tasks.filter((t) => t.priority === 'low').length,
    medium: tasks.filter((t) => t.priority === 'medium').length,
    high: tasks.filter((t) => t.priority === 'high').length,
  };

  const assigneeMap = {};
  tasks.forEach((task) => {
    if (task.assignee) {
      const key = task.assignee.id;
      if (!assigneeMap[key]) {
        assigneeMap[key] = {
          assignee: task.assignee,
          total: 0,
          completed: 0,
        };
      }
      assigneeMap[key].total += 1;
      if (task.status === 'done') assigneeMap[key].completed += 1;
    }
  });
  const tasksByAssignee = Object.values(assigneeMap);

  return success(res, {
    analytics: {
      totalTasks,
      completedTasks,
      completionRate,
      tasksByStatus,
      tasksByPriority,
      tasksByAssignee,
    },
  });
});

module.exports = {
  getProjects,
  createProject,
  getProject,
  updateProject,
  deleteProject,
  addMember,
  getAnalytics,
};
