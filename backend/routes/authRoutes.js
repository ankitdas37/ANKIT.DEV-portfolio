const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { google } = require('googleapis');
const MailComposer = require('nodemailer/lib/mail-composer');
const { OAuth2Client } = require('google-auth-library');
const rateLimit = require('express-rate-limit');
const db = require('../config/db');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key_change_me';
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';
const ADMIN_EMAIL = 'ankitdas082006@gmail.com';

// Setup Google Auth Client if client ID exists
const googleClient = GOOGLE_CLIENT_ID ? new OAuth2Client(GOOGLE_CLIENT_ID) : null;

// Setup Gmail API OAuth2 Client
const oAuth2Client = new google.auth.OAuth2(
  process.env.GMAIL_CLIENT_ID,
  process.env.GMAIL_CLIENT_SECRET,
  "https://developers.google.com/oauthplayground"
);

if (process.env.GMAIL_REFRESH_TOKEN) {
  oAuth2Client.setCredentials({ refresh_token: process.env.GMAIL_REFRESH_TOKEN });
}
const gmail = google.gmail({ version: 'v1', auth: oAuth2Client });

// ─── Security: In-memory stores ──────────────────────────────
const otpStore = new Map();           // email -> { code, expires, attempts }
const failedLoginStore = new Map();   // ip -> { count, lastAttempt, locked }

// ─── Rate Limiters ───────────────────────────────────────────
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 10,                    // 10 requests per window
  message: { error: 'Too many login attempts. Try again in 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const otpLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,   // 5 minutes
  max: 5,                     // 5 requests per window
  message: { error: 'Too many OTP requests. Try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// ─── Helpers ─────────────────────────────────────────────────
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

const getClientIP = (req) => {
  return req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
         req.connection?.remoteAddress ||
         req.socket?.remoteAddress ||
         'Unknown';
};

const getDeviceInfo = (req) => {
  const ua = req.headers['user-agent'] || 'Unknown';
  
  // Detect device
  let device = 'Unknown Device';
  if (/iPhone/i.test(ua)) device = 'iPhone';
  else if (/iPad/i.test(ua)) device = 'iPad';
  else if (/Android/i.test(ua)) device = 'Android';
  else if (/Macintosh/i.test(ua)) device = 'Mac';
  else if (/Windows/i.test(ua)) device = 'Windows PC';
  else if (/Linux/i.test(ua)) device = 'Linux';

  // Detect browser
  let browser = 'Unknown Browser';
  if (/Edg\//i.test(ua)) browser = 'Microsoft Edge';
  else if (/Chrome/i.test(ua)) browser = 'Google Chrome';
  else if (/Firefox/i.test(ua)) browser = 'Mozilla Firefox';
  else if (/Safari/i.test(ua)) browser = 'Safari';
  else if (/Opera|OPR/i.test(ua)) browser = 'Opera';

  return { device, browser, userAgent: ua };
};

const formatTime = () => {
  return new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
};

// Send email using Gmail API
const sendEmail = async (to, subject, text) => {
  const mailOptions = { from: process.env.GMAIL_USER, to, subject, text };
  const mail = new MailComposer(mailOptions);
  const compiledMessage = await mail.compile().build();
  const encodedMessage = Buffer.from(compiledMessage)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  return gmail.users.messages.send({
    userId: 'me',
    requestBody: { raw: encodedMessage },
  });
};

// Send HTML email for rich alerts
const sendHtmlEmail = async (to, subject, html) => {
  const mailOptions = { from: process.env.GMAIL_USER, to, subject, html };
  const mail = new MailComposer(mailOptions);
  const compiledMessage = await mail.compile().build();
  const encodedMessage = Buffer.from(compiledMessage)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  return gmail.users.messages.send({
    userId: 'me',
    requestBody: { raw: encodedMessage },
  });
};

// Send security alert email (non-blocking)
const sendSecurityAlert = (type, req, extra = {}) => {
  const ip = getClientIP(req);
  const { device, browser } = getDeviceInfo(req);
  const time = formatTime();

  let subject, color, icon, title, details;

  switch (type) {
    case 'login_success':
      subject = '✅ Admin Login Successful';
      color = '#10B981'; icon = '✅'; title = 'Successful Admin Login';
      details = `Someone successfully logged into your admin panel.`;
      break;
    case 'google_login_success':
      subject = '✅ Google Login Successful';
      color = '#3B82F6'; icon = '🔵'; title = 'Google Login Successful';
      details = `Google account login: ${extra.email || 'Unknown'}`;
      break;
    case 'failed_login':
      subject = '⚠️ Suspicious Login Activity';
      color = '#F59E0B'; icon = '⚠️'; title = 'Failed Login Attempts Detected';
      details = `${extra.attempts || 0} failed password attempts detected from this IP.`;
      break;
    case 'account_locked':
      subject = '🔴 Account Locked — Brute Force Detected';
      color = '#EF4444'; icon = '🚨'; title = 'Account Locked!';
      details = `Too many failed login attempts. IP has been locked out for 15 minutes.`;
      break;
    case 'otp_bruteforce':
      subject = '⚠️ OTP Brute-Force Attempt';
      color = '#EF4444'; icon = '🔴'; title = 'OTP Brute-Force Detected';
      details = `${extra.attempts || 0} wrong OTP codes entered. OTP has been invalidated.`;
      break;
    case 'unauthorized_google':
      subject = '⚠️ Unauthorized Google Login Attempt';
      color = '#EF4444'; icon = '🚫'; title = 'Unauthorized Google Login';
      details = `Someone tried to login with: ${extra.email || 'Unknown email'}`;
      break;
    default:
      subject = '🔔 Security Alert';
      color = '#6B7280'; icon = '🔔'; title = 'Security Event';
      details = 'An unknown security event occurred.';
  }

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 500px; margin: 0 auto; background: #0F172A; border-radius: 16px; overflow: hidden; border: 1px solid #1E293B;">
      <div style="background: ${color}; padding: 20px; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 20px;">${icon} ${title}</h1>
      </div>
      <div style="padding: 24px; color: #CBD5E1;">
        <p style="margin: 0 0 20px; font-size: 15px; line-height: 1.5;">${details}</p>
        <table style="width: 100%; border-collapse: collapse;">
          <tr><td style="padding: 10px 0; border-bottom: 1px solid #1E293B; color: #94A3B8; font-size: 13px;">🌐 IP Address</td><td style="padding: 10px 0; border-bottom: 1px solid #1E293B; color: white; font-weight: 600; text-align: right; font-size: 13px;">${ip}</td></tr>
          <tr><td style="padding: 10px 0; border-bottom: 1px solid #1E293B; color: #94A3B8; font-size: 13px;">💻 Device</td><td style="padding: 10px 0; border-bottom: 1px solid #1E293B; color: white; font-weight: 600; text-align: right; font-size: 13px;">${device}</td></tr>
          <tr><td style="padding: 10px 0; border-bottom: 1px solid #1E293B; color: #94A3B8; font-size: 13px;">🌍 Browser</td><td style="padding: 10px 0; border-bottom: 1px solid #1E293B; color: white; font-weight: 600; text-align: right; font-size: 13px;">${browser}</td></tr>
          <tr><td style="padding: 10px 0; color: #94A3B8; font-size: 13px;">🕐 Time</td><td style="padding: 10px 0; color: white; font-weight: 600; text-align: right; font-size: 13px;">${time}</td></tr>
        </table>
      </div>
      <div style="padding: 16px 24px; background: #1E293B; text-align: center;">
        <p style="margin: 0; color: #64748B; font-size: 12px;">ANKIT.DEV Security System</p>
      </div>
    </div>
  `;

  // Send alert asynchronously (don't block the response)
  sendHtmlEmail(ADMIN_EMAIL, subject, html).catch(err => {
    console.error('Failed to send security alert:', err.message);
  });
};

// Check if IP is locked out
const isLockedOut = (ip) => {
  const record = failedLoginStore.get(ip);
  if (!record || !record.locked) return false;
  if (Date.now() > record.lockExpires) {
    failedLoginStore.delete(ip);
    return false;
  }
  return true;
};

// Record failed login attempt
const recordFailedLogin = (ip, req) => {
  const record = failedLoginStore.get(ip) || { count: 0 };
  record.count += 1;
  record.lastAttempt = Date.now();

  if (record.count >= 5) {
    record.locked = true;
    record.lockExpires = Date.now() + 15 * 60 * 1000; // 15 min lockout
    failedLoginStore.set(ip, record);
    sendSecurityAlert('account_locked', req, { attempts: record.count });
  } else if (record.count >= 3) {
    failedLoginStore.set(ip, record);
    sendSecurityAlert('failed_login', req, { attempts: record.count });
  } else {
    failedLoginStore.set(ip, record);
  }
};

// Clear failed login on success
const clearFailedLogins = (ip) => {
  failedLoginStore.delete(ip);
};


// ═══════════════════════════════════════════════════════════
// 1. Password Login (Step 1 of 2FA)
// ═══════════════════════════════════════════════════════════
router.post('/login', loginLimiter, async (req, res) => {
  const { password } = req.body;
  const ip = getClientIP(req);

  // Check lockout
  if (isLockedOut(ip)) {
    return res.status(429).json({ error: 'Account locked due to too many failed attempts. Try again in 15 minutes.' });
  }

  try {
    const [rows] = await db.query('SELECT * FROM admin_users LIMIT 1');
    if (rows.length === 0) return res.status(401).json({ error: 'No admin user configured.' });
    
    const admin = rows[0];
    const isMatch = await bcrypt.compare(password, admin.password_hash);
    
    if (isMatch) {
      clearFailedLogins(ip);

      const otp = generateOTP();
      otpStore.set(admin.email, { code: otp, expires: Date.now() + 10 * 60 * 1000, attempts: 0 });
      
      await sendEmail(admin.email, 'Your 2-Step Verification Code', `Your OTP code is: ${otp}. It will expire in 10 minutes.`);
      
      return res.json({ requireOtp: true, message: 'Password correct. OTP sent to admin email.' });
    } else {
      recordFailedLogin(ip, req);
      res.status(401).json({ error: 'Invalid credentials' });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error. Please try again.' });
  }
});


// ═══════════════════════════════════════════════════════════
// 2. Google OAuth Login
// ═══════════════════════════════════════════════════════════
router.post('/login/google', loginLimiter, async (req, res) => {
  const { credential } = req.body;
  if (!googleClient) return res.status(400).json({ error: 'Google Client ID not configured' });

  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const email = payload.email;

    if (email !== 'ankitdas082006@gmail.com') {
      sendSecurityAlert('unauthorized_google', req, { email });
      return res.status(403).json({ error: 'Access denied: Email not authorized.' });
    }

    const token = jwt.sign({ role: 'admin', email }, JWT_SECRET, { expiresIn: '1d' });
    sendSecurityAlert('google_login_success', req, { email });
    res.json({ token, message: 'Google login successful' });
  } catch (error) {
    console.error('Google login error:', error);
    res.status(401).json({ error: 'Invalid Google token' });
  }
});


// ═══════════════════════════════════════════════════════════
// 3. OTP Request (for Resend / Forgot Password)
// ═══════════════════════════════════════════════════════════
router.post('/otp/request', otpLimiter, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT email FROM admin_users LIMIT 1');
    if (rows.length === 0) return res.status(400).json({ error: 'No admin configured' });
    const adminEmail = rows[0].email;
    
    const otp = generateOTP();
    otpStore.set(adminEmail, { code: otp, expires: Date.now() + 10 * 60 * 1000, attempts: 0 });
    
    await sendEmail(adminEmail, 'Your Admin OTP Code', `Your OTP code is: ${otp}. It will expire in 10 minutes.`);
    
    res.json({ message: 'OTP sent successfully to admin email.' });
  } catch (error) {
    console.error('OTP request error:', error);
    res.status(500).json({ error: 'Failed to send OTP. Please try again.' });
  }
});


// ═══════════════════════════════════════════════════════════
// 4. OTP Verify (Step 2 of 2FA)
// ═══════════════════════════════════════════════════════════
router.post('/otp/verify', loginLimiter, async (req, res) => {
  const { otp } = req.body;
  try {
    const [rows] = await db.query('SELECT email FROM admin_users LIMIT 1');
    if (rows.length === 0) return res.status(400).json({ error: 'No admin configured' });
    const adminEmail = rows[0].email;
    
    const record = otpStore.get(adminEmail);
    if (!record) return res.status(400).json({ error: 'No OTP requested or expired' });
    
    if (Date.now() > record.expires) {
      otpStore.delete(adminEmail);
      return res.status(400).json({ error: 'OTP expired. Please request a new one.' });
    }

    // Brute-force protection: max 3 wrong attempts
    if (record.attempts >= 3) {
      otpStore.delete(adminEmail);
      sendSecurityAlert('otp_bruteforce', req, { attempts: record.attempts });
      return res.status(400).json({ error: 'Too many wrong attempts. OTP invalidated. Please request a new one.' });
    }
    
    if (record.code === otp) {
      otpStore.delete(adminEmail);
      const token = jwt.sign({ role: 'admin', email: adminEmail }, JWT_SECRET, { expiresIn: '1d' });
      
      // Send successful login alert with IP & device info
      sendSecurityAlert('login_success', req);
      
      res.json({ token, message: 'OTP verified successfully' });
    } else {
      record.attempts += 1;
      otpStore.set(adminEmail, record);
      const remaining = 3 - record.attempts;
      res.status(400).json({ error: `Invalid OTP. ${remaining} attempt${remaining !== 1 ? 's' : ''} remaining.` });
    }
  } catch (error) {
    console.error('OTP verify error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});


// ═══════════════════════════════════════════════════════════
// 5. Password Reset
// ═══════════════════════════════════════════════════════════
router.post('/password/reset', loginLimiter, async (req, res) => {
  const { otp, newPassword } = req.body;
  try {
    const [rows] = await db.query('SELECT email FROM admin_users LIMIT 1');
    if (rows.length === 0) return res.status(400).json({ error: 'No admin configured' });
    const adminEmail = rows[0].email;
    
    const record = otpStore.get(adminEmail);
    if (!record) return res.status(400).json({ error: 'No OTP requested or expired' });
    
    if (Date.now() > record.expires) {
      otpStore.delete(adminEmail);
      return res.status(400).json({ error: 'OTP expired' });
    }

    // Brute-force protection
    if (record.attempts >= 3) {
      otpStore.delete(adminEmail);
      sendSecurityAlert('otp_bruteforce', req, { attempts: record.attempts });
      return res.status(400).json({ error: 'Too many wrong attempts. OTP invalidated.' });
    }
    
    if (record.code === otp) {
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(newPassword, salt);
      
      await db.query('UPDATE admin_users SET password_hash = ? WHERE email = ?', [hash, adminEmail]);
      otpStore.delete(adminEmail);
      
      res.json({ message: 'Password reset successful. Please login with your new password.' });
    } else {
      record.attempts += 1;
      otpStore.set(adminEmail, record);
      res.status(400).json({ error: 'Invalid OTP' });
    }
  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});


// ═══════════════════════════════════════════════════════════
// 6. Token Verification
// ═══════════════════════════════════════════════════════════
router.get('/verify', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ valid: false });

  try {
    jwt.verify(token, JWT_SECRET);
    res.json({ valid: true });
  } catch (err) {
    res.status(401).json({ valid: false });
  }
});

module.exports = router;
