# Architecture

## System Overview

The SSC GD EdTech Platform is a modular monolith SaaS application with a clear separation between frontend and backend.

```
┌─────────────────────────────────────────────────────────┐
│                    Next.js 14 Frontend                   │
│               (Port 3101, App Router)                   │
│  ┌─────────────┐ ┌──────────────┐ ┌─────────────────┐  │
│  │  Public     │ │  Student     │ │   Admin         │  │
│  │  (Landing,  │ │  (Dashboard, │ │   (User Mgmt,   │  │
│  │   Login,    │ │   Study,     │ │    Content,     │  │
│  │   Signup)   │ │   Tests)     │ │    Analytics)   │  │
│  └─────────────┘ └──────────────┘ └─────────────────┘  │
└────────────────────────┬────────────────────────────────┘
                         │ HTTP/REST (JSON)
┌────────────────────────▼────────────────────────────────┐
│                  FastAPI Backend (Port 3100)              │
│  ┌──────────────────────────────────────────────────┐   │
│  │                  API Routes                       │   │
│  │  /api/v1/auth, /api/v1/users, /api/v1/content   │   │
│  │  /api/v1/tests, /api/v1/analytics, /api/v1/ai   │   │
│  └──────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────┐   │
│  │               Service Layer                        │   │
│  │  AuthService, UserService, ContentService...     │   │
│  └──────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────┐   │
│  │              Repository Layer                      │   │
│  │  UserRepository, ContentRepository...            │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
          │                                    │
          ▼                                    ▼
┌─────────────────┐              ┌─────────────────┐
│   PostgreSQL    │              │      Redis      │
│   (Port 5432)   │              │   (Port 6379)  │
│                 │              │                 │
│  Users, Plans,  │              │  Sessions,      │
│  Content,      │              │  Cache, Rate    │
│  Tests, etc.   │              │  Limiting       │
└─────────────────┘              └─────────────────┘
          │
          ▼
┌─────────────────┐
│     MinIO       │
│   (Port 3102)   │
│                 │
│  File storage   │
│  (PDFs, media)  │
└─────────────────┘
```

## Frontend Architecture (Next.js 14)

### Directory Structure
```
apps/web/
├── src/
│   ├── app/                    # App Router pages
│   │   ├── (public)/          # Public routes (landing, login, signup)
│   │   │   ├── page.tsx       # Landing page
│   │   │   ├── login/
│   │   │   ├── signup/
│   │   │   └── pricing/
│   │   ├── (student)/         # Authenticated student routes
│   │   │   ├── dashboard/
│   │   │   ├── study/
│   │   │   ├── tests/
│   │   │   ├── pyqs/
│   │   │   ├── analytics/
│   │   │   ├── physical/
│   │   │   ├── documents/
│   │   │   └── community/
│   │   └── (admin)/           # Admin routes
│   │       ├── users/
│   │       ├── content/
│   │       └── analytics/
│   ├── components/
│   │   ├── ui/                # Reusable UI (Button, Input, Card, etc.)
│   │   ├── features/          # Feature-specific components
│   │   └── layouts/           # Layout components
│   └── lib/
│       ├── api/               # API client functions
│       ├── auth/              # Auth context and utilities
│       ├── i18n/              # Internationalization
│       └── utils/             # General utilities
├── public/                    # Static assets
└── package.json
```

### Key Patterns
- **Server Components**: Default in App Router. Use for data fetching.
- **Client Components**: Add `'use client'` for interactivity (forms, buttons, etc.)
- **Route Groups**: `(public)`, `(student)`, `(admin)` group routes without affecting URL
- **Layouts**: Shared layouts per route group

## Backend Architecture (FastAPI)

