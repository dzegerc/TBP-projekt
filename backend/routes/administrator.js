const express = require('express');
const { Pool } = require('pg');

const bazaConfig = require('../bazaConfig');

const router = express.Router();
const pool = new Pool(bazaConfig);

router.get('/tasks', async (req, res) => {
  try {
    const query = 'SELECT * FROM taskovi';
    const result = await pool.query(query);

    const tasks = result.rows;

    res.json({ tasks });
  } catch (error) {
    console.error('Greška prilikom dohvata taskova', error);
    res.status(500).json({ error: 'Greška prilikom dohvata taskova' });
  }
});

module.exports = router;
