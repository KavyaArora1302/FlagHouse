import crypto from 'crypto';
import { getClientBaseUrl } from './clientUrl.js';

const RESET_EXPIRY_MS = 60 * 60 * 1000; // 1 hour

export const generateResetToken = () => crypto.randomBytes(32).toString('hex');

export const hashResetToken = (token) =>
  crypto.createHash('sha256').update(token).digest('hex');

export const getResetTokenExpiry = () => new Date(Date.now() + RESET_EXPIRY_MS);

export const buildResetPasswordUrl = (token) =>
  `${getClientBaseUrl()}/reset-password?token=${token}`;
