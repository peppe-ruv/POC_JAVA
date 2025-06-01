const express = require('express');
const dotenv = require('dotenv');
const crypto = require('crypto');
const { Pool } = require('pg');
const path = require('path'); // Added path module

// Load environment variables from .env file
dotenv.config();

const app = express();
app.use(express.json()); // Middleware to parse JSON bodies

// Serve static files from the Angular app build output
app.use(express.static(path.join(__dirname, 'public')));

const port = process.env.PORT || 3000;
const secretKey = process.env.SECRET_KEY || 'your-secret-key'; // Placeholder, move to .env

// PostgreSQL Pool Setup for Heroku and local development
const connectionString = process.env.DATABASE_URL;

const pool = new Pool({
  connectionString: connectionString ? connectionString : `postgresql://${process.env.DB_USER || 'dbuser'}:${process.env.DB_PASSWORD || 'dbpassword'}@${process.env.DB_HOST || 'localhost'}:${parseInt(process.env.DB_PORT) || 5432}/${process.env.DB_DATABASE || 'mydb'}`,
  ssl: connectionString ? { rejectUnauthorized: false } : false,
});

pool.on('connect', () => {
  console.log('Connected to the database');
  if (!connectionString && process.env.DB_USER === undefined) { // Modified warning condition
    console.warn('Warning: DB_USER environment variable is not set and DATABASE_URL is not available. Using default local DB configuration.');
  }
  // Add similar warnings for other DB variables if desired
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});


// API routes should be defined before the catch-all route

// HMAC Verification Endpoint
app.post('/api/verify-hmac', async (req, res) => {
  const { c_number } = req.body;

  if (!c_number) {
    return res.status(400).json({ error: 'c_number is required' });
  }

  const originalString = 'test-string'; // This should be a known, consistent string

  try {
    // Recalculate HMAC
    const recalculatedHmac = crypto
      .createHmac('sha256', secretKey)
      .update(originalString)
      .digest('hex');

    if (recalculatedHmac === c_number) {
      // HMACs match, query the database
      try {
        const queryResult = await pool.query(
          'SELECT data_payload FROM c_number_data WHERE hmac_value = $1',
          [recalculatedHmac]
        );

        if (queryResult.rows.length > 0) {
          res.json(queryResult.rows[0].data_payload);
        } else {
          res.status(404).json({ error: 'No data found for this HMAC' });
        }
      } catch (dbError) {
        console.error('Database query error:', dbError);
        res.status(500).json({ error: 'Internal server error (database)' });
      }
    } else {
      // HMACs do not match
      res.status(401).json({ error: 'Invalid HMAC' });
    }
  } catch (error) {
    console.error('HMAC calculation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Assistance Request Endpoint
app.post('/api/assistance-request', async (req, res) => {
  const { name, email, issue_description } = req.body;

  if (!name || !email || !issue_description) {
    return res.status(400).json({ error: 'Missing required fields: name, email, issue_description' });
  }

  try {
    const insertQuery = `
      INSERT INTO assistance_requests (name, email, issue_description)
      VALUES ($1, $2, $3)
      RETURNING id, submitted_at;
    `;
    // Note: The 'assistance_requests' table schema is assumed to be:
    // id SERIAL PRIMARY KEY,
    // name TEXT NOT NULL,
    // email TEXT NOT NULL,
    // issue_description TEXT NOT NULL,
    // submitted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP

    const result = await pool.query(insertQuery, [name, email, issue_description]);

    res.status(201).json({
      message: 'Assistance request submitted successfully.',
      data: result.rows[0],
    });
  } catch (dbError) {
    console.error('Database insert error:', dbError);
    res.status(500).json({ error: 'Internal server error (database)' });
  }
});

// Catch-all route to serve Angular's index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
