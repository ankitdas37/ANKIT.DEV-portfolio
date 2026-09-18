const express = require('express');
const router = express.Router();
const db = require('../config/db');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const nodemailer = require('nodemailer');

// Ensure upload directory exists
const uploadDir = path.join(__dirname, '../uploads/proposals');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Setup multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

const { google } = require('googleapis');
const MailComposer = require('nodemailer/lib/mail-composer');

// Configure OAuth2 Client for Gmail API
const oAuth2Client = new google.auth.OAuth2(
  process.env.GMAIL_CLIENT_ID,
  process.env.GMAIL_CLIENT_SECRET,
  "https://developers.google.com/oauthplayground"
);

if (process.env.GMAIL_REFRESH_TOKEN) {
  oAuth2Client.setCredentials({ refresh_token: process.env.GMAIL_REFRESH_TOKEN });
}
const gmail = google.gmail({ version: 'v1', auth: oAuth2Client });

// GET all proposals for Admin panel
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM proposals ORDER BY created_at DESC');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching proposals:', error);
    res.status(500).json({ error: 'Failed to fetch proposals' });
  }
});

// POST new proposal from frontend
router.post('/', upload.array('files', 10), async (req, res) => {
  try {
    const { name, email, phone, address, projectTitle, projectDetails } = req.body;
    let filePath = null;

    if (req.files && req.files.length > 0) {
      const paths = req.files.map(f => '/uploads/proposals/' + f.filename);
      filePath = JSON.stringify(paths);
    }

    // Insert into Database
    const [result] = await db.query(
      `INSERT INTO proposals (name, email, phone, address, project_title, project_details, file_path) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [name, email, phone, address, projectTitle, projectDetails, filePath]
    );

    // Prepare Email Content
    const mailOptions = {
      from: process.env.GMAIL_USER || 'no-reply@example.com',
      to: process.env.GMAIL_USER, // Send to the admin's email
      subject: `New Project Proposal: ${projectTitle}`,
      html: `
        <h2>New Project Proposal Received</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone}</p>
        <p><strong>Address:</strong> ${address}</p>
        <p><strong>Project Title:</strong> ${projectTitle}</p>
        <h3>Project Details:</h3>
        <p>${projectDetails.replace(/\n/g, '<br>')}</p>
        ${filePath ? `<p><strong>Attachment:</strong> A file was uploaded. Check the admin panel.</p>` : ''}
      `
    };

    // Attach file to email if present
    if (req.files && req.files.length > 0) {
      mailOptions.attachments = req.files.map(f => ({
        filename: f.originalname,
        path: f.path
      }));
    }

    // Send email asynchronously via Gmail API
    if (process.env.GMAIL_REFRESH_TOKEN && process.env.GMAIL_CLIENT_ID) {
      try {
        const mail = new MailComposer(mailOptions);
        const message = await mail.compile().build();
        const encodedMessage = Buffer.from(message)
          .toString('base64')
          .replace(/\+/g, '-')
          .replace(/\//g, '_')
          .replace(/=+$/, '');
          
        gmail.users.messages.send({
          userId: 'me',
          requestBody: {
            raw: encodedMessage
          }
        }).then(response => {
          console.log('Gmail API email sent:', response.data);
        }).catch(err => {
          console.error('Error sending email via Gmail API:', err);
        });
      } catch (err) {
        console.error('Error compiling email for Gmail API:', err);
      }
    } else {
      console.log('Email not sent: Gmail OAuth2 variables not fully configured in .env');
      console.log('Email Content:', mailOptions.subject);
    }

    res.status(201).json({ message: 'Proposal submitted successfully', id: result.insertId });
  } catch (error) {
    console.error('Error submitting proposal:', error);
    res.status(500).json({ error: 'Failed to submit proposal' });
  }
});

// DELETE a proposal
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get file path before deleting
    const [rows] = await db.query('SELECT file_path FROM proposals WHERE id = ?', [id]);
    
    if (rows.length > 0 && rows[0].file_path) {
      try {
        const paths = JSON.parse(rows[0].file_path);
        paths.forEach(p => {
          const fullPath = path.join(__dirname, '..', p);
          if (fs.existsSync(fullPath)) {
            fs.unlinkSync(fullPath);
          }
        });
      } catch (e) {
        // Fallback for old single string paths
        const fullPath = path.join(__dirname, '..', rows[0].file_path);
        if (fs.existsSync(fullPath)) {
          fs.unlinkSync(fullPath);
        }
      }
    }

    await db.query('DELETE FROM proposals WHERE id = ?', [id]);
    res.json({ message: 'Proposal deleted successfully' });
  } catch (error) {
    console.error('Error deleting proposal:', error);
    res.status(500).json({ error: 'Failed to delete proposal' });
  }
});

module.exports = router;
