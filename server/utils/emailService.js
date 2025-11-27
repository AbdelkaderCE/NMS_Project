import nodemailer from 'nodemailer';
import Payment from '../models/Payment.js';
import User from '../models/User.js';

// Create transporter lazily to avoid throwing if env vars missing
let transporter;
function getTransporter() {
  if (transporter) return transporter;
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) {
    return null; // Fallback to console logging
  }
  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: parseInt(SMTP_PORT, 10),
    secure: parseInt(SMTP_PORT, 10) === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });
  return transporter;
}

const FROM_ADDRESS = process.env.MAIL_FROM || 'no-reply@nms.local';

async function sendEmail(to, subject, html) {
  const tx = getTransporter();
  if (!tx) {
    console.log('[EMAIL Fallback] To:', to, 'Subject:', subject); // Minimal fallback
    return { queued: false, fallback: true };
  }
  return tx.sendMail({ from: FROM_ADDRESS, to, subject, html });
}

export async function sendPaymentConfirmation(payment) {
  if (!payment.parent || !payment.invoiceNumber) return;
  const parent = payment.parent.email ? payment.parent : await User.findById(payment.parent).select('email firstName lastName');
  if (!parent?.email) return;
  const child = payment.child?.firstName ? payment.child : await Payment.findById(payment._id).populate('child', 'firstName lastName');
  const subject = `Payment Confirmation - Invoice ${payment.invoiceNumber}`;
  const html = `
    <h2>Payment Confirmation</h2>
    <p>Dear ${parent.firstName || 'Parent'},</p>
    <p>Your payment for invoice <strong>${payment.invoiceNumber}</strong> has been received.</p>
    <p>Amount: <strong>$${payment.finalAmount}</strong></p>
    <p>Child: ${child.child ? child.child.firstName + ' ' + child.child.lastName : (payment.child?.firstName || '')}</p>
    <p>Paid Date: ${new Date(payment.paidDate).toLocaleDateString()}</p>
    <p>Thank you.</p>
  `;
  try { await sendEmail(parent.email, subject, html); } catch (e) { console.error('Email send error (confirmation):', e.message); }
}

export async function sendOverduePaymentReminder(payment) {
  const parent = payment.parent.email ? payment.parent : await User.findById(payment.parent).select('email firstName lastName');
  if (!parent?.email) return;
  const subject = `Overdue Invoice Reminder - ${payment.invoiceNumber}`;
  const html = `
    <h2>Overdue Payment Reminder</h2>
    <p>Dear ${parent.firstName || 'Parent'},</p>
    <p>This is a reminder that invoice <strong>${payment.invoiceNumber}</strong> was due on <strong>${new Date(payment.dueDate).toLocaleDateString()}</strong>.</p>
    <p>Outstanding Amount: <strong>$${payment.finalAmount}</strong></p>
    <p>Please make the payment at your earliest convenience.</p>
    <p>If you have already paid, please ignore this message.</p>
  `;
  try { await sendEmail(parent.email, subject, html); } catch (e) { console.error('Email send error (overdue):', e.message); }
}
