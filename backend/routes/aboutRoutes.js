const express = require('express');
const router = express.Router();
const db = require('../config/db');

// @route   GET /api/about
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM about_me WHERE id = 1');
    if (rows.length === 0) {
      // Return default empty structure if nothing exists
      return res.json({
        id: 1,
        terminal_data: [],
        stats_data: [],
        learning_data: [],
        what_i_do: [],
        journey_text: "",
        lightbulb_title: "",
        lightbulb_subtitle: "",
        portrait_image: "",
        journey_title: "My Journey",
        what_i_do_title: "What I Do",
        cv_url: ""
      });
    }
    
    // Parse JSON fields
    const data = rows[0];
    res.json({
      ...data,
      terminal_data: data.terminal_data ? (typeof data.terminal_data === 'string' ? JSON.parse(data.terminal_data) : data.terminal_data) : [],
      stats_data: data.stats_data ? (typeof data.stats_data === 'string' ? JSON.parse(data.stats_data) : data.stats_data) : [],
      learning_data: data.learning_data ? (typeof data.learning_data === 'string' ? JSON.parse(data.learning_data) : data.learning_data) : [],
      what_i_do: data.what_i_do ? (typeof data.what_i_do === 'string' ? JSON.parse(data.what_i_do) : data.what_i_do) : [],
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
      terminal_data = [],
      stats_data = [],
      learning_data = [],
      what_i_do = [],
      journey_text = "",
      journey_title = "My Journey",
      lightbulb_title = "",
      lightbulb_subtitle = "",
      portrait_image = "",
      what_i_do_title = "What I Do",
      cv_url = ""
    } = req.body;

    const termJson = JSON.stringify(terminal_data);
    const statsJson = JSON.stringify(stats_data);
    const learnJson = JSON.stringify(learning_data);
    const doJson = JSON.stringify(what_i_do);

    await db.query(
      `INSERT INTO about_me (
        id, terminal_data, stats_data, learning_data, what_i_do, 
        journey_text, journey_title, lightbulb_title, lightbulb_subtitle, 
        portrait_image, what_i_do_title, cv_url
      ) VALUES (
        1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
      ) ON DUPLICATE KEY UPDATE
        terminal_data = VALUES(terminal_data),
        stats_data = VALUES(stats_data),
        learning_data = VALUES(learning_data),
        what_i_do = VALUES(what_i_do),
        journey_text = VALUES(journey_text),
        journey_title = VALUES(journey_title),
        lightbulb_title = VALUES(lightbulb_title),
        lightbulb_subtitle = VALUES(lightbulb_subtitle),
        portrait_image = VALUES(portrait_image),
        what_i_do_title = VALUES(what_i_do_title),
        cv_url = VALUES(cv_url)`,
      [
        termJson, statsJson, learnJson, doJson,
        journey_text, journey_title, lightbulb_title, lightbulb_subtitle,
        portrait_image, what_i_do_title, cv_url
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
