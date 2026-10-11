import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { User } from '../models/User.js';
import {
  registerUser,
  validateCredentials,
  signAccessToken,
  signRefreshToken,
  refreshCookieOptions,
  toPublicUser,
} from '../services/auth.js';

function setRefreshCookie(res, token) {
  res.cookie('refreshToken', token, refreshCookieOptions());
}

export async function register(req, res, next) {
  try {
    const { username, email, password } = req.body;
    const user = await registerUser({ username, email, password });
    const accessToken = signAccessToken(user._id);
    setRefreshCookie(res, signRefreshToken(user._id));
    res.status(201).json({ accessToken, user: toPublicUser(user) });
  } catch (err) {
    next(err);
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const user = await validateCredentials({ email, password });
    const accessToken = signAccessToken(user._id);
    setRefreshCookie(res, signRefreshToken(user._id));
    res.json({ accessToken, user: toPublicUser(user) });
  } catch (err) {
    next(err);
  }
}

export async function refresh(req, res, next) {
  try {
    const token = req.cookies?.refreshToken;
    if (!token) return res.status(401).json({ message: 'Missing refresh token' });
    let payload;
    try {
      payload = jwt.verify(token, env.JWT_REFRESH_SECRET);
    } catch {
      return res.status(401).json({ message: 'Invalid or expired refresh token' });
    }
    const user = await User.findById(payload.sub);
    if (!user) return res.status(401).json({ message: 'Invalid refresh token' });
    const accessToken = signAccessToken(user._id);
    // Rotate refresh token
    setRefreshCookie(res, signRefreshToken(user._id));
    res.json({ accessToken, user: toPublicUser(user) });
  } catch (err) {
    next(err);
  }
}

export async function logout(req, res, next) {
  try {
    res.clearCookie('refreshToken', { ...refreshCookieOptions(), maxAge: undefined });
    res.json({ message: 'Logged out' });
  } catch (err) {
    next(err);
  }
}

export async function me(req, res, next) {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(401).json({ message: 'User not found' });
    res.json({ user: toPublicUser(user) });
  } catch (err) {
    next(err);
  }
}

export async function updateMe(req, res, next) {
  try {
    const allowed = {};
    for (const k of ['bio', 'avatar', 'timezone']) {
      if (req.body[k] !== undefined) allowed[k] = req.body[k];
    }
    // Dot notation so updating one handle never wipes the other.
    for (const k of ['leetcode', 'codeforces']) {
      if (req.body.handles?.[k] !== undefined) allowed[`handles.${k}`] = req.body.handles[k];
    }
    for (const k of ['profilePublic', 'showHeatmap', 'showProjects']) {
      if (req.body.privacy?.[k] !== undefined) allowed[`privacy.${k}`] = req.body.privacy[k];
    }
    const user = await User.findByIdAndUpdate(req.user.id, { $set: allowed }, {
      new: true,
      runValidators: true,
    });
    if (!user) return res.status(401).json({ message: 'User not found' });
    res.json({ user: toPublicUser(user) });
  } catch (err) {
    next(err);
  }
}
