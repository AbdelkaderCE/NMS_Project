import { createNotification } from '../controllers/notificationController.js';

/**
 * Notification helper functions to create notifications from various parts of the app
 */

export const notifyPaymentReceived = async (payment, io) => {
  try {
    await createNotification(
      {
        recipient: payment.parent,
        type: 'payment',
        title: 'Payment Received',
        message: `Your payment of $${payment.amount} for ${payment.child?.name || 'child'} has been received.`,
        link: '/payments',
        metadata: {
          paymentId: payment._id,
          amount: payment.amount,
        },
        priority: 'normal',
      },
      io
    );
  } catch (error) {
    console.error('Error creating payment notification:', error);
  }
};

export const notifyEnrollmentRequest = async (enrollment, adminUsers, io) => {
  try {
    // Notify all admin users about new enrollment request
    const notifications = adminUsers.map((admin) =>
      createNotification(
        {
          recipient: admin._id,
          type: 'enrollment',
          title: 'New Enrollment Request',
          message: `New enrollment request for ${enrollment.childName}`,
          link: '/enrollment/requests',
          metadata: {
            enrollmentId: enrollment._id,
            childName: enrollment.childName,
          },
          priority: 'high',
        },
        io
      )
    );

    await Promise.all(notifications);
  } catch (error) {
    console.error('Error creating enrollment notification:', error);
  }
};

export const notifyChildRegistered = async (child, parentUser, io) => {
  try {
    await createNotification(
      {
        recipient: parentUser._id,
        type: 'child_registration',
        title: 'Child Registered Successfully',
        message: `${child.name} has been successfully registered in the nursery.`,
        link: `/children/${child._id}`,
        metadata: {
          childId: child._id,
          childName: child.name,
        },
        priority: 'normal',
      },
      io
    );
  } catch (error) {
    console.error('Error creating child registration notification:', error);
  }
};

export const notifyStaffAdded = async (staff, io) => {
  try {
    await createNotification(
      {
        recipient: staff.user,
        type: 'staff_added',
        title: 'Welcome to the Team!',
        message: `You have been added as ${staff.position} in the nursery management system.`,
        link: '/staff',
        metadata: {
          staffId: staff._id,
          position: staff.position,
        },
        priority: 'high',
      },
      io
    );
  } catch (error) {
    console.error('Error creating staff notification:', error);
  }
};

export const notifyActivityScheduled = async (activity, participants, io) => {
  try {
    const activityName = activity.title || activity.type || 'Activity';
    const notifications = participants.map((userId) =>
      createNotification(
        {
          recipient: userId,
          type: 'activity_scheduled',
          title: 'New Activity Scheduled',
          message: `${activityName} has been scheduled for ${new Date(
            activity.date
          ).toLocaleDateString()}.`,
          link: '/activities/calendar',
          metadata: {
            activityId: activity._id,
            activityName: activityName,
            activityType: activity.type,
            date: activity.date,
          },
          priority: 'normal',
        },
        io
      )
    );

    await Promise.all(notifications);
  } catch (error) {
    console.error('Error creating activity notification:', error);
  }
};

export const notifyAttendanceMarked = async (attendance, parentUser, io) => {
  try {
    const childName = attendance.child?.firstName 
      ? `${attendance.child.firstName} ${attendance.child.lastName || ''}`.trim()
      : 'your child';
    await createNotification(
      {
        recipient: parentUser._id,
        type: 'attendance',
        title: 'Attendance Marked',
        message: `Attendance has been marked for ${childName} - Status: ${attendance.status}`,
        link: `/children/${attendance.child?._id}`,
        metadata: {
          attendanceId: attendance._id,
          childId: attendance.child?._id,
          status: attendance.status,
          date: attendance.date,
        },
        priority: attendance.status === 'absent' ? 'high' : 'normal',
      },
      io
    );
  } catch (error) {
    console.error('Error creating attendance notification:', error);
  }
};

