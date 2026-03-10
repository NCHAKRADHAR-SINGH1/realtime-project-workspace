const jwt = require('jsonwebtoken');
const { User } = require('../models');
const asyncHandler = require('../middleware/asyncHandler');
const { success, error } = require('../utils/apiResponse');

const signToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role, name: user.name },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

const register = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;

  const existingUser = await User.findOne({ where: { email } });
  if (existingUser) {
    return error(res, 'Email already registered', 409);
  }

  const user = await User.create({
    name,
    email,
    password,
    role: role === 'admin' ? 'admin' : 'member',
  });

  const token = signToken(user);

  return success(
    res,
    {
      message: 'Registration successful',
      token,
      user: user.toSafeObject(),
    },
    201
  );
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ where: { email } });
  if (!user) {
    return error(res, 'Invalid email or password', 401);
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    return error(res, 'Invalid email or password', 401);
  }

  const token = signToken(user);

  return success(res, {
    message: 'Login successful',
    token,
    user: user.toSafeObject(),
  });
});

const getMe = asyncHandler(async (req, res) => {
  const user = await User.findByPk(req.user.id, {
    attributes: { exclude: ['password'] },
  });

  if (!user) {
    return error(res, 'User not found', 404);
  }

  return success(res, { user });
});

module.exports = { register, login, getMe };
