const { Pool } = require("pg");
const Redis = require("ioredis");

const pool = new Pool({
  user: "user",
  host: "localhost",
  database: "zetheta",
  password: "password",
  port: 5432,
});

const redis = new Redis();

console.log("Worker listening for events...");

redis.subscribe("candidate_submitted");

redis.on("message", async (channel, message) => {
  if (channel === "candidate_submitted") {
    const candidate = JSON.parse(message);

    console.log(`Processing candidate ${candidate.id}`);

    const score = Math.floor(Math.random() * 100);

    await pool.query(
      "INSERT INTO scores (candidate_id, score) VALUES ($1, $2)",
      [candidate.id, score]
    );

    console.log(`Processed candidate ${candidate.id} with score ${score}`);
  }
});