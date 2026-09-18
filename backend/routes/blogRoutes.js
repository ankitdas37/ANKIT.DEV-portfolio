const express = require('express');
const router = express.Router();
const db = require('../config/db');

function parseRow(row) {
  return {
    ...row,
    content: typeof row.content === 'string' ? JSON.parse(row.content) : (row.content || []),
    hidden: row.hidden === 1 || row.hidden === true
  };
}

// @route   GET /api/blog
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM blog_posts ORDER BY created_at DESC');
    res.json(rows.map(parseRow));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   POST /api/blog
router.post('/', async (req, res) => {
  try {
    const { title, excerpt, tag, tagColor, readTime, date, emoji, slug, content, hidden } = req.body;
    const hiddenVal = hidden ? 1 : 0;
    const contentJson = JSON.stringify(content || []);
    
    const [result] = await db.query(
      `INSERT INTO blog_posts (title, excerpt, tag, tagColor, readTime, date, emoji, slug, content, hidden)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [title, excerpt, tag, tagColor, readTime, date, emoji, slug, contentJson, hiddenVal]
    );
    const [rows] = await db.query('SELECT * FROM blog_posts WHERE id = ?', [result.insertId]);
    res.status(201).json(parseRow(rows[0]));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   PUT /api/blog/:id
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, excerpt, tag, tagColor, readTime, date, emoji, slug, content, hidden } = req.body;
    const hiddenVal = hidden ? 1 : 0;
    const contentJson = JSON.stringify(content || []);

    await db.query(
      `UPDATE blog_posts SET title=?, excerpt=?, tag=?, tagColor=?, readTime=?, date=?, emoji=?, slug=?, content=?, hidden=? WHERE id=?`,
      [title, excerpt, tag, tagColor, readTime, date, emoji, slug, contentJson, hiddenVal, id]
    );
    const [rows] = await db.query('SELECT * FROM blog_posts WHERE id = ?', [id]);
    res.json(parseRow(rows[0]));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   DELETE /api/blog/:id
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM blog_posts WHERE id = ?', [id]);
    res.json({ message: 'Blog post removed' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;
