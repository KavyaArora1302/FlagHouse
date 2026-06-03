import crypto from 'crypto';

export const getWebhookSecret = () => process.env.RAZORPAY_WEBHOOK_SECRET?.trim() || '';

export const isWebhookConfigured = () => Boolean(getWebhookSecret());

/** Verify Razorpay webhook signature against raw request body */
export const verifyWebhookSignature = (rawBody, signature) => {
  const secret = getWebhookSecret();
  if (!secret || !signature) return false;

  const expected = crypto.createHmac('sha256', secret).update(rawBody).digest('hex');
  return expected === signature;
};

/** Verify checkout payment signature (client callback) */
export const verifyPaymentSignature = (razorpayOrderId, razorpayPaymentId, signature) => {
  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!secret || !signature) return false;

  const expected = crypto
    .createHmac('sha256', secret)
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest('hex');

  return expected === signature;
};
