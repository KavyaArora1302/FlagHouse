import { Resend } from 'resend';
import { getClientBaseUrl } from '../utils/clientUrl.js';

let resendClient = null;

export const isEmailConfigured = () => Boolean(process.env.RESEND_API_KEY?.trim());

const getResend = () => {
  if (!isEmailConfigured()) return null;
  if (!resendClient) {
    resendClient = new Resend(process.env.RESEND_API_KEY.trim());
  }
  return resendClient;
};

export const getEmailFrom = () =>
  process.env.EMAIL_FROM?.trim() || 'FlagHouse <onboarding@resend.dev>';

const buildPasswordResetHtml = ({ name, resetUrl }) => `
  <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 520px; margin: 0 auto; color: #111827;">
    <div style="padding: 24px 0 16px; border-bottom: 1px solid #f3f4f6;">
      <strong style="font-size: 20px;">FlagHouse</strong>
    </div>
    <div style="padding: 28px 0;">
      <h1 style="font-size: 22px; margin: 0 0 12px;">Reset your password</h1>
      <p style="font-size: 15px; line-height: 1.6; color: #4b5563; margin: 0 0 8px;">
        Hi ${name || 'there'},
      </p>
      <p style="font-size: 15px; line-height: 1.6; color: #4b5563; margin: 0 0 24px;">
        We received a request to reset your FlagHouse password. Click the button below to choose a new one.
        This link expires in 1 hour.
      </p>
      <a href="${resetUrl}" style="display: inline-block; background: #000; color: #fff; text-decoration: none; font-weight: 600; font-size: 15px; padding: 12px 24px; border-radius: 12px;">
        Reset password
      </a>
      <p style="font-size: 13px; line-height: 1.6; color: #9ca3af; margin: 24px 0 0;">
        If you did not request this, you can safely ignore this email.
      </p>
      <p style="font-size: 12px; line-height: 1.6; color: #9ca3af; margin: 16px 0 0; word-break: break-all;">
        Or copy this link: ${resetUrl}
      </p>
    </div>
  </div>
`;

const buildPasswordResetText = ({ name, resetUrl }) =>
  [
    'Reset your FlagHouse password',
    '',
    `Hi ${name || 'there'},`,
    '',
    'We received a request to reset your FlagHouse password.',
    'Open the link below to choose a new one. This link expires in 1 hour.',
    '',
    resetUrl,
    '',
    'If you did not request this, you can safely ignore this email.',
  ].join('\n');

/**
 * Sends password reset email via Resend.
 * Falls back to console logging when RESEND_API_KEY is not set (local dev).
 */
export const sendPasswordResetEmail = async ({ to, name, resetUrl }) => {
  const resend = getResend();

  if (!resend) {
    console.log(`[email] RESEND_API_KEY not set — reset link for ${to}:`, resetUrl);
    return { sent: false, mode: 'console' };
  }

  const { error } = await resend.emails.send({
    from: getEmailFrom(),
    to,
    subject: 'Reset your FlagHouse password',
    html: buildPasswordResetHtml({ name, resetUrl }),
    text: buildPasswordResetText({ name, resetUrl }),
  });

  if (error) {
    throw new Error(error.message || 'Failed to send reset email');
  }

  console.log(`[email] Password reset sent to ${to}`);
  return { sent: true, mode: 'email' };
};

const PAYMENT_LABELS = {
  upi: 'UPI',
  card: 'Credit / Debit Card',
  netbanking: 'Net Banking',
  cod: 'Cash on Delivery',
};

const formatInr = (amount) => `₹${Number(amount).toLocaleString('en-IN')}`;

const buildOrderItemsHtml = (items) =>
  items
    .map(
      (item) => `
      <tr>
        <td style="padding: 10px 0; border-bottom: 1px solid #f3f4f6; font-size: 14px; color: #374151;">
          ${item.name}<br />
          <span style="font-size: 12px; color: #9ca3af;">${item.size} · Qty ${item.quantity}</span>
        </td>
        <td style="padding: 10px 0; border-bottom: 1px solid #f3f4f6; font-size: 14px; color: #111827; text-align: right; white-space: nowrap;">
          ${formatInr(item.price * item.quantity)}
        </td>
      </tr>`
    )
    .join('');

const buildOrderConfirmationHtml = ({ order, customerName, ordersUrl }) => {
  const addr = order.shippingAddress;
  const paymentLabel = PAYMENT_LABELS[order.paymentMethod] || order.paymentMethod;

  return `
  <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 560px; margin: 0 auto; color: #111827;">
    <div style="padding: 24px 0 16px; border-bottom: 1px solid #f3f4f6;">
      <strong style="font-size: 20px;">FlagHouse</strong>
    </div>
    <div style="padding: 28px 0;">
      <h1 style="font-size: 22px; margin: 0 0 12px;">Order confirmed</h1>
      <p style="font-size: 15px; line-height: 1.6; color: #4b5563; margin: 0 0 8px;">
        Hi ${customerName || 'there'},
      </p>
      <p style="font-size: 15px; line-height: 1.6; color: #4b5563; margin: 0 0 24px;">
        Thanks for your order! We&apos;ve received it and will ship within 24 hours.
        Delivery usually takes 3–5 business days.
      </p>
      <div style="background: #f9fafb; border: 1px solid #f3f4f6; border-radius: 12px; padding: 16px; margin-bottom: 24px;">
        <p style="margin: 0 0 6px; font-size: 13px; color: #6b7280;">Order number</p>
        <p style="margin: 0; font-size: 18px; font-weight: 700;">${order.orderNumber}</p>
      </div>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
        <thead>
          <tr>
            <th style="text-align: left; font-size: 12px; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.05em; padding-bottom: 8px;">Items</th>
            <th style="text-align: right; font-size: 12px; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.05em; padding-bottom: 8px;">Amount</th>
          </tr>
        </thead>
        <tbody>
          ${buildOrderItemsHtml(order.items)}
        </tbody>
      </table>
      <div style="border-top: 1px solid #f3f4f6; padding-top: 12px; font-size: 14px; color: #374151;">
        <p style="margin: 0 0 6px; display: flex; justify-content: space-between;"><span>Subtotal</span><span>${formatInr(order.subtotal)}</span></p>
        <p style="margin: 0 0 6px; display: flex; justify-content: space-between;"><span>Shipping</span><span>${order.shipping === 0 ? 'Free' : formatInr(order.shipping)}</span></p>
        ${order.codCharge > 0 ? `<p style="margin: 0 0 6px; display: flex; justify-content: space-between;"><span>COD charge</span><span>${formatInr(order.codCharge)}</span></p>` : ''}
        <p style="margin: 12px 0 0; display: flex; justify-content: space-between; font-weight: 700; font-size: 16px; color: #111827;"><span>Total</span><span>${formatInr(order.total)}</span></p>
      </div>
      <div style="margin-top: 24px; padding-top: 20px; border-top: 1px solid #f3f4f6; font-size: 14px; color: #4b5563; line-height: 1.6;">
        <p style="margin: 0 0 8px; font-weight: 600; color: #111827;">Delivery address</p>
        <p style="margin: 0;">
          ${addr.firstName} ${addr.lastName}<br />
          ${addr.address}<br />
          ${addr.city}, ${addr.state} – ${addr.pincode}<br />
          ${addr.phone}
        </p>
        <p style="margin: 16px 0 0;"><strong>Payment:</strong> ${paymentLabel}</p>
      </div>
      <a href="${ordersUrl}" style="display: inline-block; margin-top: 28px; background: #000; color: #fff; text-decoration: none; font-weight: 600; font-size: 15px; padding: 12px 24px; border-radius: 12px;">
        View your orders
      </a>
    </div>
  </div>
`;
};

const buildOrderConfirmationText = ({ order, customerName, ordersUrl }) => {
  const addr = order.shippingAddress;
  const paymentLabel = PAYMENT_LABELS[order.paymentMethod] || order.paymentMethod;
  const itemsText = order.items
    .map(
      (item) =>
        `- ${item.name} (${item.size}, Qty ${item.quantity}) — ${formatInr(item.price * item.quantity)}`
    )
    .join('\n');

  return [
    'Order confirmed — FlagHouse',
    '',
    `Hi ${customerName || 'there'},`,
    '',
    'Thanks for your order! We have received it and will ship within 24 hours.',
    '',
    `Order number: ${order.orderNumber}`,
    '',
    'Items:',
    itemsText,
    '',
    `Subtotal: ${formatInr(order.subtotal)}`,
    `Shipping: ${order.shipping === 0 ? 'Free' : formatInr(order.shipping)}`,
    ...(order.codCharge > 0 ? [`COD charge: ${formatInr(order.codCharge)}`] : []),
    `Total: ${formatInr(order.total)}`,
    '',
    'Delivery address:',
    `${addr.firstName} ${addr.lastName}`,
    addr.address,
    `${addr.city}, ${addr.state} – ${addr.pincode}`,
    addr.phone,
    '',
    `Payment: ${paymentLabel}`,
    '',
    `View your orders: ${ordersUrl}`,
  ].join('\n');
};

