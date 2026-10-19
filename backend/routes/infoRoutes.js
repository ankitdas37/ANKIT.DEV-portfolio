const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Self-healing: ensure info_items table and 'hidden' column exist
async function ensureInfoTable() {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS info_items (
        id INT AUTO_INCREMENT PRIMARY KEY,
        icon VARCHAR(50) DEFAULT '',
        title VARCHAR(255) NOT NULL,
        value VARCHAR(255) NOT NULL,
        sub VARCHAR(255) DEFAULT '',
        hidden TINYINT(1) DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    const [cols] = await db.query("SHOW COLUMNS FROM info_items LIKE 'hidden'");
    if (cols.length === 0) {
      await db.query("ALTER TABLE info_items ADD COLUMN hidden TINYINT(1) DEFAULT 0");
    }
  } catch (err) {
    console.error("ensureInfoTable warning:", err.message);
  }
}

// @route   GET /api/info
router.get('/', async (req, res) => {
  try {
    await ensureInfoTable();
    const [rows] = await db.query('SELECT * FROM info_items ORDER BY id ASC');
    res.json(rows.map(row => ({ ...row, hidden: row.hidden === 1 })));
  } catch (error) {
    console.error('Error fetching info items:', error);
    res.status(500).json({ message: error.message || 'Server Error' });
  }
});

// @route   POST /api/info
router.post('/', async (req, res) => {
  try {
    await ensureInfoTable();
    const icon = req.body.icon !== undefined ? String(req.body.icon) : '';
    const title = req.body.title !== undefined ? String(req.body.title).trim() : '';
    const value = req.body.value !== undefined ? String(req.body.value).trim() : '';
    const sub = req.body.sub !== undefined ? String(req.body.sub) : '';
    const hiddenVal = req.body.hidden ? 1 : 0;

    if (!title || !value) {
      return res.status(400).json({ message: 'Title and Value are required' });
    }

    const [result] = await db.query(
      'INSERT INTO info_items (icon, title, value, sub, hidden) VALUES (?, ?, ?, ?, ?)',
      [icon, title, value, sub, hiddenVal]
    );
    const [rows] = await db.query('SELECT * FROM info_items WHERE id = ?', [result.insertId]);
    res.status(201).json({ ...rows[0], hidden: rows[0].hidden === 1 });
  } catch (error) {
    console.error('Error creating info item:', error);
    res.status(500).json({ message: error.message || 'Server Error' });
  }
});

// @route   PUT /api/info/:id
router.put('/:id', async (req, res) => {
  try {
    await ensureInfoTable();
    const { id } = req.params;
    const icon = req.body.icon !== undefined ? String(req.body.icon) : '';
    const title = req.body.title !== undefined ? String(req.body.title).trim() : '';
    const value = req.body.value !== undefined ? String(req.body.value).trim() : '';
    const sub = req.body.sub !== undefined ? String(req.body.sub) : '';
    const hiddenVal = req.body.hidden ? 1 : 0;

    await db.query(
      'UPDATE info_items SET icon=?, title=?, value=?, sub=?, hidden=? WHERE id=?',
      [icon, title, value, sub, hiddenVal, id]
    );
    const [rows] = await db.query('SELECT * FROM info_items WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Info item not found' });
    }
    res.json({ ...rows[0], hidden: rows[0].hidden === 1 });
  } catch (error) {
    console.error('Error updating info item:', error);
    res.status(500).json({ message: error.message || 'Server Error' });
  }
});

// @route   DELETE /api/info/:id
router.delete('/:id', async (req, res) => {
  try {
    await ensureInfoTable();
    const { id } = req.params;
    await db.query('DELETE FROM info_items WHERE id = ?', [id]);
    res.json({ message: 'Info item removed' });
  } catch (error) {
    console.error('Error deleting info item:', error);
    res.status(500).json({ message: error.message || 'Server Error' });
  }
});

module.exports = router;
