const express = require("express");
const { Pool } = require("pg");
const Redis = require("ioredis");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

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

const JWT_SECRET = "supersecret";

// Root
app.get("/", (req, res) => {
  res.send("API Running");
});

// Init DB + INDEX
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

      CREATE INDEX IF NOT EXISTS idx_candidate_id ON scores(candidate_id);
    `);

    res.send("Tables + index created");
  } catch (err) {
    res.status(500).send("Error");
  }
});

// Token
app.post("/generate-token", async (req, res) => {
  const { candidateId } = req.body;

  const nonce = crypto.randomBytes(16).toString("hex");

  await redis.setex(`nonce:${nonce}`, 120, "valid");

  const token = jwt.sign(
    { candidateId, nonce },
    JWT_SECRET,
    { expiresIn: "120s" }
  );

  res.json({ token });
});

// Add candidate
app.get("/add-test", async (req, res) => {
  const result = await pool.query(
    "INSERT INTO candidates (name) VALUES ($1) RETURNING *",
    ["Neha"]
  );

  await redis.publish(
    "candidate_submitted",
    JSON.stringify(result.rows[0])
  );

  res.json(result.rows[0]);
});

// Secure submit
app.post("/submit-assessment", async (req, res) => {
  try {
    const token = req.headers["authorization"];

    const decoded = jwt.verify(token, JWT_SECRET);

    const exists = await redis.get(`nonce:${decoded.nonce}`);

    if (!exists) return res.send("Token already used or expired");

    await redis.del(`nonce:${decoded.nonce}`);

    const result = await pool.query(
      "INSERT INTO candidates (name, status) VALUES ($1, $2) RETURNING *",
      [`Candidate-${decoded.candidateId}`, "Attempted"]
    );

    await redis.publish(
      "candidate_submitted",
      JSON.stringify(result.rows[0])
    );

    res.json(result.rows[0]);

  } catch {
    res.send("Invalid or expired token");
  }
});

// Results
app.get("/results", async (req, res) => {
  const result = await pool.query(`
    SELECT c.id, c.name, c.status, s.score
    FROM candidates c
    LEFT JOIN scores s ON c.id = s.candidate_id
    ORDER BY c.id ASC
  `);

  res.json(result.rows);
});

// Start
app.listen(3000, () => {
  console.log("Server running on port 3000");
});