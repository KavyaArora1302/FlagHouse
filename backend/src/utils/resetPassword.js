import crypto from 'crypto';

const RESET_EXPIRY_MS = 60 * 60 * 1000; // 1 hour

export const generateResetToken = () => crypto.randomBytes(32).toString('hex');

export const hashResetToken = (token) =>
  crypto.createHash('sha256').update(token).digest('hex');

export const getResetTokenExpiry = () => new Date(Date.now() + RESET_EXPIRY_MS);

/** First CLIENT_URL origin for reset links */
export const getClientBaseUrl = () => {
  const raw = process.env.CLIENT_URL || 'http://localhost:5174';
  return raw.split(',')[0].trim().replace(/\/$/, '');
};

export const buildResetPasswordUrl = (token) =>
  `${getClientBaseUrl()}/reset-password?token=${token}`;
