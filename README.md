# Benify

Initial monorepo scaffold for an ed-tech platform focused on government job preparation.

This first slice sets up:

- `apps/web`: React + Vite frontend
- `apps/api`: Go HTTP API
- `docker-compose.yml`: local orchestration for both services
- Google sign-in with server-side ID token verification and an HTTP-only session cookie

## Structure

```text
apps/
  api/   Go API, Google auth verification, cookie session
  web/   React app with Google sign-in button
```

## Google auth flow

1. The React app loads Google Identity Services in the browser.
2. Google returns an ID token credential after sign-in.
3. The frontend posts that credential to `POST /api/v1/auth/google`.
4. The Go API verifies the Google ID token against your Google client ID.
5. The API signs its own session cookie and stores it as `HttpOnly`.
6. The frontend restores the session with `GET /api/v1/auth/me`.

This is a clean starting point for authentication. It does not yet include a user database, refresh tokens, RBAC, or protected domain models.

## Environment

Copy `.env.example` to `.env` and replace the placeholders:

```bash
cp .env.example .env
```

Required values:

- `GOOGLE_CLIENT_ID`
- `SESSION_SECRET`
- `VITE_GOOGLE_CLIENT_ID`

Use the same Google client ID in both backend and frontend env vars.

## Google Cloud Console setup

1. Create or reuse a Google Cloud project.
2. Configure the OAuth consent screen.
3. Create an OAuth 2.0 Client ID for a Web application.
4. Add these JavaScript origins for local development:
   - `http://localhost:5173`
5. Use the generated client ID in:
   - `GOOGLE_CLIENT_ID`
   - `VITE_GOOGLE_CLIENT_ID`

## Local development

Install frontend dependencies once:

```bash
npm install
```

Run the stack in Docker:

```bash
docker compose up --build
```

The services will be available at:

- Web: `http://localhost:5173`
- API: `http://localhost:8080`

## Useful commands

```bash
npm run test:web
npm run lint:web
npm run build:web
npm run test:api
```

## Verified in this setup

- Frontend unit test pass
- Frontend lint pass
- Frontend production build pass
- Go API tests pass in Docker
- `docker compose build` passes for both services

## Next steps

- add persistent users and profiles
- add route protection and role-based authorization
- add PostgreSQL and migrations
- extend the monorepo with shared contracts and Docker dev overrides
