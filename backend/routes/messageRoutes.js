const express = require('express');
const router = express.Router();
const db = require('../config/db');
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

// GET all messages for Admin panel
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM messages ORDER BY created_at DESC');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// POST new message from Contact page
router.post('/', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    // Insert into Database
    const [result] = await db.query(
      `INSERT INTO messages (name, email, subject, message) VALUES (?, ?, ?, ?)`,
      [name, email, subject, message]
    );

    // Prepare Email Content
    const mailOptions = {
      from: process.env.GMAIL_USER || 'no-reply@example.com',
      to: process.env.GMAIL_USER, // Send to the admin's email
      subject: `New Contact Form Message: ${subject}`,
      html: `
        <h2>New Message Received</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <h3>Message:</h3>
        <p>${message.replace(/\n/g, '<br>')}</p>
      `
    };

    // Send email asynchronously via Gmail API
    if (process.env.GMAIL_REFRESH_TOKEN && process.env.GMAIL_CLIENT_ID) {
      try {
        const mail = new MailComposer(mailOptions);
        const compiledMessage = await mail.compile().build();
        const encodedMessage = Buffer.from(compiledMessage)
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
          console.log('Gmail API email sent for contact form:', response.data);
        }).catch(err => {
          console.error('Error sending contact form email via Gmail API:', err);
        });
      } catch (err) {
        console.error('Error compiling contact form email for Gmail API:', err);
      }
    } else {
      console.log('Email not sent: Gmail OAuth2 variables not fully configured in .env');
    }

    res.status(201).json({ message: 'Message submitted successfully', id: result.insertId });
  } catch (error) {
    console.error('Error submitting message:', error);
    res.status(500).json({ error: 'Failed to submit message' });
  }
});

// DELETE a message
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM messages WHERE id = ?', [id]);
    res.json({ message: 'Message deleted successfully' });
  } catch (error) {
    console.error('Error deleting message:', error);
    res.status(500).json({ error: 'Failed to delete message' });
  }
});

module.exports = router;
