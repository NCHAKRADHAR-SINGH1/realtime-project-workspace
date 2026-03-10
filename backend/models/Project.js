const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Project = sequelize.define(
    'Project',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: { msg: 'Title is required' },
          len: { args: [1, 200], msg: 'Title must be at most 200 characters' },
        },
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      ownerId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
      },
    },
    {
      tableName: 'projects',
      timestamps: true,
    }
  );

  return Project;
};
