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

    const [existing] = await db.query('SELECT * FROM projects WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ message: 'Project not found' });
    }
    const curr = existing[0];

    const techString        = tech !== undefined ? (Array.isArray(tech) ? tech.join(',') : (tech || '')) : (curr.tech || '');
    const projectTypeString = projectType !== undefined ? (Array.isArray(projectType) ? projectType.join(',') : (projectType || '')) : (curr.projectType || '');
    const screenshotsJson   = screenshots !== undefined ? JSON.stringify(screenshots || []) : (typeof curr.screenshots === 'string' ? curr.screenshots : JSON.stringify(curr.screenshots || []));
    const notesJson         = notes !== undefined ? JSON.stringify(notes || []) : (typeof curr.notes === 'string' ? curr.notes : JSON.stringify(curr.notes || []));
    const teamJson          = team !== undefined ? JSON.stringify(team || []) : (typeof curr.team === 'string' ? curr.team : JSON.stringify(curr.team || []));
    const extraInfoJson     = extraInfo !== undefined ? JSON.stringify(extraInfo || []) : (typeof curr.extraInfo === 'string' ? curr.extraInfo : JSON.stringify(curr.extraInfo || []));

    const hiddenVal         = hidden !== undefined ? (hidden ? 1 : 0) : curr.hidden;
    const featuredVal       = featured !== undefined ? (featured ? 1 : 0) : curr.featured;
    const featuredOrderVal  = featured_order !== undefined ? featured_order : (curr.featured_order || 0);
    const projectOrderVal   = project_order !== undefined ? project_order : (curr.project_order || 0);

    const titleVal          = title !== undefined ? title : curr.title;
    const descVal           = description !== undefined ? description : curr.description;
    const colorVal          = color !== undefined ? color : curr.color;
    const githubVal         = github !== undefined ? github : curr.github;
    const demoVal           = demo !== undefined ? demo : curr.demo;
    const youtubeVal        = youtubeUrl !== undefined ? youtubeUrl : curr.youtubeUrl;
    const docsVal           = docsUrl !== undefined ? docsUrl : curr.docsUrl;
    const startVal          = startDate !== undefined ? startDate : curr.startDate;
    const durVal            = duration !== undefined ? duration : curr.duration;
    const imgVal            = image !== undefined ? image : curr.image;
    const logoVal           = logo !== undefined ? logo : curr.logo;
    const archVal           = architecture !== undefined ? architecture : curr.architecture;
    const statusVal         = status !== undefined ? status : curr.status;
    const verVal            = version !== undefined ? version : curr.version;

    await db.query(
      `UPDATE projects SET
       title=?, description=?, color=?, projectType=?, tech=?, github=?, demo=?,
       youtubeUrl=?, docsUrl=?, startDate=?, duration=?, image=?, logo=?, architecture=?,
       screenshots=?, notes=?, team=?, hidden=?, featured=?, featured_order=?, project_order=?,
       status=?, version=?, extraInfo=?
       WHERE id=?`,
      [
        titleVal, descVal, colorVal, projectTypeString, techString, githubVal, demoVal,
        youtubeVal, docsVal, startVal, durVal, imgVal, logoVal, archVal,
        screenshotsJson, notesJson, teamJson,
        hiddenVal, featuredVal, featuredOrderVal, projectOrderVal,
        statusVal || null, verVal || null, extraInfoJson,
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
