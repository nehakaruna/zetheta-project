const express = require("express");
const { Pool } = require("pg");
const Redis = require("ioredis");

const app = express();
app.use(express.json());

// PostgreSQL
const pool = new Pool({
  user: "user",
  host: "localhost",
  database: "zetheta",
  password: "password",
  port: 5432,
});

// Redis
const redis = new Redis();

// Root
app.get("/", (req, res) => {
  res.send("API Running");
});

// Init DB
app.get("/init-db", async (req, res) => {
  try {
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
  } catch (err) {
    console.error(err);
    res.status(500).send("Error creating tables");
  }
});

// Add test candidate
app.get("/add-test", async (req, res) => {
  try {
    const result = await pool.query(
      "INSERT INTO candidates (name) VALUES ($1) RETURNING *",
      ["Neha"]
    );

    // 🔥 Send event to worker
    await redis.publish(
      "candidate_submitted",
      JSON.stringify(result.rows[0])
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error adding candidate");
  }
});

// 🔥 NEW: Submit Assessment (REAL FLOW)
app.post("/submit-assessment", async (req, res) => {
  try {
    const { name } = req.body;

    const result = await pool.query(
      "INSERT INTO candidates (name, status) VALUES ($1, $2) RETURNING *",
      [name, "Attempted"]
    );

    // 🔥 Send event to worker
    await redis.publish(
      "candidate_submitted",
      JSON.stringify(result.rows[0])
    );

    res.json({
      message: "Assessment submitted",
      candidate: result.rows[0],
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error submitting assessment");
  }
});

// Get candidates
app.get("/candidates", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM candidates");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching candidates");
  }
});

// Get scores
app.get("/scores", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM scores");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching scores");
  }
});

// Combined results
app.get("/results", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT c.id, c.name, c.status, s.score
      FROM candidates c
      LEFT JOIN scores s ON c.id = s.candidate_id
      ORDER BY c.id ASC
    `);

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching results");
  }
});

// Start server
app.listen(3000, () => {
  console.log("Server running on port 3000");
});