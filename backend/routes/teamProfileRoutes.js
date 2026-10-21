const express = require('express');
const router = express.Router();
const db = require('../config/db');

// @route   GET /api/team-profiles
// @desc    Get all team profiles
// @access  Public
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM team_profiles ORDER BY id DESC');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching team profiles:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   POST /api/team-profiles
// @desc    Create a new team profile
// @access  Private (authMiddleware)
router.post('/', async (req, res) => {
  try {
    const {
      name,
      role = '',
      email = '',
      photo = '',
      github = '',
      linkedin = '',
      instagram = '',
      twitter = '',
      website = '',
      bio = '',
      skills = '',
    } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Member name is required' });
    }

    const [result] = await db.query(
      `INSERT INTO team_profiles 
        (name, role, email, photo, github, linkedin, instagram, twitter, website, bio, skills)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name.trim(),
        role.trim(),
        email.trim(),
        photo.trim(),
        github.trim(),
        linkedin.trim(),
        instagram.trim(),
        twitter.trim(),
        website.trim(),
        bio.trim(),
        skills.trim(),
      ]
    );

    const [rows] = await db.query('SELECT * FROM team_profiles WHERE id = ?', [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (error) {
    console.error('Error creating team profile:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   PUT /api/team-profiles/:id
// @desc    Update a team profile
// @access  Private (authMiddleware)
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      role = '',
      email = '',
      photo = '',
      github = '',
      linkedin = '',
      instagram = '',
      twitter = '',
      website = '',
      bio = '',
      skills = '',
    } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Member name is required' });
    }

    await db.query(
      `UPDATE team_profiles 
       SET name=?, role=?, email=?, photo=?, github=?, linkedin=?, instagram=?, twitter=?, website=?, bio=?, skills=?
       WHERE id=?`,
      [
        name.trim(),
        role.trim(),
        email.trim(),
        photo.trim(),
        github.trim(),
        linkedin.trim(),
        instagram.trim(),
        twitter.trim(),
        website.trim(),
        bio.trim(),
        skills.trim(),
        id,
      ]
    );

    const [rows] = await db.query('SELECT * FROM team_profiles WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Team profile not found' });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error('Error updating team profile:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   DELETE /api/team-profiles/:id
// @desc    Delete a team profile
// @access  Private (authMiddleware)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM team_profiles WHERE id = ?', [id]);
    res.json({ message: 'Team profile removed', id: Number(id) });
  } catch (error) {
    console.error('Error deleting team profile:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;
