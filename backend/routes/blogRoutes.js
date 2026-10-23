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
    if (!colNames.includes('author')) {
      await db.query("ALTER TABLE blog_posts ADD COLUMN author LONGTEXT");
    }
    if (!colNames.includes('links')) {
      await db.query("ALTER TABLE blog_posts ADD COLUMN links LONGTEXT");
    }
    if (!colNames.includes('markdown')) {
      await db.query("ALTER TABLE blog_posts ADD COLUMN markdown LONGTEXT");
    }
    if (!colNames.includes('styling')) {
      await db.query("ALTER TABLE blog_posts ADD COLUMN styling LONGTEXT");
    }
    if (!colNames.includes('tags')) {
      await db.query("ALTER TABLE blog_posts ADD COLUMN tags LONGTEXT");
    }
    if (!colNames.includes('authors')) {
      await db.query("ALTER TABLE blog_posts ADD COLUMN authors LONGTEXT");
    }
    if (!colNames.includes('recommendedPosts')) {
      await db.query("ALTER TABLE blog_posts ADD COLUMN recommendedPosts LONGTEXT");
    }
    if (!colNames.includes('demo')) {
      await db.query("ALTER TABLE blog_posts ADD COLUMN demo VARCHAR(500) DEFAULT ''");
    }
    if (!colNames.includes('github')) {
      await db.query("ALTER TABLE blog_posts ADD COLUMN github VARCHAR(500) DEFAULT ''");
    }
    if (!colNames.includes('docsUrl')) {
      await db.query("ALTER TABLE blog_posts ADD COLUMN docsUrl VARCHAR(500) DEFAULT ''");
    }
    if (!colNames.includes('youtubeUrl')) {
      await db.query("ALTER TABLE blog_posts ADD COLUMN youtubeUrl VARCHAR(500) DEFAULT ''");
    }
    try {
      await db.query("ALTER TABLE blog_posts MODIFY COLUMN tag VARCHAR(500)");
    } catch {
      // ignore if already modified
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

  let author = null;
  if (row.author) {
    if (typeof row.author === 'string') {
      try {
        author = JSON.parse(row.author);
      } catch {
        author = null;
      }
    } else {
      author = row.author;
    }
  }

  let authors = [];
  if (row.authors) {
    if (typeof row.authors === 'string') {
      try {
        const parsed = JSON.parse(row.authors);
        if (Array.isArray(parsed)) authors = parsed;
      } catch {
        authors = [];
      }
    } else if (Array.isArray(row.authors)) {
      authors = row.authors;
    }
  }
  if (authors.length === 0 && author) {
    authors = [author];
  }

  let links = [];
  if (row.links) {
    if (typeof row.links === 'string') {
      try {
        links = JSON.parse(row.links);
      } catch {
        links = [];
      }
    } else if (Array.isArray(row.links)) {
      links = row.links;
    }
  }

  let recommendedPosts = [];
  if (row.recommendedPosts) {
    if (typeof row.recommendedPosts === 'string') {
      try {
        const parsed = JSON.parse(row.recommendedPosts);
        if (Array.isArray(parsed)) recommendedPosts = parsed;
      } catch {
        recommendedPosts = [];
      }
    } else if (Array.isArray(row.recommendedPosts)) {
      recommendedPosts = row.recommendedPosts;
    }
  }

  let styling = null;
  if (row.styling) {
    if (typeof row.styling === 'string') {
      try {
        styling = JSON.parse(row.styling);
      } catch {
        styling = null;
      }
    } else {
      styling = row.styling;
    }
  }
  if (!styling) {
    styling = { fontSize: 'base', fontFamily: 'sans', layoutWidth: 'standard', accentColor: row.tagColor || '#06B6D4' };
  }

  let tags = [];
  if (row.tags) {
    if (typeof row.tags === 'string') {
      try {
        tags = JSON.parse(row.tags);
      } catch {
        tags = row.tags.split(',').map(t => t.trim()).filter(Boolean);
      }
    } else if (Array.isArray(row.tags)) {
      tags = row.tags;
    }
  } else if (row.tag) {
    tags = String(row.tag).split(',').map(t => t.trim()).filter(Boolean);
  }

  return {
    ...row,
    content,
    author: author || (authors.length > 0 ? authors[0] : null),
    authors,
    links,
    recommendedPosts,
    demo: row.demo || '',
    github: row.github || '',
    docsUrl: row.docsUrl || '',
    youtubeUrl: row.youtubeUrl || '',
    styling,
    tags: Array.isArray(tags) ? tags : [],
    tag: (Array.isArray(tags) && tags.length > 0) ? tags.join(', ') : (row.tag || 'General'),
    markdown: typeof row.markdown === 'string' ? row.markdown : '',
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
    const {
      title, excerpt, tag, tags, tagColor, readTime, date, emoji, slug,
      content, hidden, image, showOnHome, homeOrder, author, authors,
      links, markdown, styling, recommendedPosts, demo, github, docsUrl, youtubeUrl
    } = req.body;
    
    if (!title || !title.trim()) {
      return res.status(400).json({ message: 'Title is required' });
    }

    let resolvedTags = [];
    if (Array.isArray(tags)) {
      resolvedTags = tags.map(t => String(t).trim()).filter(Boolean);
    } else if (typeof tags === 'string' && tags.trim()) {
      try {
        const parsed = JSON.parse(tags);
        if (Array.isArray(parsed)) resolvedTags = parsed;
        else resolvedTags = tags.split(',').map(t => t.trim()).filter(Boolean);
      } catch {
        resolvedTags = tags.split(',').map(t => t.trim()).filter(Boolean);
      }
    } else if (typeof tag === 'string' && tag.trim()) {
      resolvedTags = tag.split(',').map(t => t.trim()).filter(Boolean);
    }
    if (resolvedTags.length === 0) resolvedTags = ['General'];
    const tagVal = resolvedTags.join(', ');
    const tagsJson = JSON.stringify(resolvedTags);

    const hiddenVal = hidden ? 1 : 0;
    const showOnHomeVal = showOnHome ? 1 : 0;
    const homeOrderVal = parseInt(homeOrder) || 0;
    const contentJson = typeof content === 'string' ? content : JSON.stringify(content || []);

    // Authors handling: prioritize authors array, fallback to author
    let authorsList = Array.isArray(authors) ? authors : [];
    if (authorsList.length === 0 && author) {
      authorsList = [author];
    }
    const authorsJson = JSON.stringify(authorsList);
    const primaryAuthor = authorsList[0] || author || null;
    const authorJson = primaryAuthor ? (typeof primaryAuthor === 'string' ? primaryAuthor : JSON.stringify(primaryAuthor)) : null;

    const linksJson = links ? (typeof links === 'string' ? links : JSON.stringify(links)) : JSON.stringify([]);
    const recommendedJson = recommendedPosts ? (typeof recommendedPosts === 'string' ? recommendedPosts : JSON.stringify(recommendedPosts)) : JSON.stringify([]);
    const stylingJson = styling ? (typeof styling === 'string' ? styling : JSON.stringify(styling)) : JSON.stringify({ fontSize: 'base', fontFamily: 'sans', layoutWidth: 'standard', accentColor: tagColor || '#06B6D4' });
    const markdownVal = typeof markdown === 'string' ? markdown : '';
    const postSlug = slug || title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

    const [result] = await db.query(
      `INSERT INTO blog_posts (title, excerpt, tag, tagColor, readTime, date, emoji, slug, image, showOnHome, homeOrder, content, hidden, author, authors, links, markdown, styling, tags, recommendedPosts, demo, github, docsUrl, youtubeUrl)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        title.trim(),
        excerpt || '',
        tagVal,
        tagColor || '#10B981',
        readTime || '5 min read',
        date || '',
        emoji || '📝',
        postSlug,
        image || '',
        showOnHomeVal,
        homeOrderVal,
        contentJson,
        hiddenVal,
        authorJson,
        authorsJson,
        linksJson,
        markdownVal,
        stylingJson,
        tagsJson,
        recommendedJson,
        demo || '',
        github || '',
        docsUrl || '',
        youtubeUrl || ''
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

    let resolvedTags = undefined;
    if (req.body.tags !== undefined) {
      if (Array.isArray(req.body.tags)) {
        resolvedTags = req.body.tags.map(t => String(t).trim()).filter(Boolean);
      } else if (typeof req.body.tags === 'string' && req.body.tags.trim()) {
        try {
          const parsed = JSON.parse(req.body.tags);
          if (Array.isArray(parsed)) resolvedTags = parsed;
          else resolvedTags = req.body.tags.split(',').map(t => t.trim()).filter(Boolean);
        } catch {
          resolvedTags = req.body.tags.split(',').map(t => t.trim()).filter(Boolean);
        }
      }
    } else if (req.body.tag !== undefined) {
      resolvedTags = String(req.body.tag).split(',').map(t => t.trim()).filter(Boolean);
    }

    const tag = resolvedTags !== undefined ? resolvedTags.join(', ') : current.tag;
    const tagsJson = resolvedTags !== undefined ? JSON.stringify(resolvedTags) : (current.tags || JSON.stringify(current.tag ? String(current.tag).split(',').map(t=>t.trim()).filter(Boolean) : []));

    const title = req.body.title !== undefined ? req.body.title : current.title;
    const excerpt = req.body.excerpt !== undefined ? req.body.excerpt : current.excerpt;
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

    let authorsJson = current.authors;
    let authorJson = current.author;
    if (req.body.authors !== undefined) {
      const arr = Array.isArray(req.body.authors) ? req.body.authors : [];
      authorsJson = JSON.stringify(arr);
      if (arr.length > 0) {
        authorJson = JSON.stringify(arr[0]);
      }
    }
    if (req.body.author !== undefined && req.body.authors === undefined) {
      authorJson = req.body.author ? (typeof req.body.author === 'string' ? req.body.author : JSON.stringify(req.body.author)) : null;
      if (authorJson) {
        try {
          authorsJson = JSON.stringify([JSON.parse(authorJson)]);
        } catch {
          authorsJson = JSON.stringify([]);
        }
      }
    }

    let linksJson = current.links;
    if (req.body.links !== undefined) {
      linksJson = req.body.links ? (typeof req.body.links === 'string' ? req.body.links : JSON.stringify(req.body.links)) : JSON.stringify([]);
    }

    let recommendedJson = current.recommendedPosts;
    if (req.body.recommendedPosts !== undefined) {
      recommendedJson = req.body.recommendedPosts ? (typeof req.body.recommendedPosts === 'string' ? req.body.recommendedPosts : JSON.stringify(req.body.recommendedPosts)) : JSON.stringify([]);
    }

    const demo = req.body.demo !== undefined ? req.body.demo : (current.demo || '');
    const github = req.body.github !== undefined ? req.body.github : (current.github || '');
    const docsUrl = req.body.docsUrl !== undefined ? req.body.docsUrl : (current.docsUrl || '');
    const youtubeUrl = req.body.youtubeUrl !== undefined ? req.body.youtubeUrl : (current.youtubeUrl || '');

    let stylingJson = current.styling;
    if (req.body.styling !== undefined) {
      stylingJson = req.body.styling ? (typeof req.body.styling === 'string' ? req.body.styling : JSON.stringify(req.body.styling)) : null;
    }

    const markdownVal = req.body.markdown !== undefined ? (typeof req.body.markdown === 'string' ? req.body.markdown : '') : (current.markdown || '');

    await db.query(
      `UPDATE blog_posts SET title=?, excerpt=?, tag=?, tagColor=?, readTime=?, date=?, emoji=?, slug=?, image=?, showOnHome=?, homeOrder=?, content=?, hidden=?, author=?, authors=?, links=?, markdown=?, styling=?, tags=?, recommendedPosts=?, demo=?, github=?, docsUrl=?, youtubeUrl=? WHERE id=?`,
      [title, excerpt, tag, tagColor, readTime, date, emoji, slug, image, showOnHome, homeOrder, contentJson, hidden, authorJson, authorsJson, linksJson, markdownVal, stylingJson, tagsJson, recommendedJson, demo, github, docsUrl, youtubeUrl, id]
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
