const express = require('express');
const router = express.Router();
const { register, login, getMe } = require('../controllers/authController');
const { registerValidator, loginValidator, validate } = require('../validators/authValidator');
const auth = require('../middleware/auth');

router.post('/register', registerValidator, validate, register);
router.post('/login', loginValidator, validate, login);
router.get('/me', auth, getMe);

module.exports = router;
