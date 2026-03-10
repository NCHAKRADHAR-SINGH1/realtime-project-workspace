const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { success, error } = require('../utils/apiResponse');

const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

const register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return error(res, 'Email already in use', 409);
    }

    const user = await User.create({ name, email, password, role: role === 'admin' ? 'admin' : 'member' });
    const token = generateToken(user);

    return success(res, { user, token }, 'Registration successful', 201);
  } catch (err) {
    next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return error(res, 'Invalid credentials', 401);
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return error(res, 'Invalid credentials', 401);
    }

    const token = generateToken(user);
    return success(res, { user, token }, 'Login successful');
  } catch (err) {
    next(err);
  }
};

const getMe = async (req, res, next) => {
  try {
    return success(res, { user: req.user }, 'User retrieved');
  } catch (err) {
    next(err);
  }
};

module.exports = { register, login, getMe };
