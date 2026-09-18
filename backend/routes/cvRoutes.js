const express = require('express');
const router  = express.Router();
const multer  = require('multer');
const path    = require('path');
const fs      = require('fs');
const https   = require('https');
const http    = require('http');
const { Readable } = require('stream');
const { google } = require('googleapis');
const db = require('../config/db');

// ─── Google Drive OAuth2 (reuses same Gmail credentials) ─────────────────────
const oAuth2Client = new google.auth.OAuth2(
  process.env.GMAIL_CLIENT_ID,
  process.env.GMAIL_CLIENT_SECRET,
  'https://developers.google.com/oauthplayground'
);
if (process.env.GMAIL_REFRESH_TOKEN) {
  oAuth2Client.setCredentials({ refresh_token: process.env.GMAIL_REFRESH_TOKEN });
}
const drive = google.drive({ version: 'v3', auth: oAuth2Client });

// Fixed Google Drive file name & folder search
const DRIVE_FILENAME  = 'Ankit_Das_CV_Resume.pdf';
const DRIVE_FOLDER_ID = process.env.GOOGLE_DRIVE_FOLDER_ID || null; // optional: scope to a folder

// ─── Multer memory storage ───────────────────────────────────────────────────
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (['.pdf', '.doc', '.docx'].includes(ext)) return cb(null, true);
    cb(new Error('Only PDF / DOC / DOCX files are allowed'));
  },
});

// ─── Helper: find existing CV file on Drive ───────────────────────────────────
async function findDriveCVFile() {
  let q = `name='${DRIVE_FILENAME}' and trashed=false`;
  if (DRIVE_FOLDER_ID) q += ` and '${DRIVE_FOLDER_ID}' in parents`;

  const { data } = await drive.files.list({
    q,
    fields: 'files(id, name, webContentLink, webViewLink)',
    pageSize: 1,
  });
  return data.files && data.files.length > 0 ? data.files[0] : null;
}

// ─── Helper: delete old Drive CV files ───────────────────────────────────────
async function deleteDriveCVFiles() {
  let q = `name='${DRIVE_FILENAME}' and trashed=false`;
  if (DRIVE_FOLDER_ID) q += ` and '${DRIVE_FOLDER_ID}' in parents`;

  const { data } = await drive.files.list({ q, fields: 'files(id)', pageSize: 10 });
  if (data.files && data.files.length > 0) {
    await Promise.all(data.files.map(f => drive.files.delete({ fileId: f.id }).catch(() => {})));
    console.log(`Deleted ${data.files.length} old CV file(s) from Drive`);
  }
}

// ─── Helper: upload buffer to Google Drive ───────────────────────────────────
async function uploadToDrive(buffer, mimeType = 'application/pdf') {
  // Delete old versions first
  await deleteDriveCVFiles().catch(() => {});

  const bufStream = new Readable();
  bufStream.push(buffer);
  bufStream.push(null);

  const metadata = { name: DRIVE_FILENAME };
  if (DRIVE_FOLDER_ID) metadata.parents = [DRIVE_FOLDER_ID];

  const { data } = await drive.files.create({
    requestBody: metadata,
    media: { mimeType, body: bufStream },
    fields: 'id, name, webContentLink, webViewLink',
  });

  // Make the file publicly readable
  await drive.permissions.create({
    fileId: data.id,
    requestBody: { role: 'reader', type: 'anyone' },
  });

  console.log(`✅ CV uploaded to Google Drive: fileId=${data.id}`);
  return data;
}

// ─── Helper: get direct download URL from Drive file ID ──────────────────────
function driveDirectUrl(fileId) {
  // This URL forces download without Google Drive preview page
  return `https://drive.google.com/uc?export=download&id=${fileId}&confirm=t`;
}

// ─── Helper: extract Drive file ID from various URL formats ──────────────────
function extractDriveFileId(url) {
  // formats:
  //   https://drive.google.com/file/d/<id>/view
  //   https://drive.google.com/uc?id=<id>
  //   https://docs.google.com/...
  const patterns = [
    /\/file\/d\/([a-zA-Z0-9_-]{20,})/,
    /[?&]id=([a-zA-Z0-9_-]{20,})/,
    /\/d\/([a-zA-Z0-9_-]{20,})\//,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
}

// ─── POST /api/cv/upload ──────────────────────────────────────────────────────
// Upload CV to Google Drive → make public → save webContentLink to DB
router.post('/upload', upload.single('cv'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    const ext      = path.extname(req.file.originalname).toLowerCase();
    const mimeType = ext === '.pdf' ? 'application/pdf'
                   : ext === '.docx' ? 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
                   : 'application/msword';

    console.log('Uploading CV to Google Drive...');
    const driveFile = await uploadToDrive(req.file.buffer, mimeType);

    // Direct download URL (bypasses Drive preview)
    const cvUrl = driveDirectUrl(driveFile.id);

    // Persist to DB
    await db.query('UPDATE about_me SET cv_url = ? WHERE id = 1', [cvUrl]);

    res.json({
      success:  true,
      cv_url:   cvUrl,
      file_id:  driveFile.id,
      storage:  'google_drive',
    });

  } catch (err) {
    console.error('CV Google Drive upload error:', err);
    const msg = err.message || 'Server Error during CV upload';
    res.status(500).json({ message: msg });
  }
});

