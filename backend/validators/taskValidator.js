const { body, validationResult } = require('express-validator');

const createTaskValidator = [
  body('title')
    .notEmpty()
    .withMessage('Title is required')
    .trim()
    .isLength({ max: 200 })
    .withMessage('Title must be at most 200 characters'),
  body('description').optional().trim(),
  body('status')
    .optional()
    .isIn(['todo', 'in-progress', 'done'])
    .withMessage('Status must be one of: todo, in-progress, done'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high'])
    .withMessage('Priority must be one of: low, medium, high'),
  body('projectId')
    .notEmpty()
    .withMessage('Project ID is required')
    .isUUID()
    .withMessage('Project ID must be a valid UUID'),
  body('assigneeId')
    .optional({ nullable: true })
    .isUUID()
    .withMessage('Assignee ID must be a valid UUID'),
  body('dueDate')
    .optional({ nullable: true })
    .isISO8601()
    .withMessage('Due date must be a valid ISO 8601 date'),
];

const updateTaskValidator = [
  body('title')
    .optional()
    .notEmpty()
    .withMessage('Title cannot be empty')
    .trim()
    .isLength({ max: 200 })
    .withMessage('Title must be at most 200 characters'),
  body('description').optional().trim(),
  body('status')
    .optional()
    .isIn(['todo', 'in-progress', 'done'])
    .withMessage('Status must be one of: todo, in-progress, done'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high'])
    .withMessage('Priority must be one of: low, medium, high'),
  body('assigneeId')
    .optional({ nullable: true })
    .isUUID()
    .withMessage('Assignee ID must be a valid UUID'),
  body('dueDate')
    .optional({ nullable: true })
    .isISO8601()
    .withMessage('Due date must be a valid ISO 8601 date'),
];

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: errors.array().map((e) => ({ field: e.path, message: e.msg })),
    });
  }
  next();
};

module.exports = { createTaskValidator, updateTaskValidator, validate };
