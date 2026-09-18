const express = require('express');
const router = express.Router();
const db = require('../config/db');

// @route   GET /api/info
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM info_items ORDER BY id ASC');
    res.json(rows.map(row => ({ ...row, hidden: row.hidden === 1 })));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   POST /api/info
router.post('/', async (req, res) => {
  try {
    const { icon, title, value, sub, hidden } = req.body;
    const hiddenVal = hidden ? 1 : 0;
    const [result] = await db.query(
      'INSERT INTO info_items (icon, title, value, sub, hidden) VALUES (?, ?, ?, ?, ?)',
      [icon, title, value, sub, hiddenVal]
    );
    const [rows] = await db.query('SELECT * FROM info_items WHERE id = ?', [result.insertId]);
    res.status(201).json({ ...rows[0], hidden: rows[0].hidden === 1 });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   PUT /api/info/:id
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { icon, title, value, sub, hidden } = req.body;
    const hiddenVal = hidden ? 1 : 0;
    await db.query(
      'UPDATE info_items SET icon=?, title=?, value=?, sub=?, hidden=? WHERE id=?',
      [icon, title, value, sub, hiddenVal, id]
    );
    const [rows] = await db.query('SELECT * FROM info_items WHERE id = ?', [id]);
    res.json({ ...rows[0], hidden: rows[0].hidden === 1 });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   DELETE /api/info/:id
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM info_items WHERE id = ?', [id]);
    res.json({ message: 'Info item removed' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;
