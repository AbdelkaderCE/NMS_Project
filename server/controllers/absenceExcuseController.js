import AbsenceExcuse from '../models/AbsenceExcuse.js';
import Child from '../models/Child.js';
import Staff from '../models/Staff.js';
import Notification from '../models/Notification.js';

/**
 * @desc    Submit absence excuse (Parents only)
 * @route   POST /api/absence-excuses
 * @access  Private (Parent)
 */
export const submitAbsenceExcuse = async (req, res) => {
  try {
    const { child, absenceDate, reason, attachments } = req.body;

    // Verify child exists and parent has access
    const childDoc = await Child.findById(child);
    if (!childDoc) {
      return res.status(404).json({
        success: false,
        message: 'Child not found',
      });
    }

    // Verify parent is linked to this child
    const isParent = childDoc.parents.some(
      (p) => p.parent.toString() === req.user.id
    );

    if (!isParent && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to submit excuse for this child',
      });
    }

    // Check for duplicate excuse for same date
    const existingExcuse = await AbsenceExcuse.findOne({
      child,
      absenceDate: new Date(absenceDate),
    });

    if (existingExcuse) {
      return res.status(400).json({
        success: false,
        message: 'An excuse for this date already exists',
      });
    }

    // Create absence excuse
    const absenceExcuse = await AbsenceExcuse.create({
      child,
      submittedBy: req.user.id,
      absenceDate: new Date(absenceDate),
      reason,
      attachments: attachments || [],
    });

    // Populate child and submittedBy
    await absenceExcuse.populate('child', 'firstName lastName assignedClass');
    await absenceExcuse.populate('submittedBy', 'firstName lastName email');

    // Get teacher assigned to this child's class
    if (childDoc.assignedClass) {
      const teachers = await Staff.find({
        assignedClasses: childDoc.assignedClass,
      }).populate('user', '_id');

      // Create notifications for teachers
      for (const teacher of teachers) {
        await Notification.create({
          recipient: teacher.user._id,
          type: 'absence_excuse_submitted',
          title: 'New Absence Excuse Submitted',
          message: `${childDoc.firstName} ${childDoc.lastName} has a new absence excuse pending review`,
          relatedId: absenceExcuse._id,
          relatedModel: 'AbsenceExcuse',
        });
      }
    }

    res.status(201).json({
      success: true,
      message: 'Absence excuse submitted successfully',
      data: absenceExcuse,
    });
  } catch (error) {
    console.error('Error submitting absence excuse:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error submitting absence excuse',
    });
  }
};

/**
 * @desc    Get all absence excuses (filtered by role)
 * @route   GET /api/absence-excuses
 * @access  Private
 */
export const getAllAbsenceExcuses = async (req, res) => {
  try {
    const { status, startDate, endDate } = req.query;
    let query = {};

    // Filter based on user role
    if (req.user.role === 'parent') {
      // Parents see only their children's excuses
      const children = await Child.find({
        'parents.parent': req.user.id,
      }).select('_id');

      query.child = { $in: children.map((c) => c._id) };
    } else if (req.user.role === 'staff') {
      // Teachers see excuses for children in their classes
      const staff = await Staff.findOne({ user: req.user.id });
      if (staff && staff.assignedClasses && staff.assignedClasses.length > 0) {
        const children = await Child.find({
          assignedClass: { $in: staff.assignedClasses },
        }).select('_id');

        query.child = { $in: children.map((c) => c._id) };
      } else {
        // Teacher with no classes sees nothing
        return res.status(200).json({
          success: true,
          data: [],
          pagination: { total: 0, page: 1 },
        });
      }
    }
    // Admins see all excuses (no filter)

    // Apply status filter
    if (status) {
      query.status = status;
    }

    // Apply date range filter
    if (startDate || endDate) {
      query.absenceDate = {};
      if (startDate) {
        query.absenceDate.$gte = new Date(startDate);
      }
      if (endDate) {
        query.absenceDate.$lte = new Date(endDate);
      }
    }

    const excuses = await AbsenceExcuse.find(query)
      .populate('child', 'firstName lastName assignedClass photo')
      .populate('submittedBy', 'firstName lastName email')
      .populate('reviewedBy', 'employeeId position')
      .populate({
        path: 'reviewedBy',
        populate: { path: 'user', select: 'firstName lastName' },
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: excuses,
      pagination: {
        total: excuses.length,
        page: 1,
      },
    });
  } catch (error) {
    console.error('Error fetching absence excuses:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching absence excuses',
    });
  }
};

/**
 * @desc    Get pending absence excuses for teacher
 * @route   GET /api/absence-excuses/pending
 * @access  Private (Staff)
 */
export const getPendingExcuses = async (req, res) => {
  try {
    if (req.user.role !== 'staff' && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only staff can access pending excuses',
      });
    }

    let excuses;
    if (req.user.role === 'admin') {
      // Admins see all pending excuses
      excuses = await AbsenceExcuse.find({ status: 'pending' })
        .populate('child', 'firstName lastName assignedClass photo')
        .populate('submittedBy', 'firstName lastName email')
        .sort({ absenceDate: -1 });
    } else {
      // Teachers see pending excuses for their classes
      excuses = await AbsenceExcuse.getPendingForTeacher(req.user.id);
    }

    res.status(200).json({
      success: true,
      data: excuses,
      count: excuses.length,
    });
  } catch (error) {
    console.error('Error fetching pending excuses:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching pending excuses',
    });
  }
};

