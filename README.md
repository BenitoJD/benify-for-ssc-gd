# Benify for SSC GD

**Benify for SSC GD** is a focused SSC GD preparation platform with practice flows, PYQs, onboarding, analytics, community discussion, physical training support, and document-readiness tools.

## 📋 Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Features](#features)
- [Quick Start](#quick-start)
- [How Students Use It](#how-students-use-it)
- [How Admins Use It](#how-admins-use-it)
- [How Agents Use It](#how-agents-use-it)
- [Architecture](#architecture)
- [API Documentation](#api-documentation)
- [Development Guide](#development-guide)
- [Deployment](#deployment)
- [Contributing](#contributing)

---

## Overview

Benify for SSC GD is a full-stack SSC GD preparation platform built to support the core student journey from signup to practice, progress tracking, fitness readiness, and community help. The platform offers:

- **Adaptive Learning**: Personalized study plans based on performance
- **Practice Tests**: Comprehensive test series with PYQs (Previous Year Questions)
- **Analytics Dashboard**: Detailed insights into preparation progress
- **Gamification**: Motivation through points, badges, and streaks
- **Community**: Discussion forums and peer support
- **Physical Training**: Special section for physical exam preparation
- **Document Management**: Access to important documents and resources
- **Free Access**: Core learner workflows are available without subscription gating

---

## Tech Stack

### Frontend
- **Framework**: Next.js 16 (React)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: TanStack React Query
- **Form Handling**: Zod + React Hook Form
- **HTTP Client**: Axios
- **Push Notifications**: Firebase Cloud Messaging (FCM)
- **Internationalization**: next-intl

### Backend
- **Framework**: FastAPI (Python)
- **Language**: Python 3.11
- **Database**: PostgreSQL 16
- **Cache**: Redis 7
- **File Storage**: MinIO (S3-compatible)
- **Authentication**: JWT (access + refresh tokens)
- **Password Hashing**: Bcrypt

### Infrastructure
- **Containerization**: Docker & Docker Compose
- **Reverse Proxy**: Nginx 1.27
- **Architecture**: Microservices-ready monolith

---

## Features

### Core Learning
- 📚 **Syllabus Management**: Structured curriculum for SSC GD
- 📝 **Practice Tests**: Topic-wise and full-length mock tests
- 🔄 **Test Attempts**: Track and review past attempts
- 📊 **Analytics**: Performance metrics and percentile rankings

### User Engagement
- 🎮 **Gamification**: Points, XP, badges, and daily streaks
- 🤖 **AI Assistant**: Intelligent study assistance
- 🔔 **Notifications**: Push notifications for updates
- 💬 **Community**: Forums for discussions and doubt clearing

### Administrative
- 👨‍💼 **Admin Dashboard**: User and content management
- 📁 **Document Management**: Upload and share documents
- 📣 **Announcements and Content Ops**: Manage platform updates and internal workflows

### Physical Training
- 🏃 **Physical Training Module**: Videos and guides for physical exam
- 📋 **Document Management**: Physical test document verification

---

## Quick Start

### Prerequisites

- Docker & Docker Compose
- Git
- (Optional) Node.js 20+ for local frontend development
- (Optional) Python 3.11+ for local backend development

### Clone the Repository

```bash
git clone https://github.com/BenitoJD/olli-academy-ssc-gd.git
cd olli-academy-ssc-gd
```

### Environment Configuration

Create a `.env` file in the project root with the following variables:

```bash
# Database
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=benify_for_ssc_gd

# Redis
REDIS_URL=redis://localhost:6379/0

# MinIO (S3-compatible storage)
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_BUCKET=benify-for-ssc-gd
MINIO_SECURE=false

# JWT Authentication (REQUIRED in production - generate a secure random string)
JWT_SECRET_KEY=your-super-secret-key-change-in-production

# Optional: API key for OpenCloud admin automation
OPENCLOUD_ADMIN_API_KEY=replace-with-a-long-random-secret

# Application
DEBUG=false
LOG_LEVEL=INFO

# URLs for host-based frontend/backend development
NEXT_PUBLIC_API_URL=http://localhost:3100
NEXT_PUBLIC_APP_URL=http://localhost:3101
```

### Local Development

```bash
# Start infrastructure only
docker compose up -d

# Stop infrastructure
docker compose down
```

Run the frontend on the host machine:

```bash
npm run dev:web
```

Run the API on the host machine:

```bash
cd apps/api
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn internal.main:app --reload --host 0.0.0.0 --port 3100
```

Or from the repo root after your Python environment is ready:

```bash
npm run dev:api
```

### Production Deployment Overview

This repository also includes a server-oriented production deployment path:

- `docker-compose.prod.yml` for the full application stack
- `ops/nginx.prod.conf` for reverse proxying web and API traffic
- `ops/deploy/auto-deploy.sh` for pull-based auto deployment from `main`
- `ops/systemd/benify-autodeploy.service` and `.timer` for continuous deployment on a server

Typical server layout:

- repo clone at `/opt/benify-for-ssc-gd`
- production env file at `/opt/benify-for-ssc-gd/.env.production`
- public app served on port `80`
- API served behind Nginx at `/api`

### Access Points

| Service | URL |
|---------|-----|
| Web Application | http://localhost:3101 |
| API | http://localhost:3100 |
| API Documentation | http://localhost:3100/docs (when `DEBUG=true`) |
| MinIO Console | http://localhost:9001 |

---

## How Students Use It

This is the learner-facing flow the product is built around.

### Student Journey

1. Go to `http://localhost:3101`
2. Create an account at `/signup`
3. Complete onboarding at `/onboarding`
4. Start using the main learning surfaces:
   - `/dashboard` for plan, streaks, and progress
   - `/pyqs` for practice and previous year questions
   - `/physical` for PST/PET tracking
   - `/documents` for document-readiness support
   - `/community` for discussion

### Student Authentication

- Student login is at `/login`
- Authentication uses JWT plus httpOnly cookies
- Learner sessions are refreshed automatically by the frontend client

### Student-Facing Product Areas

- **Dashboard**: exam countdown, weak areas, recent activity, streaks
- **Practice/PYQs**: written practice and mock-style flows
- **Physical**: training plans, readiness tracking, mock physical test
- **Documents**: checklists, medical guidance, reminders
- **Community**: questions, replies, peer interaction

---

## How Admins Use It

Admins manage users, content, documents, physical training plans, and announcements through the admin UI and backend admin APIs.

### Admin Login

- Admin web login: `http://localhost:3101/admin/login`
- Admin API login: `POST /api/v1/admin/login`
- Admin session bootstrap: `GET /api/v1/admin/me`

The admin access token is intentionally short-lived and the backend also sets auth cookies for the admin session.

### Admin Dashboard

Main admin area:

- `http://localhost:3101/admin`

Primary dashboard capabilities:

- platform stats
- recent registrations
- quick links into content and user operations
- OpenCloud endpoint hints for automation

### Admin UI Areas

The admin app is organized around these routes:

- `/admin/users`
  - inspect users
  - filter/search by role or email/name
  - open user detail pages
  - suspend or reactivate users

- `/admin/content`
  - content operations overview
  - fast access to subjects, topics, lessons, questions, and test series

- `/admin/content/subjects`
  - create, edit, publish, and delete subjects

- `/admin/content/topics`
  - manage topics within subjects

- `/admin/content/lessons`
  - manage lesson content, order, premium flag, and assets

- `/admin/content/questions`
  - manage question bank entries
  - bulk import question CSV-style data through the admin UI

- `/admin/content/test-series`
  - create and manage chapter, sectional, full-length, and quiz test series

- `/admin/documents`
  - manage document checklists
  - manage medical guidelines
  - review compliance views
  - manage announcements

- `/admin/physical`
  - manage physical training plans
  - inspect compliance breakdowns

### Admin API Surface

These backend endpoints back the admin UI:

- `POST /api/v1/admin/login`
- `GET /api/v1/admin/dashboard`
- `GET /api/v1/admin/me`
- `GET /api/v1/admin/users`
- `GET /api/v1/admin/users/{user_id}`
- `PATCH /api/v1/admin/users/{user_id}/status`

Additional admin CRUD APIs are exposed for:

- subjects
- topics
- lessons
- questions
- test series
- document checklists
- medical guidelines
- announcements
- physical plans

### Admin Workflow Recommendation

Use the browser admin UI for:

- day-to-day content review
- small edits
- moderation and user checks
- announcements
- physical/document configuration

Use the OpenCloud endpoints for:

- bulk content ingestion
- repeatable content sync jobs
- agent-driven update workflows
- audit-friendly imports

---

## How Agents Use It

This app exposes a dedicated agent-friendly content operations surface under the OpenCloud admin endpoints.

### Agent Auth Modes

Agents can authenticate in two ways:

1. Admin bearer token from the normal admin auth flow
2. `X-OpenCloud-Api-Key` when `OPENCLOUD_ADMIN_API_KEY` is configured

Capability discovery:

- `GET /api/v1/admin/opencloud/capabilities`

Returns:

- whether OpenCloud API key auth is enabled
- supported auth modes
- bulk sync endpoint
- supported resources

### Supported Agent Resources

The bulk sync endpoint supports:

- `subjects`
- `topics`
- `lessons`
- `questions`
- `test_series`

Endpoint:

- `POST /api/v1/admin/opencloud/content/sync`

Audit log endpoint:

- `GET /api/v1/admin/opencloud/audit-logs`

### Agent Content Sync Model

The sync endpoint is designed for bulk upsert operations.

Behavior:

- creates new records when natural keys do not exist
- updates matching records when upsert keys already exist
- skips unchanged resources
- records audit logs for each sync run
- supports `dry_run`

Typical natural references used by the sync layer:

- subject: `code`
- topic: `subject_code + topic_name`
- lesson: `subject_code + topic_name + title`
- question: topic reference + question text
- test series: title + attached topic refs

### Minimal Agent Example

```bash
curl -X POST http://localhost:3100/api/v1/admin/opencloud/content/sync \
  -H "Content-Type: application/json" \
  -H "X-OpenCloud-Api-Key: replace-with-your-opencloud-key" \
  -d '{
    "subjects": [
      {
        "code": "GK",
        "name": "General Knowledge",
        "description": "Static and current general awareness",
        "order_index": 1
      }
    ],
    "topics": [
      {
        "subject_code": "GK",
        "name": "Indian History",
        "description": "Ancient to modern history",
        "order_index": 1,
        "estimated_hours": 6
      }
    ],
    "lessons": [
      {
        "subject_code": "GK",
        "topic_name": "Indian History",
        "title": "Revolt of 1857",
        "content": "Detailed lesson content",
        "order_index": 1,
        "estimated_minutes": 25,
        "is_premium": false
      }
    ],
    "questions": [
      {
        "subject_code": "GK",
        "topic_name": "Indian History",
        "question_text": "Who was the last Mughal emperor of India?",
        "options": ["Bahadur Shah Zafar", "Akbar", "Aurangzeb", "Humayun"],
        "correct_answer": "A",
        "explanation": "Bahadur Shah Zafar was the last Mughal emperor.",
        "difficulty": "easy",
        "source": "OpenCloud",
        "exam_year": 2024
      }
    ],
    "test_series": [
      {
        "title": "History Sprint",
        "description": "Quick chapter test",
        "test_type": "chapter",
        "duration_minutes": 15,
        "total_questions": 10,
        "topic_refs": [
          {
            "subject_code": "GK",
            "topic_name": "Indian History"
          }
        ],
        "instructions": "Attempt all questions."
      }
    ]
  }'
```

### Dry Run Example

```bash
curl -X POST http://localhost:3100/api/v1/admin/opencloud/content/sync \
  -H "Content-Type: application/json" \
  -H "X-OpenCloud-Api-Key: replace-with-your-opencloud-key" \
  -d '{
    "dry_run": true,
    "subjects": [
      {
        "code": "GK",
        "name": "General Knowledge",
        "order_index": 1
      }
    ]
  }'
```

### Audit Log Example

```bash
curl http://localhost:3100/api/v1/admin/opencloud/audit-logs \
  -H "X-OpenCloud-Api-Key: replace-with-your-opencloud-key"
```

### When Agents Should Use OpenCloud Instead of the Browser

Prefer OpenCloud when:

- importing many subjects/topics/lessons/questions
- syncing content from another system
- running recurring update jobs
- you need deterministic audit logs
- you want idempotent retries

Prefer the admin UI when:

- reviewing small edits visually
- inspecting a specific user or content item
- making one-off announcement or moderation changes
- validating how the content looks in the app

---

## Architecture

### Project Structure

```
olli-academy-ssc-gd/
├── apps/
│   ├── api/                    # FastAPI Backend
│   │   ├── internal/            # Application code
│   │   │   ├── admin/           # Admin module
│   │   │   ├── ai/              # AI assistant module
│   │   │   ├── analytics/       # Analytics module
│   │   │   ├── auth/            # Authentication module
│   │   │   ├── community/       # Community module
│   │   │   ├── documents/       # Document management
│   │   │   ├── gamification/    # Gamification module
│   │   │   ├── notifications/   # Push notifications
│   │   │   ├── physical/        # Physical training
│   │   │   ├── pyqs/            # Previous year questions
│   │   │   ├── questions/       # Question bank
│   │   │   ├── referral/        # Referral system
│   │   │   ├── storage/         # File storage utilities
│   │   │   ├── study_plans/     # Study plan module
│   │   │   ├── syllabus/        # Syllabus module
│   │   │   ├── tests/           # Test module
│   │   │   ├── users/           # User management
│   │   │   ├── config.py        # Configuration
│   │   │   ├── database.py      # Database connection
│   │   │   ├── main.py          # Application entry point
│   │   │   └── redis.py         # Redis connection
│   │   ├── tests/              # Test files
│   │   ├── requirements.txt     # Python dependencies
│   │   └── Dockerfile          # Docker build file
│   │
│   └── web/                    # Next.js Frontend
│       ├── src/
│       │   ├── app/            # Next.js App Router
│       │   ├── components/     # React components
│       │   ├── hooks/          # Custom React hooks
│       │   ├── lib/            # Utilities and helpers
│       │   ├── providers/      # Context providers
│       │   └── types/          # TypeScript types
│       ├── public/             # Static assets
│       ├── package.json        # Node dependencies
│       └── Dockerfile          # Docker build file
│
├── docker-compose.yml          # Docker orchestration
├── package.json               # Workspace root
└── README.md                   # This file
```

### Domain Model

```
User
├── Authentication (JWT-based)
├── Profile
├── Study Plans
├── Test Attempts
├── Gamification Profile (XP, badges, streaks)
├── Notifications
└── Referrals

Content
├── Syllabus (organized by subject/topic)
├── Questions (MCQs with answers/explanations)
├── PYQs (Previous Year Questions)
├── Tests (topic-wise and full-length)
├── Documents
└── Physical Training Resources

Community
├── Posts
├── Comments
└── Reports
```

### API Design

The API follows RESTful conventions with versioning (`/api/v1/`).

#### Authentication Endpoints
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/refresh` - Refresh access token
- `GET /api/v1/auth/me` - Get current user

#### Core Module Endpoints
- `/api/v1/users` - User management
- `/api/v1/syllabus` - Syllabus content
- `/api/v1/tests` - Practice tests
- `/api/v1/pyqs` - Previous year questions
- `/api/v1/analytics` - Performance analytics
- `/api/v1/study-plans` - Study plan management
- `/api/v1/notifications` - Push notifications
- `/api/v1/community` - Community posts
- `/api/v1/physical` - Physical training
- `/api/v1/documents` - Document management
- `/api/v1/gamification` - Gamification features
- `/api/v1/ai` - AI assistant
- `/api/v1/referral` - Referral system
- `/api/v1/admin` - Admin operations
- `/api/v1/admin/opencloud` - Agent-friendly admin automation endpoints

#### OpenCloud Admin Automation

The backend now exposes a machine-friendly admin ingestion surface for agent-driven content ops.

- `GET /api/v1/admin/opencloud/capabilities` - discover supported auth modes and resources
- `POST /api/v1/admin/opencloud/content/sync` - bulk upsert `subjects`, `topics`, `lessons`, `questions`, and `test_series`

Authentication options:

1. Admin bearer token via the normal admin auth flow
2. `X-OpenCloud-Api-Key` header when `OPENCLOUD_ADMIN_API_KEY` is configured

The sync endpoint is idempotent on natural content keys, so OpenCloud can safely retry imports without duplicating content.

#### API Response Format

```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful"
}
```

#### Error Response Format

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message"
  }
}
```

---

## API Documentation

### Interactive API Docs

When `DEBUG=true`, access the interactive API documentation on the API server:

- **Swagger UI**: http://localhost:3100/docs
- **ReDoc**: http://localhost:3100/redoc

### Authentication

The API uses JWT-based authentication:

1. **Access Token**: Short-lived (15 minutes), sent in `Authorization: Bearer <token>` header
2. **Refresh Token**: Longer-lived (7 days), stored in HTTP-only cookie

### Rate Limiting

API endpoints are rate-limited to prevent abuse:
- Auth endpoints: 5 requests/minute per IP
- General endpoints: 100 requests/minute per user

### Health Check

```bash
curl http://localhost:3100/health
```

---

## Development Guide

### Local Development Setup

#### Using Docker (Recommended)

```bash
# Start only the database and cache services
docker compose up -d postgres redis minio

# Install frontend dependencies
npm install

# Run frontend in development mode
npm run dev:web
```

#### Manual Setup (Backend)

```bash
cd apps/api

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run development server
uvicorn internal.main:app --reload --host 0.0.0.0 --port 3100
```

#### Manual Setup (Frontend)

```bash
cd apps/web

# Install dependencies
npm install

# Run development server
npm run dev
```

### Running Tests

#### Backend Tests

```bash
cd apps/api
python -m pytest tests/ -v
```

#### Frontend Tests

```bash
npm run test:web
```

#### Type Checking

```bash
# Frontend
npm run typecheck

# Backend
cd apps/api && python -m py_compile internal/
```

### Code Style

#### Python (Backend)

- Follow PEP 8
- Use type hints
- Maximum line length: 120 characters
- Use async/await for I/O operations

#### TypeScript/JavaScript (Frontend)

- Follow ESLint configuration
- Use functional components with hooks
- Prefer `const` over `let`
- Use named exports over default exports

### Database Migrations

```bash
cd apps/api

# Create a new migration (using Alembic if configured)
alembic revision --autogenerate -m "description"

# Apply migrations
alembic upgrade head
```

---

## Deployment

### Docker Deployment

#### Production Build

```bash
# Build production images
docker compose -f docker-compose.yml build

# Run in production mode
docker compose up -d
```

#### Environment Variables for Production

| Variable | Description | Required |
|----------|-------------|----------|
| `JWT_SECRET_KEY` | Secret key for JWT signing | ✅ Yes |
| `DB_PASSWORD` | PostgreSQL password | ✅ Yes |
| `DEBUG` | Enable debug mode | ❌ No |
| `LOG_LEVEL` | Logging level | ❌ No |

### Docker Services

| Service | Port | Description |
|---------|------|-------------|
| `nginx` | 3100 | Reverse proxy and load balancer |
| `api` | 3101 | FastAPI backend (internal) |
| `web` | 3102 | Next.js frontend (internal) |
| `postgres` | 5432 | PostgreSQL database |
| `redis` | 6379 | Redis cache |
| `minio` | 9000/9001 | S3-compatible storage |

### Resource Limits

Each service has configured resource limits:

| Service | CPU Limit | Memory Limit |
|---------|-----------|--------------|
| nginx | 0.5 core | 256MB |
| postgres | 1 core | 512MB |
| redis | 0.5 core | 256MB |
| minio | 1 core | 512MB |
| api | 1 core | 512MB |
| web | 1 core | 512MB |

### Health Checks

All services implement health checks:
- nginx: `wget --no-verbose --tries=1 --spider http://127.0.0.1/health`
- postgres: `pg_isready`
- redis: `redis-cli ping`
- minio: `mc ready local`
- api: `curl -f http://127.0.0.1:3100/health`
- web: `wget --no-verbose --tries=1 --spider http://127.0.0.1:3101/`

### Monitoring

#### Logs

Logs are stored in JSON format with rotation:

```bash
# View logs for a specific service
docker compose logs -f api

# View recent logs
docker compose logs --tail=100 api
```

#### Metrics

For production monitoring, consider integrating:
- Prometheus for metrics collection
- Grafana for visualization
- ELK stack for log aggregation

---

## Contributing

### Getting Started

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Coding Standards

- Write meaningful commit messages
- Add tests for new functionality
- Update documentation as needed
- Ensure all tests pass before submitting PR

### Branching Strategy

- `main` - Production-ready code
- `develop` - Integration branch
- `feature/*` - New features
- `fix/*` - Bug fixes
- `refactor/*` - Code refactoring

### Reporting Issues

When reporting issues, please include:
- Clear description of the problem
- Steps to reproduce
- Expected vs actual behavior
- Environment details
- Relevant logs or screenshots

---

## License

This project is proprietary software. All rights reserved.

---

## Support

For support and questions:
- Open an issue on GitHub
- Contact the development team

## Acknowledgments

Built with ❤️ for SSC GD aspirants.