/**
 * Sends order confirmation email via Resend.
 * Falls back to console logging when RESEND_API_KEY is not set.
 */
export const sendOrderConfirmationEmail = async (order) => {
  const addr = order.shippingAddress;
  const to = addr?.email?.trim().toLowerCase();

  if (!to) {
    console.warn('[email] Order confirmation skipped — no shipping email');
    return { sent: false, mode: 'skipped' };
  }

  const customerName = `${addr.firstName || ''} ${addr.lastName || ''}`.trim();
  const ordersUrl = `${getClientBaseUrl()}/orders`;
  const resend = getResend();

  if (!resend) {
    console.log(
      `[email] RESEND_API_KEY not set — order confirmation for ${order.orderNumber} → ${to}`
    );
    return { sent: false, mode: 'console' };
  }

  const { error } = await resend.emails.send({
    from: getEmailFrom(),
    to,
    subject: `Order confirmed — ${order.orderNumber}`,
    html: buildOrderConfirmationHtml({ order, customerName, ordersUrl }),
    text: buildOrderConfirmationText({ order, customerName, ordersUrl }),
  });

  if (error) {
    throw new Error(error.message || 'Failed to send order confirmation');
  }

  console.log(`[email] Order confirmation sent for ${order.orderNumber} → ${to}`);
  return { sent: true, mode: 'email' };
};

const escapeHtml = (value) =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

const buildContactFormHtml = ({ name, email, subject, message }) => `
  <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 560px; margin: 0 auto; color: #111827;">
    <div style="padding: 24px 0 16px; border-bottom: 1px solid #f3f4f6;">
      <strong style="font-size: 20px;">FlagHouse — New contact message</strong>
    </div>
    <div style="padding: 28px 0; font-size: 15px; line-height: 1.6; color: #374151;">
      <p style="margin: 0 0 16px;"><strong>From:</strong> ${escapeHtml(name)} &lt;${escapeHtml(email)}&gt;</p>
      <p style="margin: 0 0 16px;"><strong>Subject:</strong> ${escapeHtml(subject)}</p>
      <div style="background: #f9fafb; border: 1px solid #f3f4f6; border-radius: 12px; padding: 16px; white-space: pre-wrap;">${escapeHtml(message)}</div>
      <p style="margin: 16px 0 0; font-size: 13px; color: #9ca3af;">Reply directly to this email to respond to the customer.</p>
    </div>
  </div>
`;

const buildContactFormText = ({ name, email, subject, message }) =>
  [
    'New contact message — FlagHouse',
    '',
    `From: ${name} <${email}>`,
    `Subject: ${subject}`,
    '',
    message,
    '',
    'Reply to the customer at their email address above.',
  ].join('\n');

/**
 * Sends contact form submission to the FlagHouse inbox via Resend.
 */
export const sendContactFormEmail = async ({ to, fromCustomer }) => {
  const { name, email, subject, message } = fromCustomer;
  const resend = getResend();

  if (!resend) {
    console.log('[email] Contact form (console mode):', { to, fromCustomer });
    return { sent: false, mode: 'console' };
  }

  const { error } = await resend.emails.send({
    from: getEmailFrom(),
    to,
    replyTo: email,
    subject: `[FlagHouse Contact] ${subject}`,
    html: buildContactFormHtml({ name, email, subject, message }),
    text: buildContactFormText({ name, email, subject, message }),
  });

  if (error) {
    throw new Error(error.message || 'Failed to send contact email');
  }

  console.log(`[email] Contact form sent from ${email} → ${to}`);
  return { sent: true, mode: 'email' };
};
