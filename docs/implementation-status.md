# SIVARFEST Web — Implementation Status

Last reviewed: 2026-09-02

## Status legend

- **Implemented**: route and API integration exist.
- **Partial**: supporting API/type/component exists, but the complete user workflow does not.
- **Missing**: no usable frontend workflow exists yet.

## Route status

| Route/area | Status | Notes |
|---|---|---|
| `/[locale]` | Implemented | SIVARFEST landing experience with event branding, expandable category roster, events, venue, Instagram, and sponsors. |
| `/[locale]/athletes` | Implemented | Full official roster grouped by SC/RX and gender with graceful missing-profile data. |
| `/[locale]/events` | Implemented | Branded public workouts, score type, time cap, instructions, standards, and event-result links. |
| `/[locale]/heats` | Implemented | Branded public schedule with heat times, category assignments, lanes, and live statuses. |
| `/[locale]/leaderboard` | Implemented | Public overall leaderboard by category. |
| `/[locale]/login` | Implemented | Production-safe admin/judge login presentation; athlete destination remains reserved for future use. |
| `/admin` | Implemented | Protected dashboard with competition count. |
| `/admin/competitions` | Implemented | List and archive competitions. |
| `/admin/competitions/new` | Implemented | Competition creation form. |
| `/admin/competitions/[id]/settings` | Implemented | Competition editing form. |
| Admin category management | Implemented | Create/edit/list category workflow. |
| Admin athlete management | Implemented | Create/edit/list athlete workflow. |
| Admin event management | Implemented | Create/edit/list events, heats, and score management workflow. |
| Public heats | Implemented | API-driven public event-day schedule. |
| Public leaderboards | Implemented | Overall and event-specific routes. |
| Athlete dashboard | Missing | Login redirect is reserved, but `/athlete` does not exist. |
| Sponsors | Implemented | Responsive SIVARFEST sponsor grid with external Instagram links. |

## Current API integrations

Public:

- Competition by configured slug
- Categories by configured slug
- Athletes by configured slug
- Events by configured slug
- Heats by configured slug
- Overall and event leaderboards by configured slug

Admin:

- List competitions
- Get competition by ID
- Create competition
- Update competition
- Archive competition

Authentication:

- Login
- Logout
- Current user

## Known limitations

1. The public competition slug is selected through an environment variable rather than the URL.
2. Public athlete profiles and a private athlete dashboard are not implemented.
3. Athlete credential activation/recovery is not ready for public rollout.
4. Some public API failures still need friendlier route-level fallback handling.
5. Frontend/backend TypeScript and Java DTO shapes are maintained manually.
6. Automated frontend coverage is currently limited to lint, type/build, and deployment smoke checks.
7. Admin/judge pages still need the established SIVARFEST visual system and deeper mobile event-day refinement.

## Current SIVARFEST product context

- The frontend intentionally treats SIVARFEST as the implicit active competition.
- Generic multi-competition backend capability is preserved, but the public and day-to-day frontend should not feel like a generic SaaS portal.
- The dark foundation, condensed white display type, orange/yellow accent, square card language, and mobile-first competition UI are the established visual conventions for remaining pages.
- The landing roster shows 10 athletes per scoring category initially and expands the complete category in place; the dedicated roster remains available from navigation.

## Recommended follow-up

1. Verify the refreshed public events, heats, roster, and login pages on production/mobile.
2. Add public athlete profiles and secure athlete profile completion.
3. Build the private mobile athlete dashboard around next heat, lane, and start time.
4. Apply the SIVARFEST system to judge and highest-value admin workflows.
5. Add route-level error boundaries and automated public-flow smoke coverage.
6. Add dynamic public competition routes only when historical/multi-tenant SaaS use requires them.
