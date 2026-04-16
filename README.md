\# Distributed Candidate Evaluation Platform



\##  Overview

This project is a simplified distributed system for evaluating candidates asynchronously. It demonstrates a production-style architecture with multiple services, database integration, and background processing.



\---



\##  Architecture



The system consists of:



\- \*\*API Gateway (Node.js + Express)\*\*

&#x20; - Handles user requests

&#x20; - Inserts candidate data

&#x20; - Exposes endpoints for results



\- \*\*PostgreSQL (Database)\*\*

&#x20; - Stores candidates and scores



\- \*\*Evaluation Worker (Node.js)\*\*

&#x20; - Runs independently

&#x20; - Processes candidates asynchronously

&#x20; - Generates scores



\- \*\*Docker\*\*

&#x20; - Runs PostgreSQL and Redis containers



\---



\##  System Flow



1\. Candidate is added via API (`/add-test`)

2\. Candidate is stored in PostgreSQL

3\. Worker continuously checks for unprocessed candidates

4\. Worker assigns a score

5\. Score is stored in the database

6\. API exposes results via `/results`



\---



\##  Tech Stack



\- Node.js

\- Express.js

\- PostgreSQL

\- Docker

\- JavaScript



\---



\##  Project Structure

zetheta-project/

│

├── services/

│ ├── api-gateway/

│ │ └── index.js

│ │

│ └── evaluation-worker/

│ └── worker.js

│

├── docker-compose.yml

└── README.md





\---



\##  Setup Instructions



\### 1. Start Database (Docker)

```bash

docker compose up -d



