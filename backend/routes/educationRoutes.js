const express = require('express');
const router = express.Router();
const db = require('../config/db');

// @route   GET /api/education
router.get('/', async (req, res) => {
  try {
    // Check if table exists and row exists, wrap in try/catch in case table is missing
    let rows = [];
    try {
      [rows] = await db.query('SELECT * FROM education WHERE id = 1');
    } catch(err) {
      // If table doesn't exist, we will create it on the fly or just return defaults
      if (err.code === 'ER_NO_SUCH_TABLE') {
        await db.query(`
          CREATE TABLE IF NOT EXISTS education (
              id INT PRIMARY KEY DEFAULT 1,
              timeline JSON,
              highlights JSON,
              subjects JSON,
              stats JSON,
              quote_text TEXT,
              quote_author VARCHAR(255)
          )
        `);
      }
    }

    if (rows.length === 0) {
      return res.json({
        id: 1,
        timeline: [],
        highlights: [],
        subjects: [],
        stats: [],
        quote_text: "",
        quote_author: ""
      });
    }
    
    const data = rows[0];
    res.json({
      ...data,
      timeline: data.timeline ? (typeof data.timeline === 'string' ? JSON.parse(data.timeline) : data.timeline) : [],
      highlights: data.highlights ? (typeof data.highlights === 'string' ? JSON.parse(data.highlights) : data.highlights) : [],
      subjects: data.subjects ? (typeof data.subjects === 'string' ? JSON.parse(data.subjects) : data.subjects) : [],
      stats: data.stats ? (typeof data.stats === 'string' ? JSON.parse(data.stats) : data.stats) : [],
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   PUT /api/education
router.put('/', async (req, res) => {
  try {
    const {
      timeline = [],
      highlights = [],
      subjects = [],
      stats = [],
      quote_text = "",
      quote_author = ""
    } = req.body;

    const timeJson = JSON.stringify(timeline);
    const highJson = JSON.stringify(highlights);
    const subJson = JSON.stringify(subjects);
    const statsJson = JSON.stringify(stats);

    await db.query(
      `INSERT INTO education (
        id, timeline, highlights, subjects, stats, quote_text, quote_author
       ) VALUES (
        1, ?, ?, ?, ?, ?, ?
       ) ON DUPLICATE KEY UPDATE
        timeline = VALUES(timeline),
        highlights = VALUES(highlights),
        subjects = VALUES(subjects),
        stats = VALUES(stats),
        quote_text = VALUES(quote_text),
        quote_author = VALUES(quote_author)`,
      [
        timeJson, highJson, subJson, statsJson, quote_text, quote_author
      ]
    );

    const [rows] = await db.query('SELECT * FROM education WHERE id = 1');
    const data = rows[0];
    res.json({
      ...data,
      timeline: typeof data.timeline === 'string' ? JSON.parse(data.timeline) : data.timeline,
      highlights: typeof data.highlights === 'string' ? JSON.parse(data.highlights) : data.highlights,
      subjects: typeof data.subjects === 'string' ? JSON.parse(data.subjects) : data.subjects,
      stats: typeof data.stats === 'string' ? JSON.parse(data.stats) : data.stats,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;
