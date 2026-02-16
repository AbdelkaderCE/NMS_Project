import DailyReport from '../models/DailyReport.js';
import Child from '../models/Child.js';
import Staff from '../models/Staff.js';
import Attendance from '../models/Attendance.js';
import { notifyDailyReportSent } from '../utils/notificationHelper.js';

/**
 * @desc    Create or update daily report
 * @route   POST /api/daily-reports
 * @access  Private (Staff - Teacher/Assistant)
 */
export const createOrUpdateDailyReport = async (req, res) => {
  try {
    const { child, date, attendance, meals, naps, diaperChanges, mood, activities, incidents, notes } = req.body;

    // Verify child exists
    const childDoc = await Child.findById(child);
    if (!childDoc) {
      return res.status(404).json({
        success: false,
        message: 'Child not found',
      });
    }

    // Verify teacher has access to this child
    if (req.user.role === 'staff') {
      const staff = await Staff.findOne({ user: req.user.id });
      const hasAccess = staff && staff.assignedClasses && staff.assignedClasses.includes(childDoc.assignedClass?.toString());
      
      if (!hasAccess && req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'You are not authorized to create reports for this child',
        });
      }
    }

    // Get staff record
    const staff = await Staff.findOne({ user: req.user.id });
    if (!staff && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only staff can create daily reports',
      });
    }

    // Check if report already exists for this child and date
    const reportDate = new Date(date);
    reportDate.setHours(0, 0, 0, 0);
    
    let dailyReport = await DailyReport.findOne({
      child,
      date: reportDate,
    });

    const isNewReport = !dailyReport;

    if (dailyReport) {
      // Update existing report
      dailyReport.attendance = attendance || dailyReport.attendance;
      dailyReport.meals = meals || dailyReport.meals;
      dailyReport.naps = naps || dailyReport.naps;
      dailyReport.diaperChanges = diaperChanges || dailyReport.diaperChanges;
      dailyReport.mood = mood || dailyReport.mood;
      dailyReport.activities = activities || dailyReport.activities;
      dailyReport.incidents = incidents || dailyReport.incidents;
      dailyReport.notes = notes !== undefined ? notes : dailyReport.notes;
      
      await dailyReport.save();
    } else {
      // Create new report
      dailyReport = await DailyReport.create({
        child,
        date: reportDate,
        attendance,
        meals,
        naps,
        diaperChanges,
        mood,
        activities,
        incidents,
        notes,
        createdBy: staff?._id || req.user.id,
      });
    }

    // Populate fields
    await dailyReport.populate('child', 'firstName lastName photo');
    await dailyReport.populate('createdBy');
    await dailyReport.populate({
      path: 'createdBy',
      populate: { path: 'user', select: 'firstName lastName' },
    });
    await dailyReport.populate('activities', 'title description');

    // Notify parents when report is created or updated
    if (isNewReport) {
      await notifyDailyReportSent(dailyReport._id);
    }

    res.status(isNewReport ? 201 : 200).json({
      success: true,
      message: isNewReport ? 'Daily report created successfully' : 'Daily report updated successfully',
      data: dailyReport,
    });
  } catch (error) {
    console.error('Error creating/updating daily report:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error creating/updating daily report',
    });
  }
};

/**
 * @desc    Get all daily reports (with filters)
 * @route   GET /api/daily-reports
 * @access  Private
 */
export const getAllDailyReports = async (req, res) => {
  try {
    const { child, date, startDate, endDate, status } = req.query;
    let query = {};

    // Filter based on user role
    if (req.user.role === 'parent') {
      // Parents see only their children's reports
      const children = await Child.find({
        'parents.parent': req.user.id,
      }).select('_id');

      query.child = { $in: children.map((c) => c._id) };
    } else if (req.user.role === 'staff') {
      // Teachers see reports for children in their classes
      const staff = await Staff.findOne({ user: req.user.id });
      if (staff && staff.assignedClasses && staff.assignedClasses.length > 0) {
        const children = await Child.find({
          assignedClass: { $in: staff.assignedClasses },
        }).select('_id');

        query.child = { $in: children.map((c) => c._id) };
      } else {
        return res.status(200).json({
          success: true,
          data: [],
        });
      }
    }

    // Apply filters
    if (child) {
      query.child = child;
    }

    if (date) {
      const reportDate = new Date(date);
      reportDate.setHours(0, 0, 0, 0);
      const nextDay = new Date(reportDate);
      nextDay.setDate(nextDay.getDate() + 1);
      
      query.date = { $gte: reportDate, $lt: nextDay };
    }

    if (startDate || endDate) {
      query.date = {};
      if (startDate) {
        query.date.$gte = new Date(startDate);
      }
      if (endDate) {
        query.date.$lte = new Date(endDate);
      }
    }

    if (status) {
      query.status = status;
    }

    const reports = await DailyReport.find(query)
      .populate('child', 'firstName lastName photo assignedClass')
      .populate('createdBy')
      .populate({
        path: 'createdBy',
        populate: { path: 'user', select: 'firstName lastName' },
      })
      .populate('activities', 'title description type')
      .sort({ date: -1 });

    res.status(200).json({
      success: true,
      data: reports,
      count: reports.length,
    });
  } catch (error) {
    console.error('Error fetching daily reports:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching daily reports',
    });
  }
};

