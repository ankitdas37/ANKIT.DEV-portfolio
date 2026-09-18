const express = require('express');
const router = express.Router();
const db = require('../config/db');

// @route   GET /api/education
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM education WHERE id = 1');
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Education data not found' });
    }
    
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

// @route   PUT /api/education
router.put('/', async (req, res) => {
  try {
    const {
      timeline,
      highlights,
      subjects,
      stats,
      quote_text,
      quote_author
    } = req.body;

    await db.query(
      `UPDATE education SET 
        timeline = ?, 
        highlights = ?, 
        subjects = ?, 
        stats = ?, 
        quote_text = ?, 
        quote_author = ?
       WHERE id = 1`,
      [
        JSON.stringify(timeline),
        JSON.stringify(highlights),
        JSON.stringify(subjects),
        JSON.stringify(stats),
        quote_text,
        quote_author
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
