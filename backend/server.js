const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();

// ─── Security: CORS ──────────────────────────────────────
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
  'https://ankit-dev-portfolio.vercel.app',
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl, Postman in dev)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    // As a fallback for personal portfolios, if the origin includes vercel.app, allow it
    if (origin.endsWith('.vercel.app')) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'), false);
  },
  credentials: true,
}));

// ─── Security: Trust proxy (for correct IP behind reverse proxy) ──
app.set('trust proxy', 1);

// ─── Security: Global rate limiter ───────────────────────
const globalLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,   // 1 minute
  max: 100,                    // 100 requests per minute per IP
  message: { error: 'Too many requests. Please slow down.' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', globalLimiter);

// ─── Middleware ──────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));

// Routes
const portfolioRoutes = require('./routes/portfolioRoutes');
const categoriesRoutes = require('./routes/categoriesRoutes');
const infoRoutes = require('./routes/infoRoutes');
const aboutRoutes = require('./routes/aboutRoutes');
const educationRoutes = require('./routes/educationRoutes');
const skillRoutes = require('./routes/skillRoutes');
const proposalRoutes = require('./routes/proposalRoutes');
const messageRoutes = require('./routes/messageRoutes');
const contactLinksRoutes = require('./routes/contactLinksRoutes');
const authRoutes = require('./routes/authRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const cvRoutes     = require('./routes/cvRoutes');
const authMiddleware = require('./middleware/authMiddleware');

// Auth route (before auth middleware)
app.use('/api/auth', authRoutes);

// Apply auth middleware to all other /api routes
app.use('/api', authMiddleware);

app.use('/api/projects', portfolioRoutes);
app.use('/api/categories', categoriesRoutes);
app.use('/api/info', infoRoutes);
app.use('/api/about', aboutRoutes);
app.use('/api/education', educationRoutes);
app.use('/api/skills', skillRoutes);
app.use('/api/proposals', proposalRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/contact-links', contactLinksRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/cv',     cvRoutes);

// Serve static uploads
const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check route (for Render / uptime monitors)
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is healthy',
    timestamp: new Date().toISOString(),
  });
});

// Base route
app.get('/', (req, res) => {
  res.send('API is running...');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
