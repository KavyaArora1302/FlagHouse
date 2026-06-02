import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';
import { formatUser } from '../utils/formatUser.js';
import { signToken } from '../utils/token.js';
import { roleForEmail } from '../utils/adminEmail.js';

const sendAuthResponse = (res, user, statusCode = 200) => {
  const token = signToken(user._id);
  res.status(statusCode).json({
    user: formatUser(user),
    token,
  });
};

export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name?.trim() || !email?.trim() || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existing = await User.findOne({ email: normalizedEmail });

    if (existing) {
      return res.status(409).json({ message: 'An account with this email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role: roleForEmail(normalizedEmail),
    });

    sendAuthResponse(res, user, 201);
  } catch (error) {
    console.error('register error:', error);
    res.status(500).json({ message: 'Failed to register user' });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email?.trim() || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email: email.trim().toLowerCase() }).select('+password');

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    sendAuthResponse(res, user);
  } catch (error) {
    console.error('login error:', error);
    res.status(500).json({ message: 'Failed to log in' });
  }
};

export const getMe = async (req, res) => {
  res.json({ user: formatUser(req.user) });
};
