# User Testing

## Validation Surface

### Primary Surface: Web Browser (agent-browser)

All user-facing functionality is tested via `agent-browser` (Playwright-based browser automation).

### Setup Required

1. Start dev servers:
   ```bash
   docker compose up -d postgres redis minio
   cd apps/api && uvicorn internal.main:app --reload --port 3100
   cd apps/web && npm run dev
   ```

2. Seed database with test data:
   ```bash
   cd apps/api && python -m scripts.seed
   ```

### Key User Flows to Test

#### Student Flow
1. Visit `/` (landing page)
2. Click "Get Started" → `/signup`
3. Register new account
4. Complete onboarding (language, target year, level assessment, study hours)
5. Land on `/dashboard`
6. Navigate to `/study/syllabus` → view subjects
7. Click subject → view topics → click topic → view lessons
8. Click lesson → mark complete
9. Navigate to `/tests` → select test → take test
10. View results → view analytics
11. Navigate to `/physical` → view training plans
12. Navigate to `/documents` → view checklist

#### Admin Flow
1. Visit `/admin/login`
2. Login with admin credentials
3. View `/admin/dashboard`
4. Navigate to `/admin/users` → search users
5. Navigate to `/admin/content` → view content management

### Validation Commands

```bash
# Start dev servers first, then run:
agent-browser open http://localhost:3101
# or use inline with steps

agent-browser screenshot  # Full page screenshot
agent-browser click "Get Started"
agent-browser type "#email" "test@example.com"
agent-browser wait-for-url "**/dashboard"
```

## Resource Cost Classification

### agent-browser (lightweight)
- App: Next.js 14 with static optimization, ~200MB RAM
- Agent: Playwright browser, ~300MB RAM
- **Max concurrent: 5** (well within headroom on typical machines)

### tuistory (not applicable)
- Not used for this project (no TUI components)

## Evidence Requirements

For each validation assertion, collect:
- Screenshot of the feature in question
- Console errors (none expected)
- Network requests for API calls (when applicable)
- Database state changes (when applicable)

## Known Constraints

- Low-end Android target: optimize for 1GB RAM, 3G connections
- Mock payments only: no real Razorpay/Stripe integration
- Bilingual: test in both EN and HI modes
