import { sendContactFormEmail } from '../services/email.js';
import { getContactInboxEmail } from '../utils/contactEmail.js';

const MAX_MESSAGE_LENGTH = 5000;
const MAX_SUBJECT_LENGTH = 200;
const MAX_NAME_LENGTH = 100;

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export const submitContactForm = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name?.trim() || !email?.trim() || !message?.trim()) {
      return res.status(400).json({ message: 'Name, email, and message are required' });
    }

    if (name.trim().length > MAX_NAME_LENGTH) {
      return res.status(400).json({ message: 'Name is too long' });
    }

    const normalizedEmail = email.trim().toLowerCase();

    if (!isValidEmail(normalizedEmail)) {
      return res.status(400).json({ message: 'Please enter a valid email address' });
    }

    if (message.trim().length > MAX_MESSAGE_LENGTH) {
      return res.status(400).json({ message: 'Message is too long' });
    }

    const subjectLine = (subject?.trim() || 'Contact form message').slice(0, MAX_SUBJECT_LENGTH);

    const inbox = getContactInboxEmail();
    if (!inbox) {
      console.error('submitContactForm: CONTACT_EMAIL or ADMIN_EMAIL not configured');
      return res.status(503).json({ message: 'Contact form is not configured on the server' });
    }

    await sendContactFormEmail({
      to: inbox,
      fromCustomer: {
        name: name.trim(),
        email: normalizedEmail,
        subject: subjectLine,
        message: message.trim(),
      },
    });

    res.json({
      message: 'Thanks for reaching out. We will get back to you within 24 hours.',
    });
  } catch (error) {
    console.error('submitContactForm error:', error);
    res.status(500).json({ message: 'Failed to send message. Please try again later.' });
  }
};