export const notifyNewMessage = async (message, recipientId, io) => {
  try {
    await createNotification(
      {
        recipient: recipientId,
        sender: message.sender,
        type: 'message',
        title: 'New Message',
        message: `You have a new ${message.priority} priority message: ${message.subject}`,
        link: '/messages',
        metadata: {
          messageId: message._id,
          subject: message.subject,
          priority: message.priority,
        },
        priority: message.priority === 'urgent' ? 'urgent' : 'normal',
      },
      io
    );
  } catch (error) {
    console.error('Error creating message notification:', error);
  }
};

export const notifyDocumentUploaded = async (document, recipientId, io) => {
  try {
    await createNotification(
      {
        recipient: recipientId,
        type: 'document_uploaded',
        title: 'New Document Uploaded',
        message: `A new document "${document.name}" has been uploaded.`,
        link: `/children/${document.child}`,
        metadata: {
          documentId: document._id,
          documentName: document.name,
          documentType: document.type,
        },
        priority: 'low',
      },
      io
    );
  } catch (error) {
    console.error('Error creating document notification:', error);
  }
};

export const notifySystemMessage = async (recipients, title, message, io) => {
  try {
    const notifications = recipients.map((userId) =>
      createNotification(
        {
          recipient: userId,
          type: 'system',
          title,
          message,
          priority: 'high',
        },
        io
      )
    );

    await Promise.all(notifications);
  } catch (error) {
    console.error('Error creating system notification:', error);
  }
};

export const notifyAbsenceExcuseSubmitted = async (excuse, teacherIds, io) => {
  try {
    const childName = excuse.child?.firstName
      ? `${excuse.child.firstName} ${excuse.child.lastName || ''}`.trim()
      : 'a child';
    const excuseDate = new Date(excuse.absenceDate);
    const dateStr = excuseDate.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
    const notifications = teacherIds.map((teacherId) =>
      createNotification(
        {
          recipient: teacherId,
          type: 'system',
          title: 'New Absence Excuse Request',
          message: `Absence excuse submitted for ${childName} on ${dateStr}`,
          link: '/absence-excuses',
          metadata: {
            excuseId: excuse._id,
            childId: excuse.child?._id,
            date: excuse.absenceDate,
          },
          priority: 'high',
        },
        io
      )
    );

    await Promise.all(notifications);
  } catch (error) {
    console.error('Error creating absence excuse notification:', error);
  }
};

export const notifyAbsenceExcuseStatusChanged = async (excuse, parentId, io) => {
  try {
    const statusText = excuse.status === 'approved' ? 'approved' : 'rejected';
    const childName = excuse.child?.firstName
      ? `${excuse.child.firstName} ${excuse.child.lastName || ''}`.trim()
      : 'your child';
    await createNotification(
      {
        recipient: parentId,
        type: 'system',
        title: `Absence Excuse ${statusText.charAt(0).toUpperCase() + statusText.slice(1)}`,
        message: `Your absence excuse for ${childName} has been ${statusText}.`,
        link: `/children/${excuse.child?._id}`,
        metadata: {
          excuseId: excuse._id,
          childId: excuse.child?._id,
          status: excuse.status,
          date: excuse.absenceDate,
        },
        priority: 'normal',
      },
      io
    );
  } catch (error) {
    console.error('Error creating absence excuse status notification:', error);
  }
};

export const notifyDailyReportSent = async (report, parentIds, io) => {
  try {
    const childName = report.child?.firstName
      ? `${report.child.firstName} ${report.child.lastName || ''}`.trim()
      : 'your child';
    
    const dateStr = new Date(report.date).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
    
    const notifications = parentIds.map((parentId) =>
      createNotification(
        {
          recipient: parentId,
          type: 'system',
          title: `Daily Report - ${childName}`,
          message: `Daily report for ${childName} on ${dateStr} is ready to view`,
          link: `/children/${report.child._id}`,
          metadata: {
            reportId: report._id,
            childId: report.child._id,
            date: report.date,
          },
          priority: 'normal',
        },
        io
      )
    );

    await Promise.all(notifications);
  } catch (error) {
    console.error('Error creating daily report notification:', error);
  }
};

