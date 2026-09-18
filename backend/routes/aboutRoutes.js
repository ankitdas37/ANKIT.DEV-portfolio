const express = require('express');
const router = express.Router();
const db = require('../config/db');

// @route   GET /api/about
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM about_me WHERE id = 1');
    if (rows.length === 0) {
      return res.status(404).json({ message: 'About me data not found' });
    }
    
    // Parse JSON fields
    const data = rows[0];
    res.json({
      ...data,
      terminal_data: typeof data.terminal_data === 'string' ? JSON.parse(data.terminal_data) : data.terminal_data,
      stats_data: typeof data.stats_data === 'string' ? JSON.parse(data.stats_data) : data.stats_data,
      learning_data: typeof data.learning_data === 'string' ? JSON.parse(data.learning_data) : data.learning_data,
      what_i_do: typeof data.what_i_do === 'string' ? JSON.parse(data.what_i_do) : data.what_i_do,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   PUT /api/about
router.put('/', async (req, res) => {
  try {
    const {
      terminal_data,
      stats_data,
      learning_data,
      what_i_do,
      journey_text,
      journey_title,
      lightbulb_title,
      lightbulb_subtitle,
      portrait_image,
      what_i_do_title,
      cv_url
    } = req.body;

    await db.query(
      `UPDATE about_me SET 
        terminal_data = ?, 
        stats_data = ?, 
        learning_data = ?, 
        what_i_do = ?, 
        journey_text = ?, 
        journey_title = COALESCE(?, journey_title),
        lightbulb_title = ?, 
        lightbulb_subtitle = ?, 
        portrait_image = ?,
        what_i_do_title = COALESCE(?, what_i_do_title),
        cv_url = COALESCE(?, cv_url)
       WHERE id = 1`,
      [
        JSON.stringify(terminal_data),
        JSON.stringify(stats_data),
        JSON.stringify(learning_data),
        JSON.stringify(what_i_do),
        journey_text,
        journey_title,
        lightbulb_title,
        lightbulb_subtitle,
        portrait_image,
        what_i_do_title,
        cv_url
      ]
    );

    const [rows] = await db.query('SELECT * FROM about_me WHERE id = 1');
    const data = rows[0];
    res.json({
      ...data,
      terminal_data: typeof data.terminal_data === 'string' ? JSON.parse(data.terminal_data) : data.terminal_data,
      stats_data: typeof data.stats_data === 'string' ? JSON.parse(data.stats_data) : data.stats_data,
      learning_data: typeof data.learning_data === 'string' ? JSON.parse(data.learning_data) : data.learning_data,
      what_i_do: typeof data.what_i_do === 'string' ? JSON.parse(data.what_i_do) : data.what_i_do,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;
