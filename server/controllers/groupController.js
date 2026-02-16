import { Group, Class, Child, Staff } from '../models/index.js';
import { sendSuccess, sendError } from '../utils/responseHandler.js';

/**
 * @desc    Create a new group
 * @route   POST /api/groups
 * @access  Private (Admin/Staff)
 */
export const createGroup = async (req, res, next) => {
  try {
    const { class: classId, instructors } = req.body;

    // Validate class exists
    const classExists = await Class.findById(classId);
    if (!classExists) {
      return sendError(res, 404, 'Class not found');
    }

    // Validate instructors exist and are teachers/assistants
    if (instructors && instructors.length > 0) {
      const validStaff = await Staff.find({ 
        _id: { $in: instructors }, 
        position: { $in: ['teacher', 'assistant'] }
      }).select('_id');
      
      if (validStaff.length !== instructors.length) {
        return sendError(res, 400, 'All instructors must be staff with position "teacher" or "assistant"');
      }
    }

    const group = await Group.create(req.body);
    await group.populate([
      { path: 'class', select: 'name ageRange' },
      { path: 'instructors', populate: { path: 'user', select: 'firstName lastName' } },
    ]);

    // Add this group to instructors' assignedClasses
    if (instructors && instructors.length > 0) {
      await Staff.updateMany(
        { _id: { $in: instructors } },
        { $addToSet: { assignedClasses: group._id } }
      );
    }

    sendSuccess(res, 201, 'Group created successfully', group);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all groups
 * @route   GET /api/groups
 * @access  Private
 */
export const getGroups = async (req, res, next) => {
  try {
    const { class: classId, isActive } = req.query;

    const filter = {};
    if (classId) filter.class = classId;
    if (isActive !== undefined) filter.isActive = isActive === 'true';

    const groups = await Group.find(filter)
      .populate('class', 'name ageRange color')
      .populate('instructors', 'user')
      .populate({
        path: 'instructors',
        populate: { path: 'user', select: 'firstName lastName' },
      })
      .sort({ name: 1 });

    // Get children count for each group
    const groupsWithCounts = await Promise.all(
      groups.map(async (group) => {
        const childrenCount = await Child.countDocuments({ assignedGroup: group._id });
        return {
          ...group.toObject(),
          childrenCount,
        };
      })
    );

    sendSuccess(res, 200, 'Groups retrieved successfully', groupsWithCounts);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single group
 * @route   GET /api/groups/:id
 * @access  Private
 */
export const getGroup = async (req, res, next) => {
  try {
    const group = await Group.findById(req.params.id)
      .populate('class', 'name ageRange monthlyFee')
      .populate({
        path: 'instructors',
        populate: { path: 'user', select: 'firstName lastName email phone' },
      });

    if (!group) {
      return sendError(res, 404, 'Group not found');
    }

    const children = await Child.find({ assignedGroup: group._id })
      .populate('parents.parent', 'firstName lastName')
      .select('firstName lastName dateOfBirth photo');

    sendSuccess(res, 200, 'Group retrieved successfully', {
      ...group.toObject(),
      children,
      childrenCount: children.length,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update group
 * @route   PUT /api/groups/:id
 * @access  Private (Admin/Staff)
 */
export const updateGroup = async (req, res, next) => {
  try {
    const { instructors } = req.body;
    const groupId = req.params.id;

    // Get the old group to see previous instructors
    const oldGroup = await Group.findById(groupId);
    if (!oldGroup) {
      return sendError(res, 404, 'Group not found');
    }

    // Validate instructors if provided and ensure they are teachers/assistants
    if (instructors && instructors.length > 0) {
      const validStaff = await Staff.find({ 
        _id: { $in: instructors }, 
        position: { $in: ['teacher', 'assistant'] }
      }).select('_id');
      
      if (validStaff.length !== instructors.length) {
        return sendError(res, 400, 'All instructors must be staff with position "teacher" or "assistant"');
      }
    }

    // Update the group
    const group = await Group.findByIdAndUpdate(groupId, req.body, {
      new: true,
      runValidators: true,
    }).populate([
      { path: 'class', select: 'name ageRange' },
      { path: 'instructors', populate: { path: 'user', select: 'firstName lastName' } },
    ]);

    // Sync assignedClasses in Staff model
    if (instructors !== undefined) {
      // Remove this group from old instructors who are no longer assigned
      const oldInstructorIds = oldGroup.instructors.map(id => id.toString());
      const newInstructorIds = instructors.map(id => id.toString());
      const removedInstructors = oldInstructorIds.filter(id => !newInstructorIds.includes(id));
      const addedInstructors = newInstructorIds.filter(id => !oldInstructorIds.includes(id));

      // Remove group from staff who are no longer instructors
      if (removedInstructors.length > 0) {
        await Staff.updateMany(
          { _id: { $in: removedInstructors } },
          { $pull: { assignedClasses: groupId } }
        );
      }

      // Add group to new instructors
      if (addedInstructors.length > 0) {
        await Staff.updateMany(
          { _id: { $in: addedInstructors } },
          { $addToSet: { assignedClasses: groupId } }
        );
      }
    }

    sendSuccess(res, 200, 'Group updated successfully', group);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete group
 * @route   DELETE /api/groups/:id
 * @access  Private (Admin)
 */
export const deleteGroup = async (req, res, next) => {
  try {
    const groupId = req.params.id;
    
    // Check if group has children
    const childrenCount = await Child.countDocuments({ assignedGroup: groupId });
    if (childrenCount > 0) {
      return sendError(res, 400, 'Cannot delete group with assigned children. Please reassign children first.');
    }

    const group = await Group.findByIdAndDelete(groupId);

    if (!group) {
      return sendError(res, 404, 'Group not found');
    }

    // Remove this group from all staff assignedClasses
    await Staff.updateMany(
      { assignedClasses: groupId },
      { $pull: { assignedClasses: groupId } }
    );

    sendSuccess(res, 200, 'Group deleted successfully', null);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Assign child to group
 * @route   POST /api/groups/:id/assign-child
 * @access  Private (Admin/Staff)
 */
export const assignChildToGroup = async (req, res, next) => {
  try {
    const { childId } = req.body;

    const group = await Group.findById(req.params.id);
    if (!group) {
      return sendError(res, 404, 'Group not found');
    }

    const child = await Child.findById(childId);
    if (!child) {
      return sendError(res, 404, 'Child not found');
    }

    // Check capacity
    const currentCount = await Child.countDocuments({ assignedGroup: group._id });
    if (currentCount >= group.maxCapacity) {
      return sendError(res, 400, 'Group is at maximum capacity');
    }

    // Assign child to group and class
    child.assignedGroup = group._id;
    child.assignedClass = group.class;
    await child.save();

    sendSuccess(res, 200, 'Child assigned to group successfully', child);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Remove child from group
 * @route   POST /api/groups/:id/remove-child
 * @access  Private (Admin/Staff)
 */
export const removeChildFromGroup = async (req, res, next) => {
  try {
    const { childId } = req.body;

    const child = await Child.findById(childId);
    if (!child) {
      return sendError(res, 404, 'Child not found');
    }

    child.assignedGroup = null;
    child.assignedClass = null;
    await child.save();

    sendSuccess(res, 200, 'Child removed from group successfully', child);
  } catch (error) {
    next(error);
  }
};
