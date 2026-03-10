const { Activity, User, Task, Project } = require('../models');
const asyncHandler = require('../middleware/asyncHandler');
const { success, error } = require('../utils/apiResponse');
const { getPagination, getPagingData } = require('../utils/pagination');

const getActivitiesByProject = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const { page = 1, limit = 20 } = req.query;
  const { limit: lim, offset } = getPagination(page, limit);

  const project = await Project.findByPk(projectId);
  if (!project) {
    return error(res, 'Project not found', 404);
  }

  const data = await Activity.findAndCountAll({
    where: { projectId },
    include: [
      {
        model: User,
        attributes: ['id', 'name', 'avatar'],
      },
      {
        model: Task,
        attributes: ['id', 'title'],
        required: false,
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

module.exports = { getActivitiesByProject };
