/**
 * CSV Export Utility
 * Provides functions to convert data to CSV format and download files
 */

/**
 * Escape CSV values (handle commas, quotes, newlines)
 */
const escapeCSVValue = (value) => {
  if (value === null || value === undefined) return '';
  
  const str = String(value);
  
  // If contains comma, quote, or newline, wrap in quotes and escape quotes
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  
  return str;
};

/**
 * Get nested property value from object
 */
const getNestedValue = (obj, path) => {
  if (!path.includes('.')) return obj[path];
  
  const parts = path.split('.');
  let value = obj;
  
  for (const part of parts) {
    value = value?.[part];
    if (value === undefined) return '';
  }
  
  return value;
};

/**
 * Convert array of objects to CSV string
 */
export const convertToCSV = (data, columns = null) => {
  if (!data || data.length === 0) return '';
  
  // Auto-detect columns if not provided
  if (!columns) {
    columns = Object.keys(data[0]);
  }
  
  // CSV header
  const header = columns.map(col => {
    // Use friendly column names (remove dots, capitalize)
    const friendlyName = col.split('.').pop();
    return escapeCSVValue(friendlyName.charAt(0).toUpperCase() + friendlyName.slice(1));
  }).join(',');
  
  // CSV rows
  const rows = data.map(item => {
    return columns.map(col => {
      const value = getNestedValue(item, col);
      
      // Format dates
      if (value instanceof Date) {
        return value.toLocaleDateString();
      }
      
      // Format objects
      if (typeof value === 'object' && value !== null) {
        return escapeCSVValue(JSON.stringify(value));
      }
      
      return escapeCSVValue(value);
    }).join(',');
  });
  
  return [header, ...rows].join('\n');
};

/**
 * Download CSV file
 */
export const downloadCSV = (csvContent, filename = 'export.csv') => {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // Clean up
  setTimeout(() => URL.revokeObjectURL(url), 100);
};

/**
 * Format date for filename
 */
const getDateString = () => {
  return new Date().toISOString().split('T')[0];
};

/**
 * Export children to CSV
 */
export const exportChildrenToCSV = (children) => {
  const data = children.map(child => ({
    'First Name': child.firstName,
    'Last Name': child.lastName,
    'Date of Birth': child.dateOfBirth ? new Date(child.dateOfBirth).toLocaleDateString() : '',
    'Gender': child.gender,
    'Class': child.assignedClass?.name || 'Not Assigned',
    'Group': child.assignedGroup?.name || 'Not Assigned',
    'Allergies': child.allergies || 'None',
    'Medical Info': child.medicalInfo || 'None',
    'Emergency Contact': child.emergencyContact?.name || '',
    'Emergency Phone': child.emergencyContact?.phone || '',
    'Parent': child.parents?.[0]?.parent ? `${child.parents[0].parent.firstName} ${child.parents[0].parent.lastName}` : ''
  }));
  
  const csv = convertToCSV(data);
  downloadCSV(csv, `children-export-${getDateString()}.csv`);
};

/**
 * Export staff to CSV
 */
export const exportStaffToCSV = (staff) => {
  const data = staff.map(s => ({
    'First Name': s.firstName,
    'Last Name': s.lastName,
    'Email': s.email,
    'Phone': s.phone || '',
    'Position': s.position,
    'Department': s.department || '',
    'Hire Date': s.hireDate ? new Date(s.hireDate).toLocaleDateString() : '',
    'Status': s.isActive ? 'Active' : 'Inactive',
    'Classes': s.assignedClasses?.map(c => c.name).join('; ') || 'None'
  }));
  
  const csv = convertToCSV(data);
  downloadCSV(csv, `staff-export-${getDateString()}.csv`);
};

/**
 * Export payments to CSV
 */
export const exportPaymentsToCSV = (payments) => {
  const data = payments.map(p => ({
    'Date': p.paymentDate ? new Date(p.paymentDate).toLocaleDateString() : '',
    'Child': p.child ? `${p.child.firstName} ${p.child.lastName}` : '',
    'Amount': p.amount,
    'Type': p.type,
    'Method': p.paymentMethod || '',
    'Status': p.status,
    'Transaction ID': p.transactionId || 'N/A',
    'Notes': p.notes || ''
  }));
  
  const csv = convertToCSV(data);
  downloadCSV(csv, `payments-export-${getDateString()}.csv`);
};

/**
 * Export attendance to CSV
 */
