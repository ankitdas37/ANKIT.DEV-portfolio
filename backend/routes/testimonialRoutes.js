const express = require('express');
const router = express.Router();
const db = require('../config/db');

// @route   GET /api/testimonials
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM testimonials ORDER BY created_at DESC');
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   POST /api/testimonials
router.post('/', async (req, res) => {
  try {
    const { quote, name, role, avatar, avatarColor, stars, platform, relation, date } = req.body;
    const [result] = await db.query(
      `INSERT INTO testimonials (quote, name, role, avatar, avatarColor, stars, platform, relation, date)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [quote, name, role, avatar, avatarColor, stars, platform, relation, date]
    );
    const [rows] = await db.query('SELECT * FROM testimonials WHERE id = ?', [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   PUT /api/testimonials/:id
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { quote, name, role, avatar, avatarColor, stars, platform, relation, date } = req.body;
    await db.query(
      `UPDATE testimonials SET quote=?, name=?, role=?, avatar=?, avatarColor=?, stars=?, platform=?, relation=?, date=? WHERE id=?`,
      [quote, name, role, avatar, avatarColor, stars, platform, relation, date, id]
    );
    const [rows] = await db.query('SELECT * FROM testimonials WHERE id = ?', [id]);
    res.json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   DELETE /api/testimonials/:id
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM testimonials WHERE id = ?', [id]);
    res.json({ message: 'Testimonial removed' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;
