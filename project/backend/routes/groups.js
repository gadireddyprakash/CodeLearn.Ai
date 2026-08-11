const express = require('express');
const router = express.Router();
const {
  createGroup, joinGroup, getMyGroups, getGroup,
  createAssignment, getGroupPerformance,
  postAnnouncement, deleteAnnouncement,
  removeStudent, submitAssignment, deleteGroup,
} = require('../controllers/groupController');
const { protect, authorize } = require('../middleware/auth');

router.post('/',    protect, authorize('teacher', 'admin'), createGroup);
router.post('/join', protect, joinGroup);
router.get('/my',   protect, getMyGroups);

router.get('/:id',                  protect, getGroup);
router.delete('/:groupId',          protect, authorize('teacher', 'admin'), deleteGroup);

// Announcements
router.post('/:groupId/announcements',              protect, authorize('teacher', 'admin'), postAnnouncement);
router.delete('/:groupId/announcements/:annId',     protect, authorize('teacher', 'admin'), deleteAnnouncement);

// Assignments
router.post('/:groupId/assignments',                           protect, authorize('teacher', 'admin'), createAssignment);
router.post('/:groupId/assignments/:assignmentId/submit',      protect, submitAssignment);

// Students
router.delete('/:groupId/students/:studentId', protect, authorize('teacher', 'admin'), removeStudent);

// Performance
router.get('/:groupId/performance', protect, authorize('teacher', 'admin'), getGroupPerformance);

module.exports = router;
