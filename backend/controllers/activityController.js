const { Activity, User, Project, Task } = require('../models');
const { success, error } = require('../utils/apiResponse');
const { getPagination, getPagingData } = require('../utils/pagination');

const getProjectActivities = async (req, res, next) => {
  try {
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
        { model: User, as: 'user', attributes: ['id', 'name', 'email', 'avatar'] },
        { model: Task, as: 'task', attributes: ['id', 'title'] },
      ],
      limit: lim,
      offset,
      order: [['createdAt', 'DESC']],
    });

    return success(res, getPagingData(data, page, limit), 'Activities retrieved');
  } catch (err) {
    next(err);
  }
};

module.exports = { getProjectActivities };
