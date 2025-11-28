/**
 * User Roles Constants
 */
export const ROLES = {
  ADMIN: 'admin',
  PARENT: 'parent',
  STAFF: 'staff',
};

/**
 * Child Status Constants
 */
export const CHILD_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  GRADUATED: 'graduated',
};

/**
 * Attendance Status Constants
 */
export const ATTENDANCE_STATUS = {
  PRESENT: 'present',
  ABSENT: 'absent',
  LATE: 'late',
  SICK: 'sick',
  EXCUSED: 'excused',
};

/**
 * Payment Status Constants
 */
export const PAYMENT_STATUS = {
  PENDING: 'pending',
  PAID: 'paid',
  OVERDUE: 'overdue',
  CANCELLED: 'cancelled',
  REFUNDED: 'refunded',
};

/**
 * Payment Method Constants
 */
export const PAYMENT_METHOD = {
  CASH: 'cash',
  CARD: 'card',
  BANK_TRANSFER: 'bank_transfer',
  ONLINE: 'online',
};

// Alias for backward compatibility
export const PAYMENT_METHODS = PAYMENT_METHOD;

/**
 * Payment Type Constants
 */
export const PAYMENT_TYPES = {
  TUITION: 'tuition',
  MEAL: 'meal',
  TRANSPORTATION: 'transportation',
  ACTIVITY: 'activity',
  REGISTRATION: 'registration',
  MISCELLANEOUS: 'miscellaneous',
};

/**
 * Staff Position Constants
 */
export const STAFF_POSITION = {
  TEACHER: 'teacher',
  ASSISTANT: 'assistant',
  MANAGER: 'manager',
  NURSE: 'nurse',
  RECEPTIONIST: 'receptionist',
};

/**
 * Message Status Constants
 */
export const MESSAGE_STATUS = {
  SENT: 'sent',
  READ: 'read',
  ARCHIVED: 'archived',
};

/**
 * Incident Severity Constants
 */
export const INCIDENT_SEVERITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical',
};

/**
 * File Upload Constants
 */
export const FILE_UPLOAD = {
  MAX_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_TYPES: {
    IMAGE: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    DOCUMENT: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  },
};

/**
 * Pagination Constants
 */
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
};

/**
 * Date Format Constants
 */
export const DATE_FORMAT = {
  DISPLAY: 'DD/MM/YYYY',
  API: 'YYYY-MM-DD',
  DATETIME: 'YYYY-MM-DD HH:mm:ss',
};
