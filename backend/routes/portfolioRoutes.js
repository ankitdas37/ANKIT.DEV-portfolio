const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Helper: parse all JSON columns on a project row
function parseRow(row) {
  return {
    ...row,
    tech:        row.tech        ? row.tech.split(',').map(t => t.trim()).filter(Boolean) : [],
    projectType: row.projectType ? row.projectType.split(',').map(t => t.trim()).filter(Boolean) : [],
    screenshots: typeof row.screenshots === 'string' ? JSON.parse(row.screenshots) : (row.screenshots || []),
    team:        typeof row.team        === 'string' ? JSON.parse(row.team)        : (row.team        || []),
    extraInfo:   typeof row.extraInfo   === 'string' ? JSON.parse(row.extraInfo)   : (row.extraInfo   || []),
    hidden:      row.hidden === 1 || row.hidden === true,
    featured:    row.featured === 1 || row.featured === true,
    featured_order: row.featured_order || 0,
    project_order:  row.project_order  || 0,
  };
}

// @route   GET /api/projects
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM projects ORDER BY project_order ASC, created_at DESC');
    res.json(rows.map(parseRow));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   POST /api/projects
router.post('/', async (req, res) => {
  try {
    const {
      title, description, color, projectType, tech, github, demo,
      youtubeUrl, docsUrl, startDate, duration,
      image, logo, architecture, screenshots, notes, team,
      hidden, featured, featured_order, project_order,
      status, version, extraInfo,
    } = req.body;

    const techString        = Array.isArray(tech)        ? tech.join(',')        : (tech || '');
    const projectTypeString = Array.isArray(projectType) ? projectType.join(',') : (projectType || '');
    const screenshotsJson   = JSON.stringify(screenshots || []);
    const notesJson         = JSON.stringify(notes       || []);
    const teamJson          = JSON.stringify(team        || []);
    const extraInfoJson     = JSON.stringify(extraInfo   || []);
    const hiddenVal         = hidden   ? 1 : 0;
    const featuredVal       = featured ? 1 : 0;
    const featuredOrderVal  = featured_order || 0;
    const projectOrderVal   = project_order  || 0;

    const [result] = await db.query(
      `INSERT INTO projects
       (title, description, color, projectType, tech, github, demo, youtubeUrl, docsUrl,
        startDate, duration, image, logo, architecture, screenshots, notes, team,
        hidden, featured, featured_order, project_order, status, version, extraInfo)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        title, description, color, projectTypeString, techString, github, demo,
        youtubeUrl, docsUrl, startDate, duration, image, logo, architecture,
        screenshotsJson, notesJson, teamJson,
        hiddenVal, featuredVal, featuredOrderVal, projectOrderVal,
        status || null, version || null, extraInfoJson,
      ]
    );

    const [rows] = await db.query('SELECT * FROM projects WHERE id = ?', [result.insertId]);
    res.status(201).json(parseRow(rows[0]));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   PUT /api/projects/reorder
router.put('/reorder', async (req, res) => {
  try {
    const { order } = req.body;
    if (Array.isArray(order)) {
      for (const item of order) {
        await db.query('UPDATE projects SET project_order=? WHERE id=?', [item.project_order, item.id]);
      }
    }
    res.json({ message: 'Order updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   PUT /api/projects/featured/reorder
router.put('/featured/reorder', async (req, res) => {
  try {
    const { order } = req.body;
    if (Array.isArray(order)) {
      for (const item of order) {
        await db.query('UPDATE projects SET featured_order=? WHERE id=?', [item.featured_order, item.id]);
      }
    }
    res.json({ message: 'Order updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   PUT /api/projects/:id
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title, description, color, projectType, tech, github, demo,
      youtubeUrl, docsUrl, startDate, duration,
      image, logo, architecture, screenshots, notes, team,
      hidden, featured, featured_order, project_order,
      status, version, extraInfo,
    } = req.body;

    console.log('[PUT /projects] logo received:', logo);

    const techString        = Array.isArray(tech)        ? tech.join(',')        : (tech || '');
    const projectTypeString = Array.isArray(projectType) ? projectType.join(',') : (projectType || '');
    const screenshotsJson   = JSON.stringify(screenshots || []);
    const notesJson         = JSON.stringify(notes       || []);
    const teamJson          = JSON.stringify(team        || []);
    const extraInfoJson     = JSON.stringify(extraInfo   || []);
    const hiddenVal         = hidden   ? 1 : 0;
    const featuredVal       = featured ? 1 : 0;
    const featuredOrderVal  = featured_order || 0;
    const projectOrderVal   = project_order  || 0;

    await db.query(
      `UPDATE projects SET
       title=?, description=?, color=?, projectType=?, tech=?, github=?, demo=?,
       youtubeUrl=?, docsUrl=?, startDate=?, duration=?, image=?, logo=?, architecture=?,
       screenshots=?, notes=?, team=?, hidden=?, featured=?, featured_order=?, project_order=?,
       status=?, version=?, extraInfo=?
       WHERE id=?`,
      [
        title, description, color, projectTypeString, techString, github, demo,
        youtubeUrl, docsUrl, startDate, duration, image, logo, architecture,
        screenshotsJson, notesJson, teamJson,
        hiddenVal, featuredVal, featuredOrderVal, projectOrderVal,
        status || null, version || null, extraInfoJson,
        id,
      ]
    );

    const [rows] = await db.query('SELECT * FROM projects WHERE id = ?', [id]);
    res.json(parseRow(rows[0]));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   DELETE /api/projects/:id
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM projects WHERE id = ?', [id]);
    res.json({ message: 'Project removed' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;
