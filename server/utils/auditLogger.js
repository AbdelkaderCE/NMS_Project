import AuditLog from '../models/AuditLog.js';

/**
 * Create an audit log entry
 * @param {Object} params - Audit log parameters
 * @param {ObjectId} params.userId - User who performed the action
 * @param {String} params.userName - User's full name
 * @param {String} params.userRole - User's role
 * @param {String} params.action - Action performed (CREATE, UPDATE, DELETE, etc.)
 * @param {String} params.resourceType - Type of resource affected
 * @param {ObjectId} params.resourceId - ID of the resource
 * @param {String} params.resourceName - Human-readable name of resource
 * @param {Object} params.changes - Object with before/after values
 * @param {String} params.description - Optional description
 * @param {String} params.ipAddress - User's IP address
 * @param {String} params.userAgent - User's browser info
 */
export const createAuditLog = async (params) => {
  try {
    await AuditLog.create({
      user: params.userId,
      userName: params.userName,
      userRole: params.userRole,
      action: params.action,
      resourceType: params.resourceType,
      resourceId: params.resourceId,
      resourceName: params.resourceName,
      changes: params.changes || {},
      description: params.description,
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
    });
  } catch (error) {
    console.error('Error creating audit log:', error);
    // Don't throw - audit logging should not break the main operation
  }
};

/**
 * Helper to extract changed fields between old and new objects
 */
export const getChangedFields = (oldDoc, newDoc, fields = []) => {
  const changes = {};
  
  fields.forEach(field => {
    const oldValue = getNestedValue(oldDoc, field);
    const newValue = getNestedValue(newDoc, field);
    
    if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
      changes[field] = {
        old: oldValue,
        new: newValue,
      };
    }
  });
  
  return changes;
};

/**
 * Get nested object value by path (e.g., 'user.firstName')
 */
const getNestedValue = (obj, path) => {
  return path.split('.').reduce((acc, part) => acc?.[part], obj);
};

/**
 * Middleware to attach audit logging helpers to request
 */
export const auditMiddleware = (req, res, next) => {
  req.audit = {
    log: (params) => createAuditLog({
      ...params,
      userId: req.user?.id,
      userName: `${req.user?.firstName || ''} ${req.user?.lastName || ''}`.trim(),
      userRole: req.user?.role,
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.get('user-agent'),
    }),
    getChanges: getChangedFields,
  };
  next();
};
