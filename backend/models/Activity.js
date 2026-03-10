const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Activity = sequelize.define(
    'Activity',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      action: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: { msg: 'Action is required' },
        },
      },
      taskId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: 'tasks',
          key: 'id',
        },
      },
      projectId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'projects',
          key: 'id',
        },
      },
      userId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
      },
      metadata: {
        type: DataTypes.JSONB,
        allowNull: true,
      },
    },
    {
      tableName: 'activities',
      timestamps: true,
      updatedAt: false,
    }
  );

  return Activity;
};
