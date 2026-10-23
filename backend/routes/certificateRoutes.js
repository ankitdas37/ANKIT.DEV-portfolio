const express = require('express');
const router = express.Router();
const db = require('../config/db');

const parseCertRow = (row) => {
  let parsedCategory = row.category;
  if (typeof row.category === 'string') {
    try {
      parsedCategory = JSON.parse(row.category);
    } catch (e) {
      parsedCategory = row.category;
    }
  }

  let parsedImages = [];
  if (row.images) {
    if (Array.isArray(row.images)) {
      parsedImages = row.images;
    } else if (typeof row.images === 'string') {
      try {
        parsedImages = JSON.parse(row.images);
      } catch (e) {
        parsedImages = [row.images];
      }
    }
  }
  // Fallback: If images array is empty but legacy image exists, include it
  if ((!parsedImages || parsedImages.length === 0) && row.image) {
    parsedImages = [row.image];
  }

  return {
    ...row,
    hidden: row.hidden === 1 || row.hidden === true,
    category: parsedCategory,
    images: Array.isArray(parsedImages) ? parsedImages : [],
    pdf_url: row.pdf_url || '',
    cert_order: Number(row.cert_order) || 0
  };
};

// @route   GET /api/certificates
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM certificates ORDER BY cert_order ASC, created_at DESC');
    res.json(rows.map(parseCertRow));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   PUT /api/certificates/reorder
router.put('/reorder', async (req, res) => {
  try {
    const { order } = req.body;
    if (Array.isArray(order)) {
      for (const item of order) {
        await db.query('UPDATE certificates SET cert_order=? WHERE id=?', [item.cert_order, item.id]);
      }
    }
    res.json({ message: 'Certificate order updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   POST /api/certificates
router.post('/', async (req, res) => {
  try {
    const { title, organization, date, color, category, link, image, images, pdf_url, cert_order, hidden, hours } = req.body;
    
    // Ensure category is a string if it's passed as an array
    const catStr = Array.isArray(category) ? JSON.stringify(category) : category;
    
    // Ensure images is stored as JSON array string
    const imagesArray = Array.isArray(images) ? images : (image ? [image] : []);
    const imagesStr = JSON.stringify(imagesArray);
    const primaryImage = image || imagesArray[0] || '';
    const certOrderVal = Number(cert_order) || 0;

    const [result] = await db.query(
      `INSERT INTO certificates (title, organization, date, color, category, link, image, images, pdf_url, cert_order, hidden, hours)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [title, organization, date, color, catStr, link, primaryImage, imagesStr, pdf_url || '', certOrderVal, hidden ? 1 : 0, hours || 0]
    );
    const [rows] = await db.query('SELECT * FROM certificates WHERE id = ?', [result.insertId]);
    res.status(201).json(parseCertRow(rows[0]));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   PUT /api/certificates/:id
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, organization, date, color, category, link, image, images, pdf_url, cert_order, hidden, hours } = req.body;
    
    // Ensure category is a string if it's passed as an array
    const catStr = Array.isArray(category) ? JSON.stringify(category) : category;

    // Get current record to preserve values if not provided
    const [existing] = await db.query('SELECT * FROM certificates WHERE id = ?', [id]);
    const curr = existing[0] || {};

    const imagesArray = images !== undefined ? (Array.isArray(images) ? images : [images]) : (curr.images ? JSON.parse(curr.images) : (curr.image ? [curr.image] : []));
    const imagesStr = JSON.stringify(imagesArray);
    const primaryImage = image !== undefined ? image : (imagesArray[0] || curr.image || '');
    const certOrderVal = cert_order !== undefined ? Number(cert_order) : (curr.cert_order || 0);
    const pdfUrlVal = pdf_url !== undefined ? pdf_url : (curr.pdf_url || '');

    await db.query(
      `UPDATE certificates SET title=?, organization=?, date=?, color=?, category=?, link=?, image=?, images=?, pdf_url=?, cert_order=?, hidden=?, hours=? WHERE id=?`,
      [title, organization, date, color, catStr, link, primaryImage, imagesStr, pdfUrlVal, certOrderVal, hidden ? 1 : 0, hours || 0, id]
    );
    const [rows] = await db.query('SELECT * FROM certificates WHERE id = ?', [id]);
    res.json(parseCertRow(rows[0]));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   DELETE /api/certificates/:id
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM certificates WHERE id = ?', [id]);
    res.json({ message: 'Certificate removed' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;
