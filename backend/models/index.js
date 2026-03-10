const sequelize = require('../config/database');
const UserFactory = require('./User');
const ProjectFactory = require('./Project');
const TaskFactory = require('./Task');
const ActivityFactory = require('./Activity');

const User = UserFactory(sequelize);
const Project = ProjectFactory(sequelize);
const Task = TaskFactory(sequelize);
const Activity = ActivityFactory(sequelize);

// User associations
User.hasMany(Project, { foreignKey: 'ownerId', as: 'ownedProjects' });
User.hasMany(Task, { foreignKey: 'assigneeId', as: 'assignedTasks' });
User.hasMany(Activity, { foreignKey: 'userId' });

// Project associations
Project.belongsTo(User, { foreignKey: 'ownerId', as: 'owner' });
Project.hasMany(Task, { foreignKey: 'projectId', onDelete: 'CASCADE' });
Project.hasMany(Activity, { foreignKey: 'projectId', onDelete: 'CASCADE' });

// Task associations
Task.belongsTo(Project, { foreignKey: 'projectId' });
Task.belongsTo(User, { foreignKey: 'assigneeId', as: 'assignee' });
Task.hasMany(Activity, { foreignKey: 'taskId', onDelete: 'SET NULL' });

// Activity associations
Activity.belongsTo(User, { foreignKey: 'userId' });
Activity.belongsTo(Project, { foreignKey: 'projectId' });
Activity.belongsTo(Task, { foreignKey: 'taskId' });

module.exports = { sequelize, User, Project, Task, Activity };