/**
 * @desc    Get single absence excuse
 * @route   GET /api/absence-excuses/:id
 * @access  Private
 */
export const getAbsenceExcuseById = async (req, res) => {
  try {
    const excuse = await AbsenceExcuse.findById(req.params.id)
      .populate('child', 'firstName lastName assignedClass photo')
      .populate('submittedBy', 'firstName lastName email phone')
      .populate('reviewedBy', 'employeeId position')
      .populate({
        path: 'reviewedBy',
        populate: { path: 'user', select: 'firstName lastName' },
      });

    if (!excuse) {
      return res.status(404).json({
        success: false,
        message: 'Absence excuse not found',
      });
    }

    // Authorization check
    const childDoc = await Child.findById(excuse.child._id);
    const isParent = childDoc.parents.some(
      (p) => p.parent.toString() === req.user.id
    );

    if (req.user.role === 'parent' && !isParent) {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
      });
    }

    if (req.user.role === 'staff') {
      const staff = await Staff.findOne({ user: req.user.id });
      const hasAccess =
        staff &&
        staff.assignedClasses &&
        staff.assignedClasses.some(
          (classId) => classId.toString() === childDoc.assignedClass.toString()
        );

      if (!hasAccess) {
        return res.status(403).json({
          success: false,
          message: 'Access denied',
        });
      }
    }

    res.status(200).json({
      success: true,
      data: excuse,
    });
  } catch (error) {
    console.error('Error fetching absence excuse:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching absence excuse',
    });
  }
};

/**
 * @desc    Review absence excuse (Approve/Reject)
 * @route   PUT /api/absence-excuses/:id/review
 * @access  Private (Staff/Admin)
 */
export const reviewAbsenceExcuse = async (req, res) => {
  try {
    const { action, reviewNotes } = req.body;

    if (!['approve', 'reject'].includes(action)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid action. Must be "approve" or "reject"',
      });
    }

    const excuse = await AbsenceExcuse.findById(req.params.id);
    if (!excuse) {
      return res.status(404).json({
        success: false,
        message: 'Absence excuse not found',
      });
    }

    if (excuse.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Excuse has already been ${excuse.status}`,
      });
    }

    // Get staff record
    const staff = await Staff.findOne({ user: req.user.id });
    if (!staff && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only staff can review excuses',
      });
    }

    // Verify teacher has access to this child
    if (req.user.role === 'staff') {
      const childDoc = await Child.findById(excuse.child);
      const hasAccess =
        staff.assignedClasses &&
        staff.assignedClasses.some(
          (classId) => classId.toString() === childDoc.assignedClass.toString()
        );

      if (!hasAccess) {
        return res.status(403).json({
          success: false,
          message: 'You are not authorized to review this excuse',
        });
      }
    }

    // Update excuse
    if (action === 'approve') {
      await excuse.approve(staff?._id || req.user.id, reviewNotes);
    } else {
      await excuse.reject(staff?._id || req.user.id, reviewNotes);
    }

    // Populate fields
    await excuse.populate('child', 'firstName lastName assignedClass');
    await excuse.populate('submittedBy', 'firstName lastName email');
    await excuse.populate('reviewedBy', 'employeeId position');

    // Send notification to parent
    await Notification.create({
      recipient: excuse.submittedBy._id,
      type: `absence_excuse_${action}d`,
      title: `Absence Excuse ${action === 'approve' ? 'Approved' : 'Rejected'}`,
      message: `Your absence excuse for ${excuse.child.firstName} ${excuse.child.lastName} has been ${action}d`,
      relatedId: excuse._id,
      relatedModel: 'AbsenceExcuse',
    });

    res.status(200).json({
      success: true,
      message: `Absence excuse ${action}d successfully`,
      data: excuse,
    });
  } catch (error) {
    console.error('Error reviewing absence excuse:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error reviewing absence excuse',
    });
  }
};

/**
 * @desc    Delete absence excuse (Parent can delete pending only)
 * @route   DELETE /api/absence-excuses/:id
 * @access  Private
 */
export const deleteAbsenceExcuse = async (req, res) => {
  try {
    const excuse = await AbsenceExcuse.findById(req.params.id);
    if (!excuse) {
      return res.status(404).json({
        success: false,
        message: 'Absence excuse not found',
      });
    }

    // Parents can only delete pending excuses they submitted
    if (req.user.role === 'parent') {
      if (excuse.submittedBy.toString() !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'You can only delete your own excuses',
        });
      }

      if (excuse.status !== 'pending') {
        return res.status(400).json({
          success: false,
          message: 'You can only delete pending excuses',
        });
      }
    }

    await excuse.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Absence excuse deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting absence excuse:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error deleting absence excuse',
    });
  }
};
