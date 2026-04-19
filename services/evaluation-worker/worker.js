const { Pool } = require("pg");
const Redis = require("ioredis");

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

console.log("Worker listening for events...");

// Subscribe to channel
redis.subscribe("candidate_submitted");

// 🔥 PROCESS FUNCTION WITH RETRY
async function processCandidate(candidate, retries = 3) {
  try {
    console.log(JSON.stringify({
      level: "info",
      event: "checking_candidate",
      candidateId: candidate.id
    }));

    // Idempotency check
    const existing = await pool.query(
      "SELECT * FROM scores WHERE candidate_id = $1",
      [candidate.id]
    );

    if (existing.rows.length > 0) {
      console.log(JSON.stringify({
        level: "info",
        event: "skipped_duplicate",
        candidateId: candidate.id
      }));
      return;
    }

    console.log(JSON.stringify({
      level: "info",
      event: "processing_candidate",
      candidateId: candidate.id
    }));

    const score = Math.floor(Math.random() * 100);

    // Insert score
    await pool.query(
      "INSERT INTO scores (candidate_id, score) VALUES ($1, $2)",
      [candidate.id, score]
    );

    // Update status
    await pool.query(
      "UPDATE candidates SET status = $1 WHERE id = $2",
      ["Evaluated", candidate.id]
    );

    console.log(JSON.stringify({
      level: "info",
      event: "processed",
      candidateId: candidate.id,
      score: score
    }));

  } catch (err) {
    console.log(JSON.stringify({
      level: "error",
      event: "processing_failed",
      candidateId: candidate.id,
      error: err.message,
      retriesLeft: retries
    }));

    if (retries > 0) {
      setTimeout(() => processCandidate(candidate, retries - 1), 2000);
    } else {
      console.log(JSON.stringify({
        level: "error",
        event: "permanent_failure",
        candidateId: candidate.id
      }));
    }
  }
}

// Handle messages
redis.on("message", async (channel, message) => {
  if (channel === "candidate_submitted") {
    const candidate = JSON.parse(message);
    processCandidate(candidate);
  }
});