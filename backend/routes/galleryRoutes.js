const express = require('express');
const router = express.Router();
const db = require('../config/db');

function parseRow(row) {
  return {
    ...row,
    images: typeof row.images === 'string' ? JSON.parse(row.images) : (row.images || []),
    hidden: row.hidden === 1 || row.hidden === true
  };
}

// @route   GET /api/gallery
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM gallery_folders ORDER BY created_at DESC');
    res.json(rows.map(parseRow));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   POST /api/gallery
router.post('/', async (req, res) => {
  try {
    const { title, color, hidden, images, coverImage } = req.body;
    const hiddenVal = hidden ? 1 : 0;
    const imagesJson = JSON.stringify(images || []);
    
    const [result] = await db.query(
      `INSERT INTO gallery_folders (title, color, hidden, images, coverImage)
       VALUES (?, ?, ?, ?, ?)`,
      [title, color, hiddenVal, imagesJson, coverImage || '']
    );
    const [rows] = await db.query('SELECT * FROM gallery_folders WHERE id = ?', [result.insertId]);
    res.status(201).json(parseRow(rows[0]));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   PUT /api/gallery/:id
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, color, hidden, images, coverImage } = req.body;
    const hiddenVal = hidden ? 1 : 0;
    const imagesJson = JSON.stringify(images || []);

    await db.query(
      `UPDATE gallery_folders SET title=?, color=?, hidden=?, images=?, coverImage=? WHERE id=?`,
      [title, color, hiddenVal, imagesJson, coverImage || '', id]
    );
    const [rows] = await db.query('SELECT * FROM gallery_folders WHERE id = ?', [id]);
    res.json(parseRow(rows[0]));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   DELETE /api/gallery/:id
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM gallery_folders WHERE id = ?', [id]);
    res.json({ message: 'Folder removed' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;
