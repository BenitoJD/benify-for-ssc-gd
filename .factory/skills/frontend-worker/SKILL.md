---
name: frontend-worker
description: Frontend development with Next.js 14, React, TypeScript, Tailwind CSS
---

# Frontend Worker

NOTE: Startup and cleanup are handled by `worker-base`. This skill defines the WORK PROCEDURE.

## When to Use This Skill

Features that involve:
- Next.js 14 App Router pages and layouts
- React components
- UI/UX implementation
- Client-side state management
- API integration (frontend side)
- Styling with Tailwind CSS
- i18n implementation

## Required Skills

- **agent-browser**: Required for all UI validation. Use after implementing components to verify rendering and interactions.

## Work Procedure

1. **Read and understand the feature**
   - Read the feature description in features.json
   - Read the relevant validation assertions in validation-contract.md
   - Check existing component patterns in the codebase

2. **Write tests first (TDD)**
   - Create component test file in `apps/web/src/__tests__/`
   - Write failing tests for expected rendering/interactions (red phase)
   - Use Jest with React Testing Library
   - Cover: rendering, user interactions, error states, loading states

3. **Implement the feature**
   - Create page component in `apps/web/src/app/{feature}/`
   - Create reusable components in `apps/web/src/components/`
   - Use Server Components by default, Client Components where interactivity needed
   - Implement responsive design (mobile-first)
   - Use Tailwind CSS utility classes
   - Apply i18n keys for all user-facing text (no hardcoded strings)
   - Integrate with API via fetch or React Query

4. **Verify implementation**
   - Run `npm run typecheck` and fix any TypeScript errors
   - Run `npm run lint` and fix any lint errors
   - Run `npm run test` and ensure all tests pass (green phase)
   - Open in browser via `agent-browser` and verify:
     - Page renders without errors
     - All interactive elements work
     - Mobile viewport (375px) displays correctly
     - No console errors
   - Test the full user flow:
     ```bash
     # Navigate to page
     # Interact with UI elements
     # Verify state changes correctly
     ```

5. **Run linters and build verification**
   - `npm run build` to verify production build succeeds
   - Check for bundle size warnings

6. **Document findings**
   - Update `.factory/library/` files if new patterns discovered
   - Note any component patterns that should be reusable

## Example Handoff

```json
{
  "salientSummary": "Built landing page with hero section, feature cards, pricing preview, and FAQ accordion. Verified with agent-browser on desktop and mobile viewports. Lighthouse score: Performance 92, Accessibility 95.",
  "whatWasImplemented": "Created landing page at apps/web/src/app/page.tsx with hero section with CTA button, feature highlights grid (4 cards), pricing section (4 plan cards with toggle), FAQ accordion component with 6 questions, footer with links.",
  "whatWasLeftUndone": "",
  "verification": {
    "commandsRun": [
      {"command": "cd apps/web && npm run typecheck", "exitCode": 0, "observation": "No TypeScript errors"},
      {"command": "cd apps/web && npm run lint", "exitCode": 0, "observation": "No lint errors"},
      {"command": "cd apps/web && npm run test", "exitCode": 0, "observation": "12 tests passed"}
    ],
    "interactiveChecks": [
      {"action": "Open landing page, verify hero headline visible", "observed": "Headline 'Complete SSC GD Preparation' visible above fold"},
      {"action": "Click 'Get Started' CTA, verify navigation to /signup", "observed": "Redirected to /signup page"},
      {"action": "Click FAQ item, verify expands", "observed": "Answer revealed with smooth animation"},
      {"action": "Resize to 375px viewport, verify no horizontal scroll", "observed": "Page renders without horizontal scroll"}
    ]
  },
  "tests": {
    "added": [
      {"file": "apps/web/src/__tests__/landing.test.tsx", "cases": [
        {"name": "renders hero section", "verifies": "VAL-LANDING-001"},
        {"name": "CTA navigates to signup", "verifies": "VAL-LANDING-002"},
        {"name": "FAQ accordion expands", "verifies": "VAL-LANDING-006"}
      ]}
    ]
  },
  "discoveredIssues": []
}
```

## When to Return to Orchestrator

- API endpoint the feature depends on doesn't exist yet
- Design specification conflicts with existing patterns
- Performance issues identified that require backend optimization
- Missing environment variables prevent API calls
- Internationalization (i18n) keys unavailable for required text
