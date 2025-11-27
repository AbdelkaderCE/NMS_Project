import Payment from '../models/Payment.js';
import Child from '../models/Child.js';
import User from '../models/User.js';
import ErrorResponse from '../utils/errorResponse.js';
import { sendSuccess, sendError, sendPaginatedResponse } from '../utils/responseHandler.js';
import { getPaginationParams, buildPagination } from '../utils/helpers.js';
import { ROLES, PAYMENT_STATUS, PAYMENT_METHODS, PAYMENT_TYPES } from '../utils/constants.js';
import { generateInvoicePDF } from '../utils/pdfGenerator.js';

/**
 * @desc    Create payment/invoice
 * @route   POST /api/payments
 * @access  Private (Admin, Staff)
 */
export const createPayment = async (req, res, next) => {
  try {
    const { child, parent, items, type } = req.body;

    // Validate child exists
    const childRecord = await Child.findById(child).populate('parents.parent');
    if (!childRecord) {
      return sendError(res, 404, 'Child not found');
    }

    // Validate parent exists
    const parentUser = await User.findById(parent);
    if (!parentUser) {
      console.error('Parent not found. ID:', parent);
      console.error('Checking all users...');
      const allUsers = await User.find({});
      console.error('All user IDs:', allUsers.map(u => u._id.toString()));
      return sendError(res, 404, 'Parent not found');
    }

    // Check if parent is associated with the child (flexible check for admin/staff)
    const isParentOfChild = childRecord.parents.some(
      (p) => {
        const parentId = p.parent?._id || p.parent;
        return parentId.toString() === parent;
      }
    );

    // Only enforce parent-child relationship for actual parent role users
    // Admin and staff can create invoices for any child
    if (parentUser.role === 'parent' && !isParentOfChild) {
      return sendError(res, 400, 'Parent is not associated with this child');
    }

    // Generate invoice number if not provided
    const lastPayment = await Payment.findOne().sort({ createdAt: -1 });
    let invoiceNumber;

    if (lastPayment && lastPayment.invoiceNumber) {
      const lastNumber = parseInt(lastPayment.invoiceNumber.split('-')[2]);
      const newNumber = (lastNumber + 1).toString().padStart(4, '0');
      const yearMonth = new Date().toISOString().slice(0, 7).replace('-', '');
      invoiceNumber = `INV-${yearMonth}-${newNumber}`;
    } else {
      const yearMonth = new Date().toISOString().slice(0, 7).replace('-', '');
      invoiceNumber = `INV-${yearMonth}-0001`;
    }

    // Calculate amounts
    const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
    const discount = req.body.discount || 0;
    const tax = req.body.tax || 0;
    const finalAmount = subtotal - discount + tax;

    // Create payment
    const payment = await Payment.create({
      ...req.body,
      invoiceNumber,
      subtotal,
      finalAmount,
      processedBy: req.user.id,
    });

    await payment.populate([
      { path: 'child', select: 'firstName lastName photo' },
      { path: 'parent', select: 'firstName lastName email phone' },
      { path: 'processedBy', select: 'firstName lastName' },
    ]);

    // Audit log
    await req.audit?.log({
      action: 'CREATE',
      resourceType: 'Payment',
      resourceId: payment._id,
      resourceName: payment.invoiceNumber,
      description: `Created invoice ${payment.invoiceNumber} for $${payment.finalAmount}`,
    });

    sendSuccess(res, 201, 'Payment/Invoice created successfully', payment);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all payments/invoices
 * @route   GET /api/payments
 * @access  Private (Admin, Staff) or Parent (own children only)
 */
export const getAllPayments = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPaginationParams(req.query);
    const { child, parent, status, type, startDate, endDate } = req.query;

    let query = {};

    // If user is parent, only show their children's payments
    if (req.user.role === ROLES.PARENT) {
      query.parent = req.user.id;
    }

    // Filter by child
    if (child) {
      query.child = child;
    }

    // Filter by parent
    if (parent && req.user.role !== ROLES.PARENT) {
      query.parent = parent;
    }

    // Filter by status
    if (status) {
      query.status = status;
    }

    // Filter by type
    if (type) {
      query.type = type;
    }

    // Filter by date range
    if (startDate || endDate) {
      query.dueDate = {};
      if (startDate) {
        query.dueDate.$gte = new Date(startDate);
      }
      if (endDate) {
        query.dueDate.$lte = new Date(endDate);
      }
    }

    const totalItems = await Payment.countDocuments(query);

    const payments = await Payment.find(query)
      .populate('child', 'firstName lastName photo classGroup')
      .populate('parent', 'firstName lastName email phone')
      .populate('processedBy', 'firstName lastName')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const pagination = buildPagination(page, limit, totalItems);

    sendPaginatedResponse(res, 200, 'Payments retrieved successfully', payments, pagination);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single payment/invoice
 * @route   GET /api/payments/:id
 * @access  Private (Admin, Staff) or Parent (own child only)
 */
export const getPaymentById = async (req, res, next) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate('child', 'firstName lastName photo classGroup parents')
      .populate('parent', 'firstName lastName email phone address')
      .populate('processedBy', 'firstName lastName');

    if (!payment) {
      return sendError(res, 404, 'Payment not found');
    }

    // If user is parent, check if they own this payment
    if (req.user.role === ROLES.PARENT && payment.parent._id.toString() !== req.user.id) {
      return sendError(res, 403, 'Not authorized to access this payment');
    }

    sendSuccess(res, 200, 'Payment retrieved successfully', payment);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update payment/invoice
 * @route   PUT /api/payments/:id
 * @access  Private (Admin, Staff)
 */
export const updatePayment = async (req, res, next) => {
  try {
    let payment = await Payment.findById(req.params.id);

    if (!payment) {
      return sendError(res, 404, 'Payment not found');
    }

    // Don't allow updating paid invoices
    if (payment.status === PAYMENT_STATUS.PAID && req.body.status !== PAYMENT_STATUS.REFUNDED) {
      return sendError(res, 400, 'Cannot update paid invoice. Use refund endpoint instead.');
    }

    // Recalculate amounts if items changed
    if (req.body.items) {
      const subtotal = req.body.items.reduce((sum, item) => sum + item.amount, 0);
      const discount = req.body.discount !== undefined ? req.body.discount : payment.discount;
      const tax = req.body.tax !== undefined ? req.body.tax : payment.tax;
      req.body.subtotal = subtotal;
      req.body.finalAmount = subtotal - discount + tax;
    }

    payment = await Payment.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
      .populate('child', 'firstName lastName photo')
      .populate('parent', 'firstName lastName email')
      .populate('processedBy', 'firstName lastName');

    // Audit log
    await req.audit?.log({
      action: 'UPDATE',
      resourceType: 'Payment',
      resourceId: payment._id,
      resourceName: payment.invoiceNumber,
      description: `Updated invoice ${payment.invoiceNumber}`,
    });

    sendSuccess(res, 200, 'Payment updated successfully', payment);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete payment/invoice
 * @route   DELETE /api/payments/:id
 * @access  Private (Admin only)
 */
export const deletePayment = async (req, res, next) => {
  try {
    const payment = await Payment.findById(req.params.id);

    if (!payment) {
      return sendError(res, 404, 'Payment not found');
    }

    // Don't allow deleting paid invoices
    if (payment.status === PAYMENT_STATUS.PAID) {
      return sendError(res, 400, 'Cannot delete paid invoice. Use refund endpoint instead.');
    }

    await payment.deleteOne();

    // Audit log
    await req.audit?.log({
      action: 'DELETE',
      resourceType: 'Payment',
      resourceId: payment._id,
      resourceName: payment.invoiceNumber,
      description: `Deleted invoice ${payment.invoiceNumber}`,
    });

    sendSuccess(res, 200, 'Payment deleted successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Mark payment as paid
 * @route   POST /api/payments/:id/pay
 * @access  Private (Admin, Staff, Parent - own payment)
 */
export const markAsPaid = async (req, res, next) => {
  try {
    const payment = await Payment.findById(req.params.id);

    if (!payment) {
      return sendError(res, 404, 'Payment not found');
    }

    // If user is parent, check if they own this payment
    if (req.user.role === ROLES.PARENT && payment.parent.toString() !== req.user.id) {
      return sendError(res, 403, 'Not authorized to pay this invoice');
    }

    if (payment.status === PAYMENT_STATUS.PAID) {
      return sendError(res, 400, 'Payment already marked as paid');
    }

    const { paymentMethod, transactionId, notes } = req.body;

    payment.status = PAYMENT_STATUS.PAID;
    payment.paidDate = new Date();
    payment.paymentMethod = paymentMethod;
    payment.transactionId = transactionId;
    if (notes) {
      payment.notes = notes;
    }

    await payment.save();
    await payment.populate([
      { path: 'child', select: 'firstName lastName photo' },
      { path: 'parent', select: 'firstName lastName email' },
    ]);

    // Audit log
    await req.audit?.log({
      action: 'PAYMENT',
      resourceType: 'Payment',
      resourceId: payment._id,
      resourceName: payment.invoiceNumber,
      description: `Marked invoice ${payment.invoiceNumber} as paid ($${payment.finalAmount})`,
      changes: {
        status: { old: 'pending', new: 'paid' },
        paymentMethod: { old: null, new: paymentMethod },
        paidDate: { old: null, new: new Date() },
      },
    });

    // Send confirmation email (non-blocking)
    import('../utils/emailService.js').then(({ sendPaymentConfirmation }) => {
      sendPaymentConfirmation(payment);
    }).catch(e => console.error('Deferred email module load failed:', e.message));

    sendSuccess(res, 200, 'Payment marked as paid successfully', payment);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Refund payment
 * @route   POST /api/payments/:id/refund
 * @access  Private (Admin only)
 */
export const refundPayment = async (req, res, next) => {
  try {
    const payment = await Payment.findById(req.params.id);

    if (!payment) {
      return sendError(res, 404, 'Payment not found');
    }

    if (payment.status !== PAYMENT_STATUS.PAID) {
      return sendError(res, 400, 'Only paid invoices can be refunded');
    }

    const { refundAmount, reason } = req.body;

    if (refundAmount > payment.finalAmount) {
      return sendError(res, 400, 'Refund amount cannot exceed payment amount');
    }

    payment.status = PAYMENT_STATUS.REFUNDED;
    payment.refund = {
      amount: refundAmount,
      reason,
      refundedBy: req.user.id,
      refundedAt: new Date(),
    };

    await payment.save();
    await payment.populate([
      { path: 'child', select: 'firstName lastName photo' },
      { path: 'parent', select: 'firstName lastName email' },
      { path: 'refund.refundedBy', select: 'firstName lastName' },
    ]);

    sendSuccess(res, 200, 'Payment refunded successfully', payment);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get overdue payments
 * @route   GET /api/payments/overdue
 * @access  Private (Admin, Staff)
 */
export const getOverduePayments = async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const overduePayments = await Payment.find({
      status: PAYMENT_STATUS.PENDING,
      dueDate: { $lt: today },
    })
      .populate('child', 'firstName lastName photo')
      .populate('parent', 'firstName lastName email phone')
      .sort({ dueDate: 1 });

    sendSuccess(res, 200, 'Overdue payments retrieved successfully', {
      count: overduePayments.length,
      payments: overduePayments,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get payment statistics
 * @route   GET /api/payments/stats
 * @access  Private (Admin, Staff)
 */
export const getPaymentStats = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;

    let dateQuery = {};
    if (startDate || endDate) {
      dateQuery.createdAt = {};
      if (startDate) {
        dateQuery.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        dateQuery.createdAt.$lte = new Date(endDate);
      }
    } else {
      // Default to current month
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
      dateQuery.createdAt = { $gte: startOfMonth, $lte: endOfMonth };
    }

    // Total revenue (paid invoices)
    const revenueResult = await Payment.aggregate([
      { $match: { ...dateQuery, status: PAYMENT_STATUS.PAID } },
      { $group: { _id: null, total: { $sum: '$finalAmount' } } },
    ]);
    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0;

    // Pending amount
    const pendingResult = await Payment.aggregate([
      { $match: { ...dateQuery, status: PAYMENT_STATUS.PENDING } },
      { $group: { _id: null, total: { $sum: '$finalAmount' } } },
    ]);
    const pendingAmount = pendingResult.length > 0 ? pendingResult[0].total : 0;

    // Overdue amount
    const today = new Date();
    const overdueResult = await Payment.aggregate([
      {
        $match: {
          ...dateQuery,
          status: PAYMENT_STATUS.PENDING,
          dueDate: { $lt: today },
        },
      },
      { $group: { _id: null, total: { $sum: '$finalAmount' } } },
    ]);
    const overdueAmount = overdueResult.length > 0 ? overdueResult[0].total : 0;

    // Count by status
    const byStatus = await Payment.aggregate([
      { $match: dateQuery },
      { $group: { _id: '$status', count: { $sum: 1 }, total: { $sum: '$finalAmount' } } },
    ]);

    // Count by type
    const byType = await Payment.aggregate([
      { $match: dateQuery },
      { $group: { _id: '$type', count: { $sum: 1 }, total: { $sum: '$finalAmount' } } },
    ]);

    // Revenue by month (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const revenueByMonth = await Payment.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo }, status: PAYMENT_STATUS.PAID } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
          revenue: { $sum: '$finalAmount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const stats = {
      totalRevenue,
      pendingAmount,
      overdueAmount,
      byStatus,
      byType,
      revenueByMonth,
    };

    sendSuccess(res, 200, 'Payment statistics retrieved successfully', stats);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get payments by child
 * @route   GET /api/payments/child/:childId
 * @access  Private (Admin, Staff) or Parent (own child only)
 */
export const getPaymentsByChild = async (req, res, next) => {
  try {
    const { childId } = req.params;

    // Validate child exists
    const child = await Child.findById(childId);
    if (!child) {
      return sendError(res, 404, 'Child not found');
    }

    // If user is parent, check if they own this child
    if (req.user.role === ROLES.PARENT) {
      const isParent = child.parents.some(
        (p) => p.parent.toString() === req.user.id
      );

      if (!isParent) {
        return sendError(res, 403, 'Not authorized to access this child');
      }
    }

    const payments = await Payment.find({ child: childId })
      .populate('parent', 'firstName lastName email')
      .populate('processedBy', 'firstName lastName')
      .sort({ createdAt: -1 });

    sendSuccess(res, 200, 'Child payments retrieved successfully', payments);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get payments by parent
 * @route   GET /api/payments/parent/:parentId
 * @access  Private (Admin, Staff) or Parent (self only)
 */
export const getPaymentsByParent = async (req, res, next) => {
  try {
    const { parentId } = req.params;

    // If user is parent, check if they are requesting their own payments
    if (req.user.role === ROLES.PARENT && parentId !== req.user.id) {
      return sendError(res, 403, 'Not authorized to access other parent payments');
    }

    const payments = await Payment.find({ parent: parentId })
      .populate('child', 'firstName lastName photo')
      .populate('processedBy', 'firstName lastName')
      .sort({ createdAt: -1 });

    sendSuccess(res, 200, 'Parent payments retrieved successfully', payments);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Download invoice as PDF
 * @route   GET /api/payments/:id/pdf
 * @access  Private (Admin, Staff) or Parent (own invoice)
 */
export const downloadInvoicePDF = async (req, res, next) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate('child', 'firstName lastName age photo')
      .populate('parent', 'firstName lastName email phone address')
      .populate('processedBy', 'firstName lastName');

    if (!payment) {
      return sendError(res, 404, 'Payment not found');
    }

    // If user is parent, check if they own this payment
    if (req.user.role === ROLES.PARENT && payment.parent._id.toString() !== req.user.id) {
      return sendError(res, 403, 'Not authorized to access this invoice');
    }

    // Generate PDF
    const doc = generateInvoicePDF(payment);

    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=invoice-${payment.invoiceNumber}.pdf`
    );

    // Pipe PDF to response
    doc.pipe(res);
    doc.end();
  } catch (error) {
    next(error);
  }
};
