import { Class, Group, Child, Staff } from '../models/index.js';
import { sendSuccess, sendError } from '../utils/responseHandler.js';

/**
 * @desc    Create a new class
 * @route   POST /api/classes
 * @access  Private (Admin)
 */
export const createClass = async (req, res, next) => {
  try {
    // Validate any provided instructors (if client ever sends for default group) are teachers
    if (req.body.instructors && req.body.instructors.length > 0) {
      const teachers = await Staff.find({ _id: { $in: req.body.instructors }, position: 'teacher' }).select('_id');
      if (teachers.length !== req.body.instructors.length) {
        return sendError(res, 400, 'All instructors must have position "teacher"');
      }
    }

    const classData = await Class.create(req.body);
    
    // Automatically create a default group for this class
    await Group.create({
      name: `${classData.name} - Group A`,
      class: classData._id,
      maxCapacity: 15,
      instructors: [], // start empty; only teachers can be added later
      schedule: {
        days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
        startTime: '08:00',
        endTime: '16:00'
      },
      room: 'Room 1'
    });
    
    // Fetch the class with populated groups
    const classWithGroup = await Class.findById(classData._id).populate('groups');
    
    sendSuccess(res, 201, 'Class and default group created successfully', classWithGroup);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all classes
 * @route   GET /api/classes
 * @access  Private
 */
export const getClasses = async (req, res, next) => {
  try {
    const { isActive } = req.query;
    
    const filter = {};
    if (isActive !== undefined) {
      filter.isActive = isActive === 'true';
    }

    const classes = await Class.find(filter)
      .populate('groups')
      .sort({ 'ageRange.minMonths': 1 });

    // Get children count for each class
    const classesWithCounts = await Promise.all(
      classes.map(async (classDoc) => {
        const childrenCount = await Child.countDocuments({ assignedClass: classDoc._id });
        return {
          ...classDoc.toObject(),
          childrenCount,
        };
      })
    );

    sendSuccess(res, 200, 'Classes retrieved successfully', classesWithCounts);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single class
 * @route   GET /api/classes/:id
 * @access  Private
 */
export const getClass = async (req, res, next) => {
  try {
    const classData = await Class.findById(req.params.id).populate('groups');

    if (!classData) {
      return sendError(res, 404, 'Class not found');
    }

    const childrenCount = await Child.countDocuments({ assignedClass: classData._id });

    sendSuccess(res, 200, 'Class retrieved successfully', {
      ...classData.toObject(),
      childrenCount,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update class
 * @route   PUT /api/classes/:id
 * @access  Private (Admin)
 */
export const updateClass = async (req, res, next) => {
  try {
    const classData = await Class.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!classData) {
      return sendError(res, 404, 'Class not found');
    }

    sendSuccess(res, 200, 'Class updated successfully', classData);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete class
 * @route   DELETE /api/classes/:id
 * @access  Private (Admin)
 */
export const deleteClass = async (req, res, next) => {
  try {
    // Check if class has children
    const childrenCount = await Child.countDocuments({ assignedClass: req.params.id });
    if (childrenCount > 0) {
      return sendError(res, 400, 'Cannot delete class with assigned children');
    }

    // Check if class has groups
    const groupsCount = await Group.countDocuments({ class: req.params.id });
    if (groupsCount > 0) {
      return sendError(res, 400, 'Cannot delete class with existing groups');
    }

    const classData = await Class.findByIdAndDelete(req.params.id);

    if (!classData) {
      return sendError(res, 404, 'Class not found');
    }

    sendSuccess(res, 200, 'Class deleted successfully', null);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get children in a class
 * @route   GET /api/classes/:id/children
 * @access  Private
 */
export const getClassChildren = async (req, res, next) => {
  try {
    const children = await Child.find({ assignedClass: req.params.id })
      .populate('assignedGroup')
      .populate('parents.parent', 'firstName lastName email phone')
      .sort({ firstName: 1 });

    sendSuccess(res, 200, 'Children retrieved successfully', children);
  } catch (error) {
    next(error);
  }
};
