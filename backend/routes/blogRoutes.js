const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Self-healing: ensure blog_posts table and all columns exist
async function ensureBlogTable() {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS blog_posts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        excerpt TEXT,
        tag VARCHAR(100),
        tagColor VARCHAR(50),
        readTime VARCHAR(50),
        date VARCHAR(100),
        emoji VARCHAR(50),
        slug VARCHAR(255),
        image VARCHAR(500) DEFAULT '',
        showOnHome TINYINT(1) DEFAULT 0,
        homeOrder INT DEFAULT 0,
        content LONGTEXT,
        hidden TINYINT(1) DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    const [cols] = await db.query("SHOW COLUMNS FROM blog_posts");
    const colNames = cols.map(c => c.Field);
    if (!colNames.includes('image')) {
      await db.query("ALTER TABLE blog_posts ADD COLUMN image VARCHAR(500) DEFAULT ''");
    }
    if (!colNames.includes('showOnHome')) {
      await db.query("ALTER TABLE blog_posts ADD COLUMN showOnHome TINYINT(1) DEFAULT 0");
    }
    if (!colNames.includes('homeOrder')) {
      await db.query("ALTER TABLE blog_posts ADD COLUMN homeOrder INT DEFAULT 0");
    }
    if (!colNames.includes('hidden')) {
      await db.query("ALTER TABLE blog_posts ADD COLUMN hidden TINYINT(1) DEFAULT 0");
    }
    if (!colNames.includes('content')) {
      await db.query("ALTER TABLE blog_posts ADD COLUMN content LONGTEXT");
    }
  } catch (err) {
    console.error("ensureBlogTable warning:", err.message);
  }
}

function parseRow(row) {
  if (!row) return null;
  let content = [];
  if (typeof row.content === 'string') {
    try {
      content = JSON.parse(row.content);
    } catch {
      content = [];
    }
  } else if (Array.isArray(row.content)) {
    content = row.content;
  }
  return {
    ...row,
    content,
    hidden: row.hidden === 1 || row.hidden === true,
    showOnHome: row.showOnHome === 1 || row.showOnHome === true,
    homeOrder: parseInt(row.homeOrder) || 0,
    image: row.image || '',
  };
}

// @route   GET /api/blog
router.get('/', async (req, res) => {
  try {
    await ensureBlogTable();
    const [rows] = await db.query('SELECT * FROM blog_posts ORDER BY created_at DESC');
    res.json(rows.map(parseRow));
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    res.status(500).json({ message: error.message || 'Server Error' });
  }
});

// @route   POST /api/blog
router.post('/', async (req, res) => {
  try {
    await ensureBlogTable();
    const { title, excerpt, tag, tagColor, readTime, date, emoji, slug, content, hidden, image, showOnHome, homeOrder } = req.body;
    
    if (!title || !title.trim()) {
      return res.status(400).json({ message: 'Title is required' });
    }

    const hiddenVal = hidden ? 1 : 0;
    const showOnHomeVal = showOnHome ? 1 : 0;
    const homeOrderVal = parseInt(homeOrder) || 0;
    const contentJson = typeof content === 'string' ? content : JSON.stringify(content || []);
    const postSlug = slug || title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

    const [result] = await db.query(
      `INSERT INTO blog_posts (title, excerpt, tag, tagColor, readTime, date, emoji, slug, image, showOnHome, homeOrder, content, hidden)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        title.trim(),
        excerpt || '',
        tag || 'General',
        tagColor || '#10B981',
        readTime || '5 min read',
        date || '',
        emoji || '📝',
        postSlug,
        image || '',
        showOnHomeVal,
        homeOrderVal,
        contentJson,
        hiddenVal
      ]
    );
    const [rows] = await db.query('SELECT * FROM blog_posts WHERE id = ?', [result.insertId]);
    res.status(201).json(parseRow(rows[0]));
  } catch (error) {
    console.error('Error creating blog post:', error);
    res.status(500).json({ message: error.message || 'Server Error' });
  }
});

// @route   PUT /api/blog/:id
router.put('/:id', async (req, res) => {
  try {
    await ensureBlogTable();
    const { id } = req.params;
    const [existing] = await db.query('SELECT * FROM blog_posts WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ message: 'Blog post not found' });
    }
    const current = existing[0];

    const title = req.body.title !== undefined ? req.body.title : current.title;
    const excerpt = req.body.excerpt !== undefined ? req.body.excerpt : current.excerpt;
    const tag = req.body.tag !== undefined ? req.body.tag : current.tag;
    const tagColor = req.body.tagColor !== undefined ? req.body.tagColor : current.tagColor;
    const readTime = req.body.readTime !== undefined ? req.body.readTime : current.readTime;
    const date = req.body.date !== undefined ? req.body.date : current.date;
    const emoji = req.body.emoji !== undefined ? req.body.emoji : current.emoji;
    const slug = req.body.slug !== undefined ? req.body.slug : current.slug;
    const image = req.body.image !== undefined ? req.body.image : (current.image || '');
    const showOnHome = req.body.showOnHome !== undefined ? (req.body.showOnHome ? 1 : 0) : (current.showOnHome || 0);
    const homeOrder = req.body.homeOrder !== undefined ? (parseInt(req.body.homeOrder) || 0) : (current.homeOrder || 0);
    const hidden = req.body.hidden !== undefined ? (req.body.hidden ? 1 : 0) : (current.hidden || 0);
    
    let contentJson = current.content;
    if (req.body.content !== undefined) {
      contentJson = typeof req.body.content === 'string' ? req.body.content : JSON.stringify(req.body.content || []);
    }

    await db.query(
      `UPDATE blog_posts SET title=?, excerpt=?, tag=?, tagColor=?, readTime=?, date=?, emoji=?, slug=?, image=?, showOnHome=?, homeOrder=?, content=?, hidden=? WHERE id=?`,
      [title, excerpt, tag, tagColor, readTime, date, emoji, slug, image, showOnHome, homeOrder, contentJson, hidden, id]
    );
    const [rows] = await db.query('SELECT * FROM blog_posts WHERE id = ?', [id]);
    res.json(parseRow(rows[0]));
  } catch (error) {
    console.error('Error updating blog post:', error);
    res.status(500).json({ message: error.message || 'Server Error' });
  }
});

// @route   DELETE /api/blog/:id
router.delete('/:id', async (req, res) => {
  try {
    await ensureBlogTable();
    const { id } = req.params;
    await db.query('DELETE FROM blog_posts WHERE id = ?', [id]);
    res.json({ message: 'Blog post removed' });
  } catch (error) {
    console.error('Error deleting blog post:', error);
    res.status(500).json({ message: error.message || 'Server Error' });
  }
});

module.exports = router;
