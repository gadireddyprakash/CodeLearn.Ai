const express = require('express');
const router = express.Router();
const { runCode, submitCode, getSubmissions, runLevelCode } = require('../controllers/codeController');
const { protect } = require('../middleware/auth');

router.post('/run', protect, runCode);
router.post('/run-level', protect, runLevelCode);   // for exam per-question run
router.post('/submit/:problemId', protect, submitCode);
router.get('/submissions', protect, getSubmissions);

module.exports = router;
