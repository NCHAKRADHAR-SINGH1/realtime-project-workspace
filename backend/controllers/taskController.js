const { Op } = require('sequelize');
const { Task, Activity, User, Project } = require('../models');
const asyncHandler = require('../middleware/asyncHandler');
const { success, error } = require('../utils/apiResponse');
const { getPagination, getPagingData } = require('../utils/pagination');

const getTasksByProject = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const { page = 1, limit = 20, status, priority, assigneeId, search } = req.query;
  const { limit: lim, offset } = getPagination(page, limit);

  const where = { projectId };
  if (status) where.status = status;
  if (priority) where.priority = priority;
  if (assigneeId) where.assigneeId = assigneeId;
  if (search) where.title = { [Op.iLike]: `%${search}%` };

  const data = await Task.findAndCountAll({
    where,
    include: [
      {
        model: User,
        as: 'assignee',
        attributes: ['id', 'name', 'email', 'avatar'],
      },
    ],
    limit: lim,
    offset,
    order: [
      ['status', 'ASC'],
      ['position', 'ASC'],
      ['createdAt', 'ASC'],
    ],
    distinct: true,
  });

  const result = getPagingData(data, page, limit);
  return success(res, result);
});

const createTask = asyncHandler(async (req, res) => {
  const { title, description, status, priority, projectId, assigneeId, dueDate } = req.body;

  const project = await Project.findByPk(projectId);
  if (!project) {
    return error(res, 'Project not found', 404);
  }

  const existingCount = await Task.count({ where: { projectId, status: status || 'todo' } });

  const task = await Task.create({
    title,
    description,
    status: status || 'todo',
    priority: priority || 'medium',
    position: existingCount + 1,
    projectId,
    assigneeId: assigneeId || null,
    dueDate: dueDate || null,
  });

  await Activity.create({
    action: `Created task "${title}"`,
    taskId: task.id,
    projectId,
    userId: req.user.id,
    metadata: { taskTitle: title, status: task.status, priority: task.priority },
  });

  const taskWithAssignee = await Task.findByPk(task.id, {
    include: [
      {
        model: User,
        as: 'assignee',
        attributes: ['id', 'name', 'email', 'avatar'],
      },
    ],
  });

  const io = req.app.get('io');
  if (io) {
    io.to(`project:${projectId}`).emit('task-created', { task: taskWithAssignee });
  }

  return success(res, { message: 'Task created successfully', task: taskWithAssignee }, 201);
});

const getTask = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const task = await Task.findByPk(id, {
    include: [
      {
        model: User,
        as: 'assignee',
        attributes: ['id', 'name', 'email', 'avatar'],
      },
      {
        model: Project,
        attributes: ['id', 'title'],
      },
    ],
  });

  if (!task) {
    return error(res, 'Task not found', 404);
  }

  return success(res, { task });
});

const updateTask = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { title, description, status, priority, assigneeId, dueDate } = req.body;

  const task = await Task.findByPk(id);
  if (!task) {
    return error(res, 'Task not found', 404);
  }

  const updates = {};
  if (title !== undefined) updates.title = title;
  if (description !== undefined) updates.description = description;
  if (status !== undefined) updates.status = status;
  if (priority !== undefined) updates.priority = priority;
  if (assigneeId !== undefined) updates.assigneeId = assigneeId || null;
  if (dueDate !== undefined) updates.dueDate = dueDate || null;

  await task.update(updates);

  await Activity.create({
    action: `Updated task "${task.title}"`,
    taskId: task.id,
    projectId: task.projectId,
    userId: req.user.id,
    metadata: updates,
  });

  const updatedTask = await Task.findByPk(id, {
    include: [
      {
        model: User,
        as: 'assignee',
        attributes: ['id', 'name', 'email', 'avatar'],
      },
    ],
  });

  const io = req.app.get('io');
  if (io) {
    io.to(`project:${task.projectId}`).emit('task-updated', { task: updatedTask });
  }

  return success(res, { message: 'Task updated successfully', task: updatedTask });
});

const deleteTask = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const task = await Task.findByPk(id);
  if (!task) {
    return error(res, 'Task not found', 404);
  }

  const { projectId, title } = task;

  await Activity.create({
    action: `Deleted task "${title}"`,
    taskId: null,
    projectId,
    userId: req.user.id,
    metadata: { deletedTaskTitle: title },
  });

  await task.destroy();

  const io = req.app.get('io');
  if (io) {
    io.to(`project:${projectId}`).emit('task-deleted', { taskId: id, projectId });
  }

  return success(res, { message: `Task "${title}" deleted successfully` });
});

const moveTask = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status, position } = req.body;

  const task = await Task.findByPk(id);
  if (!task) {
    return error(res, 'Task not found', 404);
  }

  const oldStatus = task.status;
  const updates = {};
  if (status !== undefined) updates.status = status;
  if (position !== undefined) updates.position = position;

  await task.update(updates);

  await Activity.create({
    action: `Moved task "${task.title}" from ${oldStatus} to ${task.status}`,
    taskId: task.id,
    projectId: task.projectId,
    userId: req.user.id,
    metadata: { oldStatus, newStatus: task.status, position: task.position },
  });

  const updatedTask = await Task.findByPk(id, {
    include: [
      {
        model: User,
        as: 'assignee',
        attributes: ['id', 'name', 'email', 'avatar'],
      },
    ],
  });

  const io = req.app.get('io');
  if (io) {
    io.to(`project:${task.projectId}`).emit('task-moved', { task: updatedTask });
  }

  return success(res, { message: 'Task moved successfully', task: updatedTask });
});

const uploadAttachment = asyncHandler(async (req, res) => {
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

  await Activity.create({
    action: `Attached file to task "${task.title}"`,
    taskId: task.id,
    projectId: task.projectId,
    userId: req.user.id,
    metadata: { filename: req.file.originalname, path: filePath },
  });

  const io = req.app.get('io');
  if (io) {
    io.to(`project:${task.projectId}`).emit('task-updated', {
      task: { id: task.id, attachment: filePath },
    });
  }

  return success(res, {
    message: 'Attachment uploaded successfully',
    attachment: filePath,
    filename: req.file.originalname,
  });
});

module.exports = {
  getTasksByProject,
  createTask,
  getTask,
  updateTask,
  deleteTask,
  moveTask,
  uploadAttachment,
};
