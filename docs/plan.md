\# Plan



\## Architecture

\- Frontend: candidate portal, assessment engine, employer dashboard

\- Backend: API Gateway, Auth Service, Evaluation Worker

\- Database: PostgreSQL

\- Queue: Redis



\## Flow

Candidate logs in → starts assessment → token generated → enters assessment engine → submits answers → stored in DB → event sent to Redis → worker processes → score stored → dashboard updates



\## Tech Stack

\- Node.js + Express

\- React (later)

\- PostgreSQL

\- Redis

\- Docker



\## Risks

\- Token security

\- Redis failure

\- Real-time updates

