import { Resend } from 'resend';

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