/**
 * @desc    Get single daily report by ID
 * @route   GET /api/daily-reports/:id
 * @access  Private
 */
export const getDailyReportById = async (req, res) => {
  try {
    const report = await DailyReport.findById(req.params.id)
      .populate('child', 'firstName lastName photo assignedClass assignedGroup')
      .populate('createdBy')
      .populate({
        path: 'createdBy',
        populate: { path: 'user', select: 'firstName lastName email' },
      })
      .populate('activities', 'title description type time');

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Daily report not found',
      });
    }

    // Authorization check
    const childDoc = await Child.findById(report.child._id);
    const isParent = childDoc.parents.some((p) => p.parent.toString() === req.user.id);

    if (req.user.role === 'parent' && !isParent) {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
      });
    }

    if (req.user.role === 'staff') {
      const staff = await Staff.findOne({ user: req.user.id });
      const hasAccess = staff && staff.assignedClasses && staff.assignedClasses.includes(childDoc.assignedClass?.toString());
      
      if (!hasAccess && req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Access denied',
        });
      }
    }

    res.status(200).json({
      success: true,
      data: report,
    });
  } catch (error) {
    console.error('Error fetching daily report:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching daily report',
    });
  }
};

/**
 * @desc    Get today's report for a child
 * @route   GET /api/daily-reports/child/:childId/today
 * @access  Private
 */
export const getTodayReport = async (req, res) => {
  try {
    const { childId } = req.params;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    let report = await DailyReport.findOne({
      child: childId,
      date: { $gte: today, $lt: tomorrow },
    })
      .populate('child', 'firstName lastName photo')
      .populate('createdBy')
      .populate({
        path: 'createdBy',
        populate: { path: 'user', select: 'firstName lastName' },
      })
      .populate('activities', 'title description type');

    // If no report exists, check if child has attendance today and auto-create template
    if (!report) {
      const attendance = await Attendance.findOne({
        child: childId,
        date: { $gte: today, $lt: tomorrow },
      });

      if (attendance) {
        const staff = await Staff.findOne({ user: req.user.id });
        
        report = await DailyReport.create({
          child: childId,
          date: today,
          attendance: {
            status: attendance.status,
            checkIn: attendance.checkInTime,
            checkOut: attendance.checkOutTime,
          },
          createdBy: staff?._id || req.user.id,
        });

        await report.populate('child', 'firstName lastName photo');
        await report.populate('createdBy');
        await report.populate({
          path: 'createdBy',
          populate: { path: 'user', select: 'firstName lastName' },
        });
      }
    }

    res.status(200).json({
      success: true,
      data: report,
    });
  } catch (error) {
    console.error('Error fetching today report:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching today report',
    });
  }
};

/**
 * @desc    Complete daily report (mark as ready)
 * @route   PUT /api/daily-reports/:id/complete
 * @access  Private (Staff)
 */
export const completeDailyReport = async (req, res) => {
  try {
    const report = await DailyReport.findById(req.params.id);
    
    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Daily report not found',
      });
    }

    await report.complete();
    await report.populate('child', 'firstName lastName photo');

    res.status(200).json({
      success: true,
      message: 'Daily report marked as completed',
      data: report,
    });
  } catch (error) {
    console.error('Error completing daily report:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error completing daily report',
    });
  }
};

/**
 * @desc    Send daily report to parents
 * @route   POST /api/daily-reports/:id/send
 * @access  Private (Staff)
 */
export const sendDailyReport = async (req, res) => {
  try {
    const report = await DailyReport.findById(req.params.id)
      .populate('child', 'firstName lastName parents');
    
    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Daily report not found',
      });
    }

    if (report.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Report must be completed before sending',
      });
    }

    await report.markAsSent();

    // Notify parents
    const parentIds = report.child.parents.map((p) => p.parent);
    if (parentIds.length > 0) {
      const io = req.app.get('io');
      await notifyDailyReportSent(report, parentIds, io);
    }

    res.status(200).json({
      success: true,
      message: 'Daily report sent to parents',
      data: report,
    });
  } catch (error) {
    console.error('Error sending daily report:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error sending daily report',
    });
  }
};

/**
 * @desc    Delete daily report
 * @route   DELETE /api/daily-reports/:id
 * @access  Private (Admin/Staff)
 */
export const deleteDailyReport = async (req, res) => {
  try {
    const report = await DailyReport.findById(req.params.id);
    
    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Daily report not found',
      });
    }

    await report.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Daily report deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting daily report:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error deleting daily report',
    });
  }
};
