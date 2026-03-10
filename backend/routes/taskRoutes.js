const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const {
  getTasksByProject,
  createTask,
  getTask,
  updateTask,
  deleteTask,
  moveTask,
  uploadAttachment,
} = require('../controllers/taskController');
const {
  createTaskValidator,
  updateTaskValidator,
  validate,
} = require('../validators/taskValidator');
const auth = require('../middleware/auth');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../uploads'));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${uuidv4()}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|xls|xlsx|txt|zip/;
  const extName = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimeType = allowedTypes.test(file.mimetype);
  if (extName && mimeType) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only images, PDFs, documents, and archives are allowed.'));
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
  fileFilter,
});

router.use(auth);

router.get('/project/:projectId', getTasksByProject);
router.post('/', createTaskValidator, validate, createTask);
router.get('/:id', getTask);
router.put('/:id', updateTaskValidator, validate, updateTask);
router.delete('/:id', deleteTask);
router.put('/:id/move', moveTask);
router.post('/:id/attachment', upload.single('attachment'), uploadAttachment);

module.exports = router;
