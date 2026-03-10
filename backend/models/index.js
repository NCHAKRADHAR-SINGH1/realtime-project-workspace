const sequelize = require('../config/database');
const User = require('./User');
const Project = require('./Project');
const Task = require('./Task');
const Activity = require('./Activity');

// User associations
User.hasMany(Project, { foreignKey: 'ownerId', as: 'projects' });
User.hasMany(Task, { foreignKey: 'assigneeId', as: 'assignedTasks' });
User.hasMany(Activity, { foreignKey: 'userId', as: 'activities' });

// Project associations
Project.belongsTo(User, { foreignKey: 'ownerId', as: 'owner' });
Project.hasMany(Task, { foreignKey: 'projectId', as: 'tasks', onDelete: 'CASCADE' });
Project.hasMany(Activity, { foreignKey: 'projectId', as: 'activities', onDelete: 'CASCADE' });

// Task associations
Task.belongsTo(Project, { foreignKey: 'projectId', as: 'project' });
Task.belongsTo(User, { foreignKey: 'assigneeId', as: 'assignee' });
Task.hasMany(Activity, { foreignKey: 'taskId', as: 'activities', onDelete: 'SET NULL' });

// Activity associations
Activity.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Activity.belongsTo(Project, { foreignKey: 'projectId', as: 'project' });
Activity.belongsTo(Task, { foreignKey: 'taskId', as: 'task' });

module.exports = {
  sequelize,
  User,
  Project,
  Task,
  Activity,
};
