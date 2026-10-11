import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { User } from '../models/User.js';

export function signAccessToken(userId) {
  return jwt.sign({}, env.JWT_ACCESS_SECRET, { subject: String(userId), expiresIn: '15m' });
}

export function signRefreshToken(userId) {
  return jwt.sign({}, env.JWT_REFRESH_SECRET, { subject: String(userId), expiresIn: '7d' });
}

export function refreshCookieOptions() {
  return {
    httpOnly: true,
    secure: env.isProd,
    sameSite: env.isProd ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/api/auth',
  };
}

export function toPublicUser(user) {
  return {
    id: String(user._id),
    username: user.username,
    email: user.email,
    bio: user.bio,
    avatar: user.avatar,
    handles: user.handles,
    privacy: user.privacy,
    timezone: user.timezone,
    createdAt: user.createdAt,
  };
}

export async function registerUser({ username, email, password }) {
  const existing = await User.findOne({ $or: [{ email }, { username }] }).lean();
  if (existing) {
    const err = new Error(
      existing.email === email.toLowerCase() ? 'Email already in use' : 'Username already taken'
    );
    err.statusCode = 409;
    throw err;
  }
  const passwordHash = await bcrypt.hash(password, 12);
  const user = await User.create({ username, email, passwordHash });
  return user;
}

export async function validateCredentials({ email, password }) {
  const user = await User.findOne({ email: email.toLowerCase() }).select('+passwordHash');
  if (!user) {
    const err = new Error('Invalid credentials');
    err.statusCode = 401;
    throw err;
  }
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) {
    const err = new Error('Invalid credentials');
    err.statusCode = 401;
    throw err;
  }
  return user;
}
