const { Pool } = require("pg");

const pool = new Pool({
  user: "user",
  host: "localhost",
  database: "zetheta",
  password: "password",
  port: 5432,
});

async function processCandidate() {
  console.log("Worker checking...");

  const result = await pool.query(`
    SELECT c.* FROM candidates c
    LEFT JOIN scores s ON c.id = s.candidate_id
    WHERE s.id IS NULL
    LIMIT 1
  `);

  if (result.rows.length === 0) {
    console.log("No new candidates");
    return;
  }

  const candidate = result.rows[0];
  const score = Math.floor(Math.random() * 100);

  await pool.query(
    "INSERT INTO scores (candidate_id, score) VALUES ($1, $2)",
    [candidate.id, score]
  );

  console.log(`Processed candidate ${candidate.id} with score ${score}`);
}

setInterval(processCandidate, 5000);