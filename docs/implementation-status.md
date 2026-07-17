# SIVARFEST Web — Implementation Status

Last reviewed: 2026-07-16

## Status legend

- **Implemented**: route and API integration exist.
- **Partial**: supporting API/type/component exists, but the complete user workflow does not.
- **Missing**: no usable frontend workflow exists yet.

## Route status

| Route/area | Status | Notes |
|---|---|---|
| `/` | Implemented | Loads competition, categories, athletes, and events concurrently. |
| `/athletes` | Implemented | Public cards with category, bib, country, gym, and bio. |
| `/events` | Implemented | Public workouts, score type, time cap, instructions, and standards. |
| `/login` | Implemented | Admin login works; athlete destination is reserved for future use. |
| `/admin` | Implemented | Protected dashboard with competition count. |
| `/admin/competitions` | Implemented | List and archive competitions. |
| `/admin/competitions/new` | Implemented | Competition creation form. |
| `/admin/competitions/[id]/settings` | Implemented | Competition editing form. |
| Admin category management | Missing | Sidebar link exists, but route is not implemented. |
| Admin athlete management | Missing | Sidebar link exists, but route is not implemented. |
| Admin event management | Missing | Sidebar link exists, but route is not implemented. |
| Public heats | Missing | Backend is also not implemented. |
| Public leaderboards | Missing | Backend is also not implemented. |
| Athlete dashboard | Missing | Login redirect is reserved, but `/athlete` does not exist. |
| Announcements/sponsors/media | Missing | Backend modules are currently scaffolds. |

## Current API integrations

Public:

- Competition by configured slug
- Categories by configured slug
- Athletes by configured slug
- Events by configured slug

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
2. The admin sidebar hardcodes competition ID `1` for settings, category, athlete, and event links.
3. Several sidebar links point to routes that do not exist.
4. Public API failures currently cause server-component rendering errors rather than friendly fallback pages.
5. There is no competition selector for administrators.
6. Frontend/backend TypeScript and Java DTO shapes are maintained manually.
7. No automated frontend tests are present.
8. Mobile event-day workflows have not been implemented.

## Next milestone: admin categories

Target route:

```text
/admin/competitions/[competitionId]/categories
```

Required behavior:

- Load all categories for the selected competition.
- Create a category.
- Edit an existing category.
- Delete or deactivate a category with confirmation.
- Manage name, gender classification, division label, description, display order, and active state.
- Show loading, empty, validation, and API-error states.
- Revalidate the admin page and public category data after mutation.

## Recommended follow-up

1. Replace hardcoded sidebar competition links with selected/current competition state.
2. Reuse the category-management structure for athletes.
3. Reuse the same structure for events.
4. Add error boundaries and friendly API-unavailable states.
5. Add unit/component tests and a minimal end-to-end admin smoke test.
6. Add dynamic public competition routes when historical competitions need public access.