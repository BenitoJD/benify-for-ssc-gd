---
name: backend-worker
description: Backend API development with FastAPI, Python, PostgreSQL, Redis
---

# Backend Worker

NOTE: Startup and cleanup are handled by `worker-base`. This skill defines the WORK PROCEDURE.

## When to Use This Skill

Features that involve:
- FastAPI endpoint development
- Database models and migrations
- Business logic in service layers
- Authentication/authorization
- API integrations
- Background tasks

## Required Skills

- **agent-browser**: For testing UI-integrated flows (only when frontend components exist)
- **tuistory**: Not needed for pure backend work

## Work Procedure

1. **Read and understand the feature**
   - Read the feature description in features.json
   - Read the relevant validation assertions in validation-contract.md
   - Check existing code patterns in the codebase before implementing

2. **Write tests first (TDD)**
   - Create test file in `apps/api/tests/`
   - Write failing tests for the expected behavior (red phase)
   - Use pytest with async support via `pytest-asyncio`
   - Cover: happy path, validation errors, authentication failures, edge cases

3. **Implement the feature**
   - Create/update models in `apps/api/internal/{domain}/models.py`
   - Create/update schemas in `apps/api/internal/{domain}/schemas.py`
   - Create/update repository in `apps/api/internal/{domain}/repository.py`
   - Create/update service in `apps/api/internal/{domain}/service.py`
   - Create/update routes in `apps/api/internal/{domain}/router.py`
   - Register router in `apps/api/internal/main.py`

4. **Verify implementation**
   - Run `pytest` and ensure all tests pass (green phase)
   - Run `python -m py_compile` on modified files
   - Test API endpoint manually with curl:
     ```bash
     curl -X POST http://localhost:3100/api/v1/auth/register \
       -H "Content-Type: application/json" \
       -d '{"email":"test@example.com","password":"Test1234"}'
     ```
   - Verify response structure matches Pydantic schema

5. **Run linters/type checkers**
   - Run `cd apps/api && python -m pytest` for test suite
   - Ensure no syntax errors or import issues

6. **Document findings**
   - Update `.factory/library/` files if new patterns discovered
   - Note any environment issues in handoff

## Example Handoff

```json
{
  "salientSummary": "Implemented POST /api/v1/auth/register with email/password validation, hashed passwords, and JWT token generation. Tests pass (8/8). Endpoint verified with curl returning correct 200 response with access_token and refresh_token.",
  "whatWasImplemented": "Email/password registration endpoint with validation (email format, password min 8 chars 1 uppercase 1 number), bcrypt password hashing, JWT access/refresh token generation, user creation in PostgreSQL via SQLAlchemy async.",
  "whatWasLeftUndone": "",
  "verification": {
    "commandsRun": [
      {"command": "curl -X POST http://localhost:3100/api/v1/auth/register -H 'Content-Type: application/json' -d '{\"email\":\"test@example.com\",\"password\":\"Test1234\"}'", "exitCode": 0, "observation": "200 response with access_token and refresh_token cookies set"},
      {"command": "cd apps/api && python -m pytest tests/test_auth.py -v", "exitCode": 0, "observation": "8 tests passed"}
    ],
    "interactiveChecks": []
  },
  "tests": {
    "added": [
      {"file": "apps/api/tests/test_auth.py", "cases": [
        {"name": "test_register_valid_email_password", "verifies": "VAL-AUTH-001"},
        {"name": "test_register_invalid_email", "verifies": "VAL-AUTH-002"},
        {"name": "test_register_weak_password", "verifies": "VAL-AUTH-003"},
        {"name": "test_register_duplicate_email", "verifies": "VAL-AUTH-004"}
      ]}
    ]
  },
  "discoveredIssues": []
}
```

## When to Return to Orchestrator

- Feature depends on a database model that doesn't exist yet
- API contract differs from what's in features.json
- Security concern discovered during implementation
- Performance issue identified that requires architecture change
- Missing environment configuration prevents testing
