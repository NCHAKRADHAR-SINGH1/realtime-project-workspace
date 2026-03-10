const { Op } = require('sequelize');
const path = require('path');
const { Task, Project, User, Activity } = require('../models');
const { success, error } = require('../utils/apiResponse');
const { getPagination, getPagingData } = require('../utils/pagination');

const getTasks = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const { page = 1, limit = 50, status, priority, assigneeId, search } = req.query;
    const { limit: lim, offset } = getPagination(page, limit);

    const where = { projectId };
    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (assigneeId) where.assigneeId = assigneeId;
    if (search) where.title = { [Op.iLike]: `%${search}%` };

    const data = await Task.findAndCountAll({
      where,
      include: [
        { model: User, as: 'assignee', attributes: ['id', 'name', 'email', 'avatar'] },
      ],
      limit: lim,
      offset,
      order: [['position', 'ASC'], ['createdAt', 'ASC']],
    });

    return success(res, getPagingData(data, page, limit), 'Tasks retrieved');
  } catch (err) {
    next(err);
  }
};

const createTask = async (req, res, next) => {
  try {
    const { title, description, status, priority, projectId, assigneeId, dueDate, position } = req.body;
    const io = req.app.get('io');

    const project = await Project.findByPk(projectId);
    if (!project) {
      return error(res, 'Project not found', 404);
    }

    // Get max position for this status
    const maxPositionTask = await Task.findOne({
      where: { projectId, status: status || 'todo' },
      order: [['position', 'DESC']],
    });
    const newPosition = position !== undefined ? position : (maxPositionTask ? maxPositionTask.position + 1 : 0);

    const task = await Task.create({
      title,
      description,
      status: status || 'todo',
      priority: priority || 'medium',
      position: newPosition,
      projectId,
      assigneeId: assigneeId || null,
      dueDate: dueDate || null,
    });

    const taskWithDetails = await Task.findByPk(task.id, {
      include: [{ model: User, as: 'assignee', attributes: ['id', 'name', 'email', 'avatar'] }],
    });

    // Auto-create activity
    const activity = await Activity.create({
      action: `Created task "${title}"`,
      taskId: task.id,
      projectId,
      userId: req.user.id,
      metadata: { taskTitle: title, status: task.status },
    });

    const activityWithUser = await Activity.findByPk(activity.id, {
      include: [{ model: User, as: 'user', attributes: ['id', 'name', 'avatar'] }],
    });

    // Emit socket events
    if (io) {
      io.to(projectId).emit('task-created', { task: taskWithDetails });
      io.to(projectId).emit('activity-created', { activity: activityWithUser });
    }

    return success(res, { task: taskWithDetails }, 'Task created', 201);
  } catch (err) {
    next(err);
  }
};

const getTask = async (req, res, next) => {
  try {
    const { id } = req.params;
    const task = await Task.findByPk(id, {
      include: [
        { model: User, as: 'assignee', attributes: ['id', 'name', 'email', 'avatar'] },
        { model: Project, as: 'project', attributes: ['id', 'title'] },
      ],
    });

    if (!task) {
      return error(res, 'Task not found', 404);
    }

    return success(res, { task }, 'Task retrieved');
  } catch (err) {
    next(err);
  }
};