// ─── GET /api/cv/download ─────────────────────────────────────────────────────
// Proxy CV → force filename "Ankit_Das_CV_Resume.pdf" on all devices
// Handles: Google Drive URLs, local URLs, any other URL
// @access Public
router.get('/download', async (req, res) => {
  try {
    // Get cv_url from DB
    const [rows] = await db.query('SELECT cv_url FROM about_me WHERE id = 1');
    if (!rows.length || !rows[0].cv_url) {
      return res.status(404).json({ message: 'No CV uploaded yet. Please upload from the Admin panel.' });
    }

    const cvUrl = rows[0].cv_url;
    console.log('CV download requested. URL:', cvUrl);

    // ── A. Google Drive URL → rewrite to direct download ─────────────────────
    const isDriveUrl = cvUrl.includes('drive.google.com') || cvUrl.includes('docs.google.com');
    if (isDriveUrl) {
      // Extract file ID and build a fresh direct download URL
      const fileId = extractDriveFileId(cvUrl);
      if (!fileId) {
        return res.status(400).json({ message: 'Could not extract Google Drive file ID from stored URL. Please re-upload.' });
      }

      // Use Drive API to get the file and stream it (authenticated, no "untrusted" issues)
      const driveRes = await drive.files.get(
        { fileId, alt: 'media' },
        { responseType: 'stream' }
      );

      res.setHeader('Content-Disposition', 'attachment; filename="Ankit_Das_CV_Resume.pdf"');
      res.setHeader('Content-Type', driveRes.headers['content-type'] || 'application/pdf');
      if (driveRes.headers['content-length'])
        res.setHeader('Content-Length', driveRes.headers['content-length']);
      res.setHeader('Cache-Control', 'no-cache');

      driveRes.data.pipe(res);

      driveRes.data.on('error', (err) => {
        console.error('Drive stream error:', err);
        if (!res.headersSent) res.status(500).json({ message: 'Error streaming CV from Drive.' });
      });
      return;
    }

    // ── B. Local file ─────────────────────────────────────────────────────────
    if (cvUrl.includes('/uploads/')) {
      const filename = cvUrl.split('/uploads/')[1];
      const filePath = path.join(uploadDir, filename);
      if (fs.existsSync(filePath)) {
        res.setHeader('Content-Disposition', 'attachment; filename="Ankit_Das_CV_Resume.pdf"');
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Cache-Control', 'no-cache');
        return fs.createReadStream(filePath).pipe(res);
      }
    }

    // ── C. Generic external URL proxy ─────────────────────────────────────────
    const protocol = cvUrl.startsWith('https') ? https : http;
    const proxyReq = protocol.get(cvUrl, (proxyRes) => {
      if (proxyRes.statusCode !== 200) {
        let body = '';
        proxyRes.on('data', c => body += c);
        proxyRes.on('end', () => {
          console.error('External CV URL error:', proxyRes.statusCode, body.slice(0, 200));
          if (!res.headersSent)
            res.status(502).json({ message: 'Could not fetch CV. Please re-upload the file.' });
        });
        return;
      }
      res.setHeader('Content-Disposition', 'attachment; filename="Ankit_Das_CV_Resume.pdf"');
      res.setHeader('Content-Type', proxyRes.headers['content-type'] || 'application/pdf');
      if (proxyRes.headers['content-length'])
        res.setHeader('Content-Length', proxyRes.headers['content-length']);
      res.setHeader('Cache-Control', 'no-cache');
      proxyRes.pipe(res);
    });

    proxyReq.on('error', (err) => {
      console.error('CV proxy error:', err);
      if (!res.headersSent) res.status(500).json({ message: 'Error fetching CV.' });
    });
    proxyReq.setTimeout(25000, () => {
      proxyReq.destroy();
      if (!res.headersSent) res.status(504).json({ message: 'CV download timed out.' });
    });

  } catch (err) {
    console.error('CV download error:', err);
    if (!res.headersSent) res.status(500).json({ message: 'Server Error: ' + err.message });
  }
});

module.exports = router;
