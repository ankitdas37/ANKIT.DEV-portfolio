const express = require('express');
const router = express.Router();
const db = require('../config/db');

// @route   GET /api/certificates
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM certificates ORDER BY created_at DESC');
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   POST /api/certificates
router.post('/', async (req, res) => {
  try {
    const { title, organization, date, color, category, link } = req.body;
    const [result] = await db.query(
      `INSERT INTO certificates (title, organization, date, color, category, link)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [title, organization, date, color, category, link]
    );
    const [rows] = await db.query('SELECT * FROM certificates WHERE id = ?', [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   PUT /api/certificates/:id
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, organization, date, color, category, link } = req.body;
    await db.query(
      `UPDATE certificates SET title=?, organization=?, date=?, color=?, category=?, link=? WHERE id=?`,
      [title, organization, date, color, category, link, id]
    );
    const [rows] = await db.query('SELECT * FROM certificates WHERE id = ?', [id]);
    res.json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   DELETE /api/certificates/:id
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM certificates WHERE id = ?', [id]);
    res.json({ message: 'Certificate removed' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;
