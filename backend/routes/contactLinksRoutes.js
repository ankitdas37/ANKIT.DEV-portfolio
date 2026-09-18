const express = require('express');
const router = express.Router();
const db = require('../config/db');

// GET all contact links
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM contact_links ORDER BY sort_order ASC, id ASC');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching contact links:', error);
    res.status(500).json({ error: 'Failed to fetch contact links' });
  }
});

// POST a new contact link
router.post('/', async (req, res) => {
  try {
    const { type, label, value, action, link, color, glow, hidden, sort_order } = req.body;
    const [result] = await db.query(
      `INSERT INTO contact_links (type, label, value, action, link, color, glow, hidden, sort_order) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [type, label, value, action, link, color, glow, hidden || 0, sort_order || 0]
    );
    res.status(201).json({ message: 'Contact link created successfully', id: result.insertId });
  } catch (error) {
    console.error('Error creating contact link:', error);
    res.status(500).json({ error: 'Failed to create contact link' });
  }
});

// PUT (update) an existing contact link
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { type, label, value, action, link, color, glow, hidden, sort_order } = req.body;
    
    await db.query(
      `UPDATE contact_links 
       SET type = ?, label = ?, value = ?, action = ?, link = ?, color = ?, glow = ?, hidden = ?, sort_order = ?
       WHERE id = ?`,
      [type, label, value, action, link, color, glow, hidden, sort_order, id]
    );
    res.json({ message: 'Contact link updated successfully' });
  } catch (error) {
    console.error('Error updating contact link:', error);
    res.status(500).json({ error: 'Failed to update contact link' });
  }
});

// DELETE a contact link
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM contact_links WHERE id = ?', [id]);
    res.json({ message: 'Contact link deleted successfully' });
  } catch (error) {
    console.error('Error deleting contact link:', error);
    res.status(500).json({ error: 'Failed to delete contact link' });
  }
});

module.exports = router;
