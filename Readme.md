# Learning Management System (CS6324)

Full-stack LMS with role-based dashboards (Admin, Teacher, Student).

## Project structure

| Folder | Stack |
|--------|--------|
| `frontend/` | React + Vite |
| `lms-Backend/` | Spring Boot + MySQL + AWS S3 |

## Prerequisites

- Java 25+, Gradle (or use `./gradlew` in `lms-Backend`)
- Node.js 18+
- MySQL (database `lms` with schema loaded)
- AWS S3 bucket (for file uploads)
- Optional: SerpAPI key (AI recommendations)

## Backend setup

```bash
cd lms-Backend
cp src/main/resources/application.properties.example src/main/resources/application.properties
# Edit application.properties with your DB, mail, AWS, and SerpAPI credentials
cp .env.example .env   # if present; otherwise create .env with AWS_ACCESS_KEY and AWS_SECRET_KEY
./gradlew bootRun
```

API runs at `http://localhost:8080/api`

## Frontend setup

```bash
cd frontend
npm install
# Set VITE_API_BASE_URL=http://localhost:8080/api in .env
npm run dev
```

App runs at `http://localhost:5173`

## GitHub

Single repo contains both frontend and backend. Do not commit `application.properties` or `.env` (use the `.example` files).
