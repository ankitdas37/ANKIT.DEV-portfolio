<p align="center">
  <img src="public/banner.jpg" alt="ANKIT.DEV Banner" width="100%" />
</p>

<h1 align="center">ANKIT.DEV — Full-Stack Developer Portfolio</h1>

<p align="center">
  <strong>A modern, dynamic, and fully-featured developer portfolio with a custom admin dashboard, 2FA authentication, and real-time security alerts.</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=white" />
  <img src="https://img.shields.io/badge/Vite-8-646CFF?style=for-the-badge&logo=vite&logoColor=white" />
  <img src="https://img.shields.io/badge/TailwindCSS-4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" />
  <img src="https://img.shields.io/badge/Express-5-000000?style=for-the-badge&logo=express&logoColor=white" />
  <img src="https://img.shields.io/badge/MySQL-8-4479A1?style=for-the-badge&logo=mysql&logoColor=white" />
  <img src="https://img.shields.io/badge/Node.js-25-339933?style=for-the-badge&logo=node.js&logoColor=white" />
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Auth-2FA%20%2B%20Google%20OAuth-F59E0B?style=flat-square" />
  <img src="https://img.shields.io/badge/Security-Rate%20Limited%20%2B%20Alerts-EF4444?style=flat-square" />
  <img src="https://img.shields.io/badge/Uploads-Cloudinary-3448C5?style=flat-square" />
  <img src="https://img.shields.io/badge/Smooth%20Scroll-Lenis-8B5CF6?style=flat-square" />
</p>

---

## ✨ Features

### 🌐 Frontend
- ⚡ **Blazing fast** — Vite 8 + React 19
- 🎨 **Stunning UI** — TailwindCSS 4, Framer Motion animations, glassmorphism
- 🌊 **Smooth scrolling** — Lenis smooth scroll engine
- 🌍 **3D elements** — Three.js powered interactive globe
- 📱 **Fully responsive** — Desktop, tablet, and mobile with a custom mobile dock
- 📝 **Blog system** — Markdown-powered with rich text rendering
- 📄 **Dynamic pages** — Projects, Contact, Blog, Start Project

### 🔐 Admin Dashboard
- 🛡️ **2-Factor Authentication** — Password + Email OTP verification
- 🔵 **Google OAuth login** — Restricted to authorized email only
- 📊 **Full CMS** — Manage projects, skills, education, about, blog, and more
- 📤 **File uploads** — Images, docs, CVs via Cloudinary & local storage
- 🔔 **Security alerts** — Email notifications with IP, device, and browser on every login
- 🚫 **Brute-force protection** — Rate limiting + IP lockout

### 🔧 Backend
- 🚀 **Express 5** — Modern Node.js REST API
- 🗄️ **MySQL** — Relational database with structured schemas
- 📧 **Gmail API** — OTP delivery and security alert emails
- 🔒 **JWT authentication** — Secure token-based sessions
- 🛑 **CORS protection** — Restricted origins
- ❤️ **Health check** — `/health` endpoint for uptime monitoring

---

## 🛠️ Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| **Frontend Framework** | React | 19.2 |
| **Build Tool** | Vite | 8.2 |
| **Styling** | TailwindCSS | 4.3 |
| **Animations** | Framer Motion | 13.2 |
| **3D Graphics** | Three.js + React Three Fiber | 0.185 |
| **Smooth Scroll** | Lenis | 1.3 |
| **Icons** | Lucide React | 1.41 |
| **Routing** | React Router DOM | 7.18 |
| **Markdown** | React Markdown + Remark GFM | 10.1 |
| **Auth UI** | @react-oauth/google | 0.13 |
| **Backend** | Express.js | 5.2 |
| **Database** | MySQL | 8+ |
| **ORM** | mysql2 | 3.24 |
| **Auth** | JWT + bcrypt | 9.0 / 6.0 |
| **Email** | Gmail API (googleapis) | 180 |
| **File Upload** | Multer + Cloudinary | 2.3 / 2.11 |
| **Security** | express-rate-limit | 8.7 |

---

## 📁 Project Structure