export const exportAttendanceToCSV = (attendance) => {
  const data = attendance.map(a => ({
    'Date': a.date ? new Date(a.date).toLocaleDateString() : '',
    'Child': a.child ? `${a.child.firstName} ${a.child.lastName}` : '',
    'Class': a.child?.assignedClass?.name || '',
    'Group': a.child?.assignedGroup?.name || '',
    'Status': a.status,
    'Check-In': a.checkInTime || 'Not checked in',
    'Check-Out': a.checkOutTime || 'Not checked out',
    'Checked In By': a.checkInBy ? `${a.checkInBy.firstName} ${a.checkInBy.lastName}` : '',
    'Notes': a.notes || ''
  }));
  
  const csv = convertToCSV(data);
  downloadCSV(csv, `attendance-export-${getDateString()}.csv`);
};

/**
 * Export activities to CSV
 */
export const exportActivitiesToCSV = (activities) => {
  const data = activities.map(a => ({
    'Title': a.title,
    'Description': a.description || '',
    'Date': a.scheduledDate ? new Date(a.scheduledDate).toLocaleDateString() : '',
    'Time': a.scheduledTime || '',
    'Type': a.type,
    'Location': a.location || '',
    'Organizer': a.organizer ? `${a.organizer.firstName} ${a.organizer.lastName}` : '',
    'Status': a.status || 'Scheduled',
    'For': a.child ? 'Individual Child' : a.group ? 'Group' : 'Class'
  }));
  
  const csv = convertToCSV(data);
  downloadCSV(csv, `activities-export-${getDateString()}.csv`);
};

/**
 * Export parents to CSV
 */
export const exportParentsToCSV = (parents) => {
  const data = parents.map(p => ({
    'First Name': p.firstName,
    'Last Name': p.lastName,
    'Email': p.email,
    'Phone': p.phone || '',
    'Address': p.address || '',
    'Status': p.isActive ? 'Active' : 'Inactive',
    'Number of Children': p.children?.length || 0
  }));
  
  const csv = convertToCSV(data);
  downloadCSV(csv, `parents-export-${getDateString()}.csv`);
};

/**
 * Export messages to CSV
 */
export const exportMessagesToCSV = (messages) => {
  const data = messages.map(m => ({
    'Date': m.createdAt ? new Date(m.createdAt).toLocaleDateString() : '',
    'Time': m.createdAt ? new Date(m.createdAt).toLocaleTimeString() : '',
    'From': m.sender ? `${m.sender.firstName} ${m.sender.lastName}` : '',
    'To': m.recipient ? `${m.recipient.firstName} ${m.recipient.lastName}` : '',
    'Subject': m.subject || '',
    'Message': m.message || '',
    'Status': m.isRead ? 'Read' : 'Unread',
    'Archived': m.isArchived ? 'Yes' : 'No'
  }));
  
  const csv = convertToCSV(data);
  downloadCSV(csv, `messages-export-${getDateString()}.csv`);
};

/**
 * Export classes to CSV
 */
export const exportClassesToCSV = (classes) => {
  const data = classes.map(c => ({
    'Name': c.name,
    'Description': c.description || '',
    'Age Range': c.ageRange ? `${c.ageRange.minMonths}-${c.ageRange.maxMonths} months` : '',
    'Capacity': c.capacity || '',
    'Monthly Fee': c.monthlyFee || '',
    'Room': c.room || '',
    'Schedule': c.schedule?.days?.join(', ') || '',
    'Status': c.isActive ? 'Active' : 'Inactive',
    'Enrolled': c.enrolledCount || 0
  }));
  
  const csv = convertToCSV(data);
  downloadCSV(csv, `classes-export-${getDateString()}.csv`);
};

/**
 * Export groups to CSV
 */
export const exportGroupsToCSV = (groups) => {
  const data = groups.map(g => ({
    'Name': g.name,
    'Class': g.class?.name || '',
    'Description': g.description || '',
    'Max Capacity': g.maxCapacity || '',
    'Current Size': g.children?.length || 0,
    'Teacher': g.teacher ? `${g.teacher.firstName} ${g.teacher.lastName}` : '',
    'Schedule': g.schedule?.days?.join(', ') || '',
    'Status': g.isActive ? 'Active' : 'Inactive'
  }));
  
  const csv = convertToCSV(data);
  downloadCSV(csv, `groups-export-${getDateString()}.csv`);
};

export default {
  convertToCSV,
  downloadCSV,
  exportChildrenToCSV,
  exportStaffToCSV,
  exportPaymentsToCSV,
  exportAttendanceToCSV,
  exportActivitiesToCSV,
  exportParentsToCSV,
  exportMessagesToCSV,
  exportClassesToCSV,
  exportGroupsToCSV
};
