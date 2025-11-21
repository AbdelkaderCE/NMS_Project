import api from './axios';

// Auth APIs
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
  updatePassword: (data) => api.put('/auth/password', data),
  forgotPassword: (data) => api.post('/auth/forgot-password', data),
  resetPassword: (data) => api.put('/auth/reset-password', data),
};

// User APIs
export const userAPI = {
  getAll: (params) => api.get('/auth/users', { params }),
  getByRole: (role) => api.get('/auth/users', { params: { role } }),
  update: (id, data) => api.put(`/auth/users/${id}`, data),
};

// Children APIs
export const childrenAPI = {
  getAll: (params) => api.get('/children', { params }),
  getById: (id) => api.get(`/children/${id}`),
  create: (data) => api.post('/children', data),
  update: (id, data) => api.put(`/children/${id}`, data),
  delete: (id) => api.delete(`/children/${id}`),
  addParent: (id, data) => api.post(`/children/${id}/parents`, data),
  removeParent: (id, parentId) => api.delete(`/children/${id}/parents/${parentId}`),
  updateMedical: (id, data) => api.put(`/children/${id}/medical`, data),
  addEmergencyContact: (id, data) => api.post(`/children/${id}/emergency-contacts`, data),
  getByParent: (parentId) => api.get(`/children/parent/${parentId}`),
  getStats: () => api.get('/children/stats'),
};

// Staff APIs
export const staffAPI = {
  getAll: (params) => api.get('/staff', { params }),
  getById: (id) => api.get(`/staff/${id}`),
  create: (data) => api.post('/staff', data),
  update: (id, data) => api.put(`/staff/${id}`, data),
  delete: (id) => api.delete(`/staff/${id}`),
  addQualification: (id, data) => api.post(`/staff/${id}/qualifications`, data),
  addCertification: (id, data) => api.post(`/staff/${id}/certifications`, data),
  updateSchedule: (id, data) => api.put(`/staff/${id}/schedule`, data),
  addPerformanceRating: (id, data) => api.post(`/staff/${id}/performance`, data),
  terminate: (id, data) => api.post(`/staff/${id}/terminate`, data),
  getStats: () => api.get('/staff/stats'),
};

// Attendance APIs
export const attendanceAPI = {
  getAll: (params) => api.get('/attendance', { params }),
  getById: (id) => api.get(`/attendance/${id}`),
  create: (data) => api.post('/attendance', data),
  update: (id, data) => api.put(`/attendance/${id}`, data),
  delete: (id) => api.delete(`/attendance/${id}`),
  checkIn: (id, data) => api.post(`/attendance/${id}/check-in`, data),
  checkOut: (id, data) => api.post(`/attendance/${id}/check-out`, data),
  getByChildAndDate: (childId, date) => api.get(`/attendance/child/${childId}/date/${date}`),
  getStats: (params) => api.get('/attendance/stats', { params }),
  getToday: () => api.get('/attendance/today'),
};

// Payment APIs
export const paymentAPI = {
  getAll: (params) => api.get('/payments', { params }),
  getById: (id) => api.get(`/payments/${id}`),
  create: (data) => api.post('/payments', data),
  update: (id, data) => api.put(`/payments/${id}`, data),
  delete: (id) => api.delete(`/payments/${id}`),
  markAsPaid: (id, data) => api.post(`/payments/${id}/pay`, data),
  recordPayment: (id, data) => api.post(`/payments/${id}/pay`, data),
  refund: (id, data) => api.post(`/payments/${id}/refund`, data),
  getOverdue: () => api.get('/payments/overdue'),
  getStats: (params) => api.get('/payments/stats', { params }),
  getByChild: (childId) => api.get(`/payments/child/${childId}`),
  getByParent: (parentId) => api.get(`/payments/parent/${parentId}`),
};

// Activity APIs
export const activityAPI = {
  getAll: (params) => api.get('/activities', { params }),
  getById: (id) => api.get(`/activities/${id}`),
  create: (data) => api.post('/activities', data),
  update: (id, data) => api.put(`/activities/${id}`, data),
  delete: (id) => api.delete(`/activities/${id}`),
  getByChild: (childId, params) => api.get(`/activities/child/${childId}`, { params }),
  getByStaff: (staffId, params) => api.get(`/activities/staff/${staffId}`, { params }),
  getStats: (params) => api.get('/activities/stats', { params }),
  getToday: () => api.get('/activities/today'),
};

// Class APIs
export const classAPI = {
  getAll: (params) => api.get('/classes', { params }),
  getById: (id) => api.get(`/classes/${id}`),
  create: (data) => api.post('/classes', data),
  update: (id, data) => api.put(`/classes/${id}`, data),
  delete: (id) => api.delete(`/classes/${id}`),
  getChildren: (id) => api.get(`/classes/${id}/children`),
};

// Group APIs
export const groupAPI = {
  getAll: (params) => api.get('/groups', { params }),
  getById: (id) => api.get(`/groups/${id}`),
  create: (data) => api.post('/groups', data),
  update: (id, data) => api.put(`/groups/${id}`, data),
  delete: (id) => api.delete(`/groups/${id}`),
  assignChild: (id, data) => api.post(`/groups/${id}/assign-child`, data),
  removeChild: (id, data) => api.post(`/groups/${id}/remove-child`, data),
};

// Message APIs
export const messageAPI = {
  getAll: () => api.get('/messages'),
  create: (data) => api.post('/messages', data),
  send: (data) => api.post('/messages', data),
  getInbox: (params) => api.get('/messages/inbox', { params }),
  getSent: (params) => api.get('/messages/sent', { params }),
  getArchived: (params) => api.get('/messages/archived', { params }),
  getById: (id) => api.get(`/messages/${id}`),
  delete: (id) => api.delete(`/messages/${id}`),
  markAsRead: (id) => api.put(`/messages/${id}/read`),
  markAsUnread: (id) => api.put(`/messages/${id}/unread`),
  archive: (id) => api.put(`/messages/${id}/archive`),
  unarchive: (id) => api.put(`/messages/${id}/unarchive`),
  getUnreadCount: () => api.get('/messages/unread/count'),
  getStats: () => api.get('/messages/stats'),
  getConversation: (userId) => api.get(`/messages/conversation/${userId}`),
  markAllAsRead: () => api.put('/messages/read-all'),
};

// Dashboard APIs
export const dashboardAPI = {
  getOverview: () => api.get('/dashboard/overview'),
  getEnrollment: () => api.get('/dashboard/enrollment'),
  getAttendance: (params) => api.get('/dashboard/attendance', { params }),
  getRevenue: (params) => api.get('/dashboard/revenue', { params }),
  getStaff: () => api.get('/dashboard/staff'),
  getActivities: (params) => api.get('/dashboard/activities', { params }),
  getParentEngagement: () => api.get('/dashboard/parent-engagement'),
  getQuickStats: () => api.get('/dashboard/quick-stats'),
};
