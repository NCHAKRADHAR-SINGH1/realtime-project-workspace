const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const {
  getTasks, createTask, getTask, updateTask,
  deleteTask, moveTask, uploadAttachment,
} = require('../controllers/taskController');
const { createTaskValidator, updateTaskValidator } = require('../validators/taskValidator');
const auth = require('../middleware/auth');

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${uniqueSuffix}-${file.originalname}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'text/plain'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type'));
  }
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } });

router.use(auth);

router.get('/project/:projectId', getTasks);
router.post('/', createTaskValidator, createTask);
router.get('/:id', getTask);
router.put('/:id', updateTaskValidator, updateTask);
router.delete('/:id', deleteTask);
router.put('/:id/move', moveTask);
router.post('/:id/attachment', upload.single('file'), uploadAttachment);

module.exports = router;