```
ankit.dev/
├── 📂 public/                    # Static assets
│   ├── favicon.svg
│   ├── icons.svg
│   └── banner.jpg
│
├── 📂 src/                       # Frontend source
│   ├── 📂 assets/                # Images (hero, profile, projects)
│   ├── 📂 components/            # Reusable UI components
│   │   ├── Navbar.jsx
│   │   ├── Footer.jsx
│   │   ├── MobileDock.jsx
│   │   ├── BackToTop.jsx
│   │   ├── ScrollToTop.jsx
│   │   ├── SocialIcons.jsx
│   │   └── 📂 Contact/           # Contact page components
│   │       ├── ContactForm.jsx
│   │       ├── Globe3D.jsx
│   │       └── ...
│   │
│   ├── 📂 sections/              # Homepage sections
│   │   ├── Hero.jsx
│   │   ├── About.jsx
│   │   ├── Projects.jsx
│   │   ├── Skills.jsx
│   │   ├── Education.jsx
│   │   ├── Certificates.jsx
│   │   ├── Blog.jsx
│   │   ├── Gallery.jsx
│   │   ├── Testimonials.jsx
│   │   ├── StatsBar.jsx
│   │   ├── Contact.jsx
│   │   └── ContactCTA.jsx
│   │
│   ├── 📂 pages/                 # Route pages
│   │   ├── Home.jsx
│   │   ├── AdminPage.jsx         # Full admin CMS (240KB+)
│   │   ├── ProjectsPage.jsx
│   │   ├── ProjectDetailsPage.jsx
│   │   ├── BlogPage.jsx
│   │   ├── BlogPostDetailPage.jsx
│   │   ├── ContactPage.jsx
│   │   └── StartProjectPage.jsx
│   │
│   ├── 📂 context/               # React context
│   │   └── DataContext.jsx       # Global data provider
│   │
│   ├── 📂 hooks/                 # Custom hooks
│   │   └── useScrollSpy.js
│   │
│   ├── 📂 data/                  # Static data / fallback
│   │   └── portfolio.js
│   │
│   ├── App.jsx                   # Root layout + routes
│   ├── main.jsx                  # Entry point + ErrorBoundary
│   └── index.css                 # Global styles
│
├── 📂 backend/                   # Express API server
│   ├── 📂 config/
│   │   └── db.js                 # MySQL connection pool
│   │
│   ├── 📂 middleware/
│   │   └── authMiddleware.js     # JWT verification
│   │
│   ├── 📂 routes/
│   │   ├── authRoutes.js         # 2FA login, Google OAuth, OTP, security alerts
│   │   ├── portfolioRoutes.js    # Projects CRUD
│   │   ├── aboutRoutes.js        # About section
│   │   ├── educationRoutes.js    # Education entries
│   │   ├── skillRoutes.js        # Skills management
│   │   ├── infoRoutes.js         # Site info / hero data
│   │   ├── messageRoutes.js      # Contact form messages
│   │   ├── proposalRoutes.js     # Project proposals
│   │   ├── contactLinksRoutes.js # Social links
│   │   ├── cvRoutes.js           # CV/Resume management
│   │   ├── categoriesRoutes.js   # Project categories
│   │   └── uploadRoutes.js       # File uploads
│   │
│   ├── 📂 uploads/               # Local file uploads
│   ├── server.js                 # Express app entry point
│   ├── database.sql              # Full database schema
│   └── .env                      # Environment variables
│
├── index.html                    # HTML entry point
├── vite.config.js                # Vite configuration
├── package.json                  # Frontend dependencies
└── .env                          # Frontend env vars
```

---

## 🚀 Getting Started (Localhost)

### Prerequisites
- **Node.js** v18+ ([Download](https://nodejs.org))
- **MySQL** 8+ ([Download](https://dev.mysql.com/downloads/))
- **Git** ([Download](https://git-scm.com))

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/ankit.dev.git
cd ankit.dev
```

### 2. Setup the Database

```bash
# Login to MySQL
mysql -u root -p

# Create database and import schema
CREATE DATABASE portfolio_db;
USE portfolio_db;
SOURCE backend/database.sql;
```

### 3. Configure Environment Variables

**Backend** — Create `backend/.env`:
```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=portfolio_db

# Gmail API (for OTP & alerts)
GMAIL_USER=your_email@gmail.com
GMAIL_CLIENT_ID=your_google_client_id
GMAIL_CLIENT_SECRET=your_google_client_secret
GMAIL_REFRESH_TOKEN=your_gmail_refresh_token

# Cloudinary (for image uploads)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Google OAuth (for admin login)
GOOGLE_CLIENT_ID=your_google_client_id

# Security
JWT_SECRET=generate_a_64_char_random_hex_string
```

**Frontend** — Create `.env` in root:
```env
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
VITE_CLOUDINARY_UPLOAD_PRESET=your_upload_preset
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

### 4. Install Dependencies

```bash
# Frontend
npm install

# Backend
cd backend
npm install
cd ..
```

### 5. Seed the Admin User

```bash
cd backend
node migrate-admin.js
cd ..
```

### 6. Run the Application

Open **two terminals**:

```bash
# Terminal 1 — Backend (port 5000)
cd backend
npm run dev

# Terminal 2 — Frontend (port 5173)
npm run dev
```

### 7. Access the App

| Page | URL |
|------|-----|
| 🏠 Homepage | http://localhost:5173 |
| 🔐 Admin Panel | http://localhost:5173/admin |
| ❤️ API Health | http://localhost:5000/health |

---

## 🌍 Deployment

### Recommended Stack

| Service | Platform | Tier |
|---------|----------|------|
| Frontend | **Vercel** | Free |
| Backend | **Render** | Free |
| Database | **Aiven** / **TiDB** | Free |

### Deploy Frontend to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### Deploy Backend to Render

1. Push `backend/` to GitHub
2. Create a new **Web Service** on [Render](https://render.com)
3. Set build command: `npm install`
4. Set start command: `node server.js`
5. Add all environment variables from `.env`
6. Set up **UptimeRobot** to ping `/health` every 5 minutes

### Deploy Database

1. Create a free MySQL instance on [Aiven](https://aiven.io)
2. Import `backend/database.sql`
3. Update `DB_HOST`, `DB_USER`, `DB_PASSWORD` on Render

---

## 🔐 Security Features

| Feature | Description |
|---------|-------------|
| 🔑 2FA Authentication | Password + Email OTP |
| 🔵 Google OAuth | Restricted to authorized email |
| 🛑 Rate Limiting | 10 login attempts / 15 min |
| 🔒 IP Lockout | 5 failed attempts = 15-min ban |
| 🛡️ OTP Protection | 3 wrong codes = OTP destroyed |
| 📧 Login Alerts | Email with IP, device, browser |
| ⚠️ Attack Alerts | Brute-force & unauthorized access notifications |
| 🔐 JWT Security | 128-char cryptographic secret |
| 🌐 CORS Restricted | Only allowed origins |

---

## 📸 Screenshots

> Add your screenshots here after deploying!

---

## 📄 License

This project is private and built by **Ankit Das**.

---

<p align="center">
  Built with ❤️ by <strong>Ankit Das</strong>
</p>
