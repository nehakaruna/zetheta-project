const express = require("express");
const { Pool } = require("pg");

const app = express();
app.use(express.json());

const pool = new Pool({
  user: "user",
  host: "localhost",
  database: "zetheta",
  password: "password",
  port: 5432,
});

app.get("/", (req, res) => {
  res.send("API Running");
});

app.get("/init-db", async (req, res) => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS candidates (
      id SERIAL PRIMARY KEY,
      name TEXT,
      status TEXT DEFAULT 'Applied',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS scores (
      id SERIAL PRIMARY KEY,
      candidate_id INT,
      score INT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);
  res.send("Tables created");
});

app.get("/add-test", async (req, res) => {
  const result = await pool.query(
    "INSERT INTO candidates (name) VALUES ($1) RETURNING *",
    ["Neha"]
  );
  res.json(result.rows[0]);
});

app.get("/results", async (req, res) => {
  const result = await pool.query(`
    SELECT c.id, c.name, c.status, s.score
    FROM candidates c
    LEFT JOIN scores s ON c.id = s.candidate_id
    ORDER BY c.id
  `);
  res.json(result.rows);
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});