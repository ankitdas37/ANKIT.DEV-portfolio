const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key_change_me';

const authMiddleware = (req, res, next) => {
  // We only want to protect endpoints that modify data (POST, PUT, DELETE)
  // GET requests are public (except maybe specific ones, but generally they are fine)
  // We also want to skip authentication for specific public POST routes like contact form and proposals.
  
  if (req.method === 'GET') {
    return next();
  }

  // Allow public submissions for these specific endpoints
  if (req.originalUrl.startsWith('/api/messages') && req.method === 'POST') {
    return next();
  }
  if (req.originalUrl.startsWith('/api/proposals') && req.method === 'POST') {
    return next();
  }

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: No token provided' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    console.error('JWT Verification failed:', err.message);
    return res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
};

module.exports = authMiddleware;
