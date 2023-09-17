const express = require('express');
const app = express();
const pg = require('pg');
const ejs = require('ejs');
const path = require('path');

app.use(express.urlencoded({ extended: true }));

app.set('view engine', 'ejs');

app.use(express.static(path.join(__dirname, 'public')));

const { Pool } = pg;
const pool = new Pool({
  connectionString: 'postgres://admin:tahar@postgres:5432/registration_db',
});

const createTableQuery = `
  CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(100) NOT NULL
  )
`;

app.get('/', (req, res) => {
  res.render('register');
});

app.post('/register', async (req, res) => {
  const { first_name, last_name, email, password } = req.body;
  const client = await pool.connect();

  try {
    await client.query(createTableQuery)
    await client.query('INSERT INTO users (first_name, last_name, email, password) VALUES ($1, $2, $3, $4)', [first_name, last_name, email, password]);
    res.redirect('/?success=true');
  } catch (error) {
    console.error('Error registering user', error);
    res.status(500).send('Registration failed');
  } finally {
    client.release();
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});