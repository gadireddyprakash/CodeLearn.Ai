const { Group, Assignment } = require('../models/Group');
const Problem = require('../models/Problem');
const User = require('../models/User');
const Submission = require('../models/Submission');

// @desc   Create a group (teacher)
// @route  POST /api/groups
// @access Private (teacher)
const createGroup = async (req, res) => {
  try {
    const { name, description } = req.body;
    const group = await Group.create({ name, description, teacher: req.user._id });
    res.status(201).json({ success: true, group });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Join a group using join code (student)
// @route  POST /api/groups/join
// @access Private
const joinGroup = async (req, res) => {
  try {
    const { joinCode } = req.body;
    const group = await Group.findOne({ joinCode: joinCode.toUpperCase(), isActive: true });
    if (!group) return res.status(404).json({ success: false, message: 'Invalid join code' });

    const alreadyJoined = group.students.some(s => s.user.toString() === req.user._id.toString());
    if (alreadyJoined) return res.status(400).json({ success: false, message: 'Already in this group' });

    group.students.push({ user: req.user._id });
    await group.save();

    // Add group to user
    await User.findByIdAndUpdate(req.user._id, { $addToSet: { groups: group._id } });

    res.json({ success: true, group });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Get teacher's groups / student's groups
// @route  GET /api/groups/my
// @access Private
const getMyGroups = async (req, res) => {
  try {
    let groups;
    if (req.user.role === 'teacher' || req.user.role === 'admin') {
      groups = await Group.find({ teacher: req.user._id })
        .populate('students.user', 'username email stats')
        .populate('assignments', 'title dueDate isActive submissions');
    } else {
      groups = await Group.find({ 'students.user': req.user._id })
        .populate('teacher', 'username email')
        .populate('assignments', 'title dueDate isActive');
    }
    res.json({ success: true, groups });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Get group by ID
// @route  GET /api/groups/:id
// @access Private
const getGroup = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id)
      .populate('teacher', 'username email')
      .populate('students.user', 'username email stats')
      .populate({
        path: 'assignments',
        populate: { path: 'problems', select: 'title difficulty slug' },
      });

    if (!group) return res.status(404).json({ success: false, message: 'Group not found' });
    res.json({ success: true, group });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Create assignment in group (teacher)
// @route  POST /api/groups/:groupId/assignments
// @access Private (teacher)
const createAssignment = async (req, res) => {
  try {
    const { title, description, problemIds, dueDate, maxScore } = req.body;
    const group = await Group.findById(req.params.groupId);
    if (!group) return res.status(404).json({ success: false, message: 'Group not found' });
    if (group.teacher.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const assignment = await Assignment.create({
      title,
      description,
      group: group._id,
      teacher: req.user._id,
      problems: problemIds || [],
      dueDate,
      maxScore: maxScore || 100,
    });

    group.assignments.push(assignment._id);
    await group.save();

    res.status(201).json({ success: true, assignment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Get student performance in group (teacher)
// @route  GET /api/groups/:groupId/performance
// @access Private (teacher)
const getGroupPerformance = async (req, res) => {
  try {
    const group = await Group.findById(req.params.groupId)
      .populate('students.user', 'username email stats')
      .populate({
        path: 'assignments',
        populate: { path: 'submissions.student', select: 'username' },
      });

    if (!group) return res.status(404).json({ success: false, message: 'Group not found' });

    const performance = await Promise.all(
      group.students.map(async (s) => {
        const submissions = await Submission.find({ user: s.user._id })
          .select('status score createdAt problem');

        // Check assignment completions for this student
        const assignmentStatus = await Promise.all(
          (group.assignments || []).map(async (asgn) => {
            const submitted = asgn.submissions?.some(
              sub => sub.student?.toString() === s.user._id.toString()
            );
            return { assignmentId: asgn._id, title: asgn.title, submitted };
          })
        );

        return {
          student: s.user,
          joinedAt: s.joinedAt,
          totalSubmissions: submissions.length,
          accepted: submissions.filter(sub => sub.status === 'Accepted').length,
          score: s.user.stats?.score || 0,
          problemsSolved: s.user.stats?.problemsSolved || 0,
          assignmentStatus,
        };
      })
    );

    res.json({ success: true, performance, totalStudents: group.students.length });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Post announcement to group (teacher)
// @route  POST /api/groups/:groupId/announcements
// @access Private (teacher)
const postAnnouncement = async (req, res) => {
  try {
    const { title, content } = req.body;
    if (!title || !content) {
      return res.status(400).json({ success: false, message: 'Title and content are required' });
    }

    const group = await Group.findById(req.params.groupId);
    if (!group) return res.status(404).json({ success: false, message: 'Group not found' });
    if (group.teacher.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const announcement = { title, content, createdAt: new Date() };
    group.announcements.unshift(announcement); // newest first
    await group.save();

    res.status(201).json({ success: true, announcement: group.announcements[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Delete announcement (teacher)
// @route  DELETE /api/groups/:groupId/announcements/:annId
// @access Private (teacher)
const deleteAnnouncement = async (req, res) => {
  try {
    const group = await Group.findById(req.params.groupId);
    if (!group) return res.status(404).json({ success: false, message: 'Group not found' });
    if (group.teacher.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    group.announcements = group.announcements.filter(
      a => a._id.toString() !== req.params.annId
    );
    await group.save();
    res.json({ success: true, message: 'Announcement deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Remove student from group (teacher)
// @route  DELETE /api/groups/:groupId/students/:studentId
// @access Private (teacher)
const removeStudent = async (req, res) => {
  try {
    const group = await Group.findById(req.params.groupId);
    if (!group) return res.status(404).json({ success: false, message: 'Group not found' });
    if (group.teacher.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    group.students = group.students.filter(
      s => s.user.toString() !== req.params.studentId
    );
    await group.save();

    await User.findByIdAndUpdate(req.params.studentId, { $pull: { groups: group._id } });

    res.json({ success: true, message: 'Student removed' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Mark assignment as submitted by student
// @route  POST /api/groups/:groupId/assignments/:assignmentId/submit
// @access Private (student)
const submitAssignment = async (req, res) => {
  try {
    const { score, submissionId } = req.body;
    const assignment = await Assignment.findById(req.params.assignmentId);
    if (!assignment) return res.status(404).json({ success: false, message: 'Assignment not found' });

    // Check not already submitted
    const already = assignment.submissions.some(
      s => s.student.toString() === req.user._id.toString()
    );
    if (already) return res.status(400).json({ success: false, message: 'Already submitted' });

    assignment.submissions.push({
      student: req.user._id,
      submission: submissionId || undefined,
      score: score || 0,
      submittedAt: new Date(),
    });
    await assignment.save();

    res.json({ success: true, message: 'Assignment submitted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Delete group (teacher)
// @route  DELETE /api/groups/:groupId
// @access Private (teacher)
const deleteGroup = async (req, res) => {
  try {
    const group = await Group.findById(req.params.groupId);
    if (!group) return res.status(404).json({ success: false, message: 'Group not found' });
    if (group.teacher.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    // Remove group ref from all students
    const studentIds = group.students.map(s => s.user);
    await User.updateMany({ _id: { $in: studentIds } }, { $pull: { groups: group._id } });

    await group.deleteOne();
    res.json({ success: true, message: 'Group deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createGroup, joinGroup, getMyGroups, getGroup,
  createAssignment, getGroupPerformance,
  postAnnouncement, deleteAnnouncement,
  removeStudent, submitAssignment, deleteGroup,
};
