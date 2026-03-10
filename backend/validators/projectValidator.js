const { body, validationResult } = require('express-validator');

const createProjectValidator = [
  body('title')
    .notEmpty()
    .withMessage('Title is required')
    .trim()
    .isLength({ max: 200 })
    .withMessage('Title must be at most 200 characters'),
  body('description')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Description must be at most 1000 characters')
    .trim(),
];

const updateProjectValidator = [
  body('title')
    .optional()
    .notEmpty()
    .withMessage('Title cannot be empty')
    .trim()
    .isLength({ max: 200 })
    .withMessage('Title must be at most 200 characters'),
  body('description')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Description must be at most 1000 characters')
    .trim(),
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

module.exports = { createProjectValidator, updateProjectValidator, validate };
