/** Comma-separated ADMIN_EMAIL values from env (lowercased). */
export const getAdminEmails = () =>
  (process.env.ADMIN_EMAIL || '')
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);

export const isAdminEmail = (email) => {
  const normalized = email?.trim().toLowerCase();
  if (!normalized) return false;
  return getAdminEmails().includes(normalized);
};

export const roleForEmail = (email) => (isAdminEmail(email) ? 'admin' : 'user');
