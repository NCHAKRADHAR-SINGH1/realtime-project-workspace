const { Op } = require('sequelize');
const { Project, Task, User, Activity, sequelize } = require('../models');
const { success, error } = require('../utils/apiResponse');
const { getPagination, getPagingData } = require('../utils/pagination');

const getProjects = async (req, res, next) => {
  try {
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
        {
          model: Task,
          as: 'tasks',
          attributes: ['id'],
        },
      ],
      limit: lim,
      offset,
      order: [['createdAt', 'DESC']],
      distinct: true,
    });

    return success(res, getPagingData(data, page, limit), 'Projects retrieved');
  } catch (err) {
    next(err);
  }
};

const createProject = async (req, res, next) => {
  try {
    const { title, description } = req.body;
    const project = await Project.create({
      title,
      description,
      ownerId: req.user.id,
    });

    const projectWithOwner = await Project.findByPk(project.id, {
      include: [{ model: User, as: 'owner', attributes: ['id', 'name', 'email', 'avatar'] }],
    });

    return success(res, { project: projectWithOwner }, 'Project created', 201);
  } catch (err) {
    next(err);
  }
};

const getProject = async (req, res, next) => {
  try {
    const { id } = req.params;

    const project = await Project.findByPk(id, {
      include: [
        { model: User, as: 'owner', attributes: ['id', 'name', 'email', 'avatar'] },
        {
          model: Task,
          as: 'tasks',
          include: [{ model: User, as: 'assignee', attributes: ['id', 'name', 'email', 'avatar'] }],
          order: [['position', 'ASC']],
        },
      ],
    });

    if (!project) {
      return error(res, 'Project not found', 404);
    }

    return success(res, { project }, 'Project retrieved');
  } catch (err) {
    next(err);
  }
};

const updateProject = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, description } = req.body;

    const project = await Project.findByPk(id);
    if (!project) {
      return error(res, 'Project not found', 404);
    }

    if (project.ownerId !== req.user.id && req.user.role !== 'admin') {
      return error(res, 'Forbidden', 403);
    }

    await project.update({ title, description });
    return success(res, { project }, 'Project updated');
  } catch (err) {
    next(err);
  }
};

const deleteProject = async (req, res, next) => {
  try {
    const { id } = req.params;

    const project = await Project.findByPk(id);
    if (!project) {
      return error(res, 'Project not found', 404);
    }

    if (project.ownerId !== req.user.id && req.user.role !== 'admin') {
      return error(res, 'Forbidden', 403);
    }

    // Cascade delete tasks and activities
    await Activity.destroy({ where: { projectId: id } });
    await Task.destroy({ where: { projectId: id } });
    await project.destroy();

    return success(res, null, 'Project deleted');
  } catch (err) {
    next(err);
  }
};

const addMember = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { email } = req.body;

    const project = await Project.findByPk(id);
    if (!project) {
      return error(res, 'Project not found', 404);
    }

    if (project.ownerId !== req.user.id && req.user.role !== 'admin') {
      return error(res, 'Forbidden', 403);
    }

    const member = await User.findOne({ where: { email } });
    if (!member) {
      return error(res, 'User not found', 404);
    }

    return success(res, { member }, 'Member info retrieved');
  } catch (err) {
    next(err);
  }
};

const getProjectAnalytics = async (req, res, next) => {
  try {
    const { id } = req.params;

    const project = await Project.findByPk(id);
    if (!project) {
      return error(res, 'Project not found', 404);
    }

    const tasks = await Task.findAll({
      where: { projectId: id },
      include: [{ model: User, as: 'assignee', attributes: ['id', 'name', 'avatar'] }],
    });

    const total = tasks.length;
    const done = tasks.filter((t) => t.status === 'done').length;
    const completionPercentage = total > 0 ? Math.round((done / total) * 100) : 0;

    const tasksByStatus = {
      todo: tasks.filter((t) => t.status === 'todo').length,
      'in-progress': tasks.filter((t) => t.status === 'in-progress').length,
      done,
    };

    const tasksByPriority = {
      low: tasks.filter((t) => t.priority === 'low').length,
      medium: tasks.filter((t) => t.priority === 'medium').length,
      high: tasks.filter((t) => t.priority === 'high').length,
    };

    // Tasks by member
    const memberMap = {};
    tasks.forEach((task) => {
      if (task.assignee) {
        const key = task.assignee.id;
        if (!memberMap[key]) {
          memberMap[key] = { member: task.assignee, count: 0 };
        }
        memberMap[key].count++;
      }
    });
    const tasksByMember = Object.values(memberMap);

    return success(
      res,
      { completionPercentage, tasksByStatus, tasksByPriority, tasksByMember, total },
      'Analytics retrieved'
    );
  } catch (err) {
    next(err);
  }
};

module.exports = { getProjects, createProject, getProject, updateProject, deleteProject, addMember, getProjectAnalytics };
