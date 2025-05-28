const express = require('express');
const router = express.Router();
const Leave = require('../../models/Leave.js');

router.get('/', async (req, res) => {
  try {
    const leaves = await Leave.find().sort({ date: -1 });
    res.json(leaves);
  } catch (err) {
    console.error('Error fetching leaves:', err);
    res.status(500).json({ error: 'Failed to fetch leave records.' });
  }
});

module.exports = router;
