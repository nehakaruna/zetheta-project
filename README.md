\# Distributed Candidate Evaluation Platform



\## 🚀 Overview

This project implements a distributed, event-driven system for asynchronous candidate evaluation.



The system separates request handling from background processing using Redis, ensuring scalability, fault tolerance, and responsiveness.



\---



\## 🧠 Architecture



Client → API Gateway → PostgreSQL → Redis → Worker → PostgreSQL → API → Dashboard



\### Components:

\- API Gateway (Node.js + Express)

\- PostgreSQL (data storage)

\- Redis (event broker)

\- Evaluation Worker (async processing)

\- Simple Frontend Dashboard



\---



\## 🔄 System Flow



1\. Candidate created via API

2\. API stores candidate in PostgreSQL

3\. API publishes event to Redis

4\. Worker consumes event

5\. Worker computes score

6\. Worker updates database + status

7\. Results available via `/results`



\---



\## 🔐 Security (HIGH PRIORITY)



\- JWT-based authentication

\- Token expiry: 120 seconds

\- Redis nonce for single-use tokens

\- Replay attack prevention

\- Server-side token generation



\---



\## ⚙️ Distributed System Features



\### ✅ Asynchronous Processing

\- API does not wait for scoring

\- Worker processes independently



\### ✅ Idempotency

\- Duplicate events are ignored

\- Worker checks existing score before processing



\### ✅ Retry Logic

\- Worker retries failed jobs up to 3 times



\### ✅ Fault Tolerance

\- Redis failures do not corrupt data

\- System continues gracefully



\---



\## 📊 Performance Optimization



\- Index on `scores(candidate\_id)`

\- Avoids full table scans

\- Efficient DB lookups



\---



\## 📈 Observability



\- Structured JSON logs

\- Tracks:

&#x20; - processing events

&#x20; - failures

&#x20; - retries



\---



\## 🐳 Setup Instructions



\### 1. Start services

```bash

docker compose up -d

