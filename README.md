# SIVARFEST Web

Next.js frontend for the SIVARFEST functional-fitness competition portal. It provides public competition information and the first administration workflows while consuming the separate Spring Boot REST API.

## Current scope

Implemented:

- Public SIVARFEST homepage
- Public athlete listing
- Public event/workout listing
- Category and athlete summary data
- Admin login and logout
- Server-side admin route protection
- Admin dashboard
- Competition list, creation, editing, and archival

Planned but not implemented yet:

- Admin category management
- Admin athlete management
- Admin event management
- Heat schedule and heat administration
- Score entry and leaderboards
- Athlete dashboard and check-in
- Announcements, sponsors, and gallery management
- Online registration and payment experience (Phase 2)

See [docs/implementation-status.md](docs/implementation-status.md) for the detailed status.

## Technology

- Next.js 16 App Router
- React 19
- TypeScript
- Tailwind CSS 4
- Axios
- React Hook Form and Zod
- TanStack Query
- shadcn/Radix-style UI components

## Related backend

The API is maintained separately in [`competition-portal-api`](https://github.com/V4LERIAN0/competition-portal-api).

Development topology:

```text
Next.js frontend  http://localhost:3000
Spring Boot API   http://localhost:8081/api
```

## Local setup

### Requirements

- A current Node.js LTS release
- npm
- The backend running on port 8081

### Environment

Create `.env.local` in the repository root:

```env
NEXT_PUBLIC_API_URL=http://localhost:8081/api
NEXT_PUBLIC_COMPETITION_SLUG=sivarfest-2026
```

Environment files are intentionally ignored by Git.

### Install and run

```powershell
npm install
npm run dev
```

Open `http://localhost:3000`.

If Turbopack cannot create its local persistence database on Windows, first repair the affected folder permissions. Webpack can be used temporarily for diagnosis:

```powershell
npm run dev -- --webpack
```

## Current routes

Public:

```text
/
/athletes
/events
/login
```

Admin:

```text
/admin
/admin/competitions
/admin/competitions/new
/admin/competitions/[competitionId]/settings
```

The sidebar currently contains links for category, athlete, and event administration, but those destination pages have not been built yet.

## Competition selection

The public site currently displays one configured competition:

```env
NEXT_PUBLIC_COMPETITION_SLUG=sivarfest-2026
```

The backend supports multiple competitions. Future frontend routing can expose historical or alternate events through routes such as:

```text
/competitions/[slug]
```

The root route can continue to display the currently promoted SIVARFEST edition.

## Authentication

Login requests are sent to the Spring Boot API. The API sets an HTTP-only JWT cookie. Protected server components forward incoming cookies to the backend and redirect unauthorized users to `/login`.

## Security notes

- Never commit `.env.local` or production environment values.
- Do not place secrets in `NEXT_PUBLIC_*` variables; they are exposed to browser code.
- Development credentials must not be retained for production.
- Do not render private athlete contact or payment information publicly.

## Next milestone

The next feature is complete admin category management. It will establish the reusable admin CRUD pattern for athlete and event management.
