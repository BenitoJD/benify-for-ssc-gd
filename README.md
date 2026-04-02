# OLLI Academy(SSC GD)

**OLLI Academy(SSC GD)** is a focused SSC GD preparation platform with practice flows, PYQs, onboarding, analytics, community discussion, physical training support, and document-readiness tools.

## 📋 Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Features](#features)
- [Quick Start](#quick-start)
- [Architecture](#architecture)
- [API Documentation](#api-documentation)
- [Development Guide](#development-guide)
- [Deployment](#deployment)
- [Contributing](#contributing)

---

## Overview

OLLI Academy(SSC GD) is a full-stack SSC GD preparation platform built to support the core student journey from signup to practice, progress tracking, fitness readiness, and community help. The platform offers:

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
git clone https://github.com/your-org/olli-academy-ssc-gd.git
cd olli-academy-ssc-gd
```

### Environment Configuration

Create a `.env` file in the project root with the following variables:

```bash
# Database
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=olli_academy_ssc_gd

# Redis
REDIS_URL=redis://localhost:6379/0

# MinIO (S3-compatible storage)
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_BUCKET=olli-academy-ssc-gd
MINIO_SECURE=false

# JWT Authentication (REQUIRED in production - generate a secure random string)
JWT_SECRET_KEY=your-super-secret-key-change-in-production

# Application
DEBUG=false
LOG_LEVEL=INFO

# URLs
NEXT_PUBLIC_API_URL=http://localhost:3100/api
NEXT_PUBLIC_APP_URL=http://localhost:3100
```

### Start with Docker Compose

```bash
# Start local development with hot reload
docker compose up --build

# Or run in detached mode
docker compose up --build -d
```

The repository includes a `docker-compose.override.yml` for local development, so source changes under `apps/web` and `apps/api` are bind-mounted into the containers:

- `web` runs `next dev` with hot reload
- `api` runs `uvicorn --reload`

For day-to-day development, you can usually use `docker compose up` after the first build.

### Access Points

| Service | URL |
|---------|-----|
| Web Application | http://localhost:3100 |
| API (through nginx) | http://localhost:3100/api |
| API (direct) | http://localhost:3101 |
| Web (direct container) | http://localhost:3102 |
| API Documentation | http://localhost:3101/docs |
| MinIO Console | http://localhost:9001 |

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

When `DEBUG=true`, access the interactive API documentation:

- **Swagger UI**: http://localhost:3101/docs
- **ReDoc**: http://localhost:3101/redoc

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
curl http://localhost:3101/health
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
