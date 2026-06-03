import { getAdminEmails } from './adminEmail.js';

/** Inbox for contact form submissions — CONTACT_EMAIL or first ADMIN_EMAIL */
export const getContactInboxEmail = () => {
  const contact = process.env.CONTACT_EMAIL?.trim().toLowerCase();
  if (contact) return contact;

  const [admin] = getAdminEmails();
  return admin || null;
};
