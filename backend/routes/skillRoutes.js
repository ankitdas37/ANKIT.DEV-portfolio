const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Get all skills
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM skills ORDER BY id DESC');
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch skills' });
  }
});

// Create new skill
router.post('/', async (req, res) => {
  try {
    const { name, icon, color, level, categories } = req.body;
    const [result] = await db.query(
      'INSERT INTO skills (name, icon, color, level, categories) VALUES (?, ?, ?, ?, ?)',
      [name, icon, color, level, JSON.stringify(categories || [])]
    );
    const [newSkill] = await db.query('SELECT * FROM skills WHERE id = ?', [result.insertId]);
    res.status(201).json(newSkill[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create skill' });
  }
});

// Update skill
router.put('/:id', async (req, res) => {
  try {
    const { name, icon, color, level, categories, hidden } = req.body;
    await db.query(
      'UPDATE skills SET name = ?, icon = ?, color = ?, level = ?, categories = ?, hidden = ? WHERE id = ?',
      [name, icon, color, level, JSON.stringify(categories || []), hidden ? 1 : 0, req.params.id]
    );
    const [updatedSkill] = await db.query('SELECT * FROM skills WHERE id = ?', [req.params.id]);
    res.json(updatedSkill[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update skill' });
  }
});

// Delete skill
router.delete('/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM skills WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete skill' });
  }
});

module.exports = router;