const updateTask = async (req, res, next) => {
  try {
    const { id } = req.params;
    const io = req.app.get('io');
    const { title, description, status, priority, assigneeId, dueDate } = req.body;

    const task = await Task.findByPk(id);
    if (!task) {
      return error(res, 'Task not found', 404);
    }

    const changes = [];
    if (title && title !== task.title) changes.push(`title to "${title}"`);
    if (status && status !== task.status) changes.push(`status to ${status}`);
    if (priority && priority !== task.priority) changes.push(`priority to ${priority}`);

    await task.update({
      title: title !== undefined ? title : task.title,
      description: description !== undefined ? description : task.description,
      status: status !== undefined ? status : task.status,
      priority: priority !== undefined ? priority : task.priority,
      assigneeId: assigneeId !== undefined ? (assigneeId || null) : task.assigneeId,
      dueDate: dueDate !== undefined ? (dueDate || null) : task.dueDate,
    });

    const updatedTask = await Task.findByPk(id, {
      include: [{ model: User, as: 'assignee', attributes: ['id', 'name', 'email', 'avatar'] }],
    });

    // Auto-create activity
    const actionText = changes.length > 0 ? `Updated task "${task.title}": ${changes.join(', ')}` : `Updated task "${task.title}"`;
    const activity = await Activity.create({
      action: actionText,
      taskId: id,
      projectId: task.projectId,
      userId: req.user.id,
      metadata: { changes },
    });

    const activityWithUser = await Activity.findByPk(activity.id, {
      include: [{ model: User, as: 'user', attributes: ['id', 'name', 'avatar'] }],
    });

    if (io) {
      io.to(task.projectId).emit('task-updated', { task: updatedTask });
      io.to(task.projectId).emit('activity-created', { activity: activityWithUser });
    }

    return success(res, { task: updatedTask }, 'Task updated');
  } catch (err) {
    next(err);
  }
};

const deleteTask = async (req, res, next) => {
  try {
    const { id } = req.params;
    const io = req.app.get('io');

    const task = await Task.findByPk(id);
    if (!task) {
      return error(res, 'Task not found', 404);
    }

    const projectId = task.projectId;
    const taskTitle = task.title;

    await Activity.destroy({ where: { taskId: id } });
    await task.destroy();

    // Create activity for deletion
    const activity = await Activity.create({
      action: `Deleted task "${taskTitle}"`,
      taskId: null,
      projectId,
      userId: req.user.id,
      metadata: { taskTitle },
    });

    const activityWithUser = await Activity.findByPk(activity.id, {
      include: [{ model: User, as: 'user', attributes: ['id', 'name', 'avatar'] }],
    });

    if (io) {
      io.to(projectId).emit('task-deleted', { taskId: id });
      io.to(projectId).emit('activity-created', { activity: activityWithUser });
    }

    return success(res, null, 'Task deleted');
  } catch (err) {
    next(err);
  }
};

const moveTask = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, position } = req.body;
    const io = req.app.get('io');

    const task = await Task.findByPk(id);
    if (!task) {
      return error(res, 'Task not found', 404);
    }

    const oldStatus = task.status;
    await task.update({ status, position: position !== undefined ? position : task.position });

    const updatedTask = await Task.findByPk(id, {
      include: [{ model: User, as: 'assignee', attributes: ['id', 'name', 'email', 'avatar'] }],
    });

    // Auto-create activity
    const activity = await Activity.create({
      action: `Moved task "${task.title}" from ${oldStatus} to ${status}`,
      taskId: id,
      projectId: task.projectId,
      userId: req.user.id,
      metadata: { from: oldStatus, to: status },
    });

    const activityWithUser = await Activity.findByPk(activity.id, {
      include: [{ model: User, as: 'user', attributes: ['id', 'name', 'avatar'] }],
    });

    if (io) {
      io.to(task.projectId).emit('task-moved', { task: updatedTask, from: oldStatus, to: status });
      io.to(task.projectId).emit('activity-created', { activity: activityWithUser });
    }

    return success(res, { task: updatedTask }, 'Task moved');
  } catch (err) {
    next(err);
  }
};

const uploadAttachment = async (req, res, next) => {
  try {
    const { id } = req.params;

    const task = await Task.findByPk(id);
    if (!task) {
      return error(res, 'Task not found', 404);
    }

    if (!req.file) {
      return error(res, 'No file uploaded', 400);
    }

    const filePath = `/uploads/${req.file.filename}`;
    await task.update({ attachment: filePath });

    return success(res, { attachment: filePath }, 'Attachment uploaded');
  } catch (err) {
    next(err);
  }
};

module.exports = { getTasks, createTask, getTask, updateTask, deleteTask, moveTask, uploadAttachment };