### Directory Structure
```
apps/api/
├── internal/
│   ├── main.py                # FastAPI app entry point
│   ├── config.py              # Configuration
│   ├── database.py            # Database connection
│   ├── auth/                  # Authentication module
│   │   ├── router.py
│   │   ├── service.py
│   │   ├── schemas.py
│   │   └── dependencies.py
│   ├── users/                 # User management module
│   ├── content/               # Subjects, topics, lessons
│   ├── questions/             # Question bank
│   ├── tests/                 # Test series, attempts
│   ├── analytics/              # Performance analytics
│   ├── physical/              # Physical training
│   ├── documents/              # Document checklists
│   ├── subscriptions/          # Plans, payments
│   ├── notifications/          # Notification system
│   ├── community/              # Discussions
│   ├── gamification/           # Streaks, badges
│   ├── ai/                     # AI recommendations
│   ├── admin/                  # Admin panel APIs
│   └── shared/                 # Shared utilities
│       ├── middleware.py
│       ├── exceptions.py
│       └── pagination.py
├── tests/                     # Test files
├── migrations/                 # Alembic migrations
├── scripts/                   # Seed scripts
├── requirements.txt
└── pyproject.toml
```

### Key Patterns
- **Repository Pattern**: Database access abstracted in repository classes
- **Service Layer**: Business logic in service classes, called by routers
- **Pydantic Schemas**: Request/response validation with Pydantic models
- **Dependency Injection**: FastAPI dependencies for auth, db session, etc.
- **Middleware**: Logging, error handling, CORS

## API Design

### REST Conventions
- Base URL: `/api/v1/`
- Resources: `/api/v1/{resource}`
- Single resource: `/api/v1/{resource}/{id}`
- Actions: `/api/v1/{resource}/{id}/{action}`
- Examples:
  - `GET /api/v1/subjects` - List subjects
  - `GET /api/v1/subjects/1` - Get subject 1
  - `POST /api/v1/tests/1/start` - Start test 1
  - `PATCH /api/v1/lessons/1/complete` - Mark lesson 1 complete

### Response Format
```json
{
  "data": { ... },
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "pages": 5
  }
}
```

### Error Format
```json
{
  "detail": "Error message",
  "code": "ERROR_CODE"
}
```

## Authentication Flow

1. User registers/logs in → receives `access_token` (15min) and `refresh_token` (7 days) in httpOnly cookies
2. Frontend stores tokens in memory (not localStorage for security)
3. API requests include `access_token` in Authorization header
4. When `access_token` expires, frontend calls `/auth/refresh` to get new tokens
5. Refresh token rotation: each refresh issues a new refresh token, old one invalidated
6. Logout: both tokens invalidated server-side

## Feature Gating

Premium features are gated at two levels:

1. **Frontend**: Show upgrade CTA or paywall for free users
2. **Backend (REQUIRED)**: API returns 403 for premium endpoints when user has free plan

```python
# Example: Premium endpoint with gating
@router.get("/lessons/{id}")
async def get_lesson(
    lesson_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    lesson = await lesson_repository.get(db, lesson_id)
    if lesson.is_premium and current_user.plan != PlanType.PREMIUM:
        raise HTTPException(status_code=403, detail="Upgrade to premium")
    return lesson
```

## Data Model Overview

### Core Entities
- **User**: id, email, phone, password_hash, role, created_at
- **Profile**: user_id, first_name, last_name, language_preference, target_year, level
- **Subscription**: user_id, plan_id, status, started_at, expires_at
- **Plan**: id, name, price, features (JSON), is_active

### Content Entities
- **Subject**: id, name, code, icon_url
- **Topic**: id, subject_id, name, order_index, estimated_hours
- **Lesson**: id, topic_id, title, content, video_url, order_index, is_premium
- **Question**: id, topic_id, question_text, options (JSON), correct_answer, difficulty
- **TestSeries**: id, title, type, duration_minutes, total_questions, is_premium

### Activity Entities
- **LessonProgress**: user_id, lesson_id, completed_at
- **TestAttempt**: user_id, test_series_id, score, started_at, completed_at
- **Answer**: attempt_id, question_id, selected_option, is_correct, time_spent

### Gamification Entities
- **Streak**: user_id, current_streak, longest_streak, last_activity_date
- **Badge**: id, name, criteria (JSON)
- **UserBadge**: user_id, badge_id, earned_at

## Caching Strategy

Redis caching for:
- User sessions
- Frequently accessed content (subjects, topics)
- Test series metadata
- Analytics aggregates

Cache invalidation on content updates.
