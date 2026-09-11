# SIVARFEST Web — implementation status

Reviewed: 2026-09-11. Source implementation; production rollout pending for the athlete/judge slice.

| Area | Status |
|---|---|
| Landing, athletes, events, heats and leaderboards | Established SIVARFEST design preserved. Category WOD variants and category-isolated heat generation are already integrated. |
| `/[locale]/athletes/[athleteId]` | Public athlete profile with photo/default portrait, optional details, privacy-aware body metrics and published results. Roster and leaderboard names link here. |
| `/[locale]/athlete` | Private dashboard with next heat/lane, check-in window/action, complete own schedule, published standings/results and profile links. |
| `/[locale]/athlete/profile` | Own country/gym/bio/height/weight, visibility toggle and JPG/PNG photo upload/removal. |
| `/[locale]/change-password` | Mandatory onboarding and voluntary password changes. API also enforces the requirement. |
| `/[locale]/login` | Username or email; role-aware routing, including already signed-in users. |
| `/[locale]/judge` | Branded mobile workspace, event/heat/status/search filters, attendance confirmation, effective category reps, WOD/standards link, review before submit and visible status/errors. |
| Judge device drafts | Session-storage drafts survive refresh/filter changes in the same tab. Cleared on successful submission/logout. Not an offline submission queue. |
| Admin athlete access | Preview/edit proposed usernames, activate selected accounts, export usernames without passwords, explicit recovery/reset. |
| Announcements | Admin publish/hide. Public notices on events/heats; athlete/judge notices in the corresponding private dashboard. |
| Admin appearance | Existing functional design retained as requested. |
| Sponsors | Existing responsive sponsor assets/Instagram links retained. |

## Validation

Frontend ESLint and production build/type checking pass. Backend has 23 passing tests, including authentication and data-isolation integration tests. Physical-device rehearsal remains required before the judges' meeting; no claim of production deployment or device verification is made by this source checkpoint.

## Deferred scope

- Admin visual redesign.
- Automated email reminders and email-based recovery: real verified contact emails/provider are not available. Admin reset is implemented.
- Browser push and offline score submission; a saved device draft still requires a successful server submission.
- Sponsor/media/gallery CMS, registration/payments and generalized SaaS onboarding are later-phase work. Current public sponsors remain complete.
- Public multi-competition/history routing, generated shared DTO contracts and broad UI automation remain future work.

See `meeting-release.md` for local installation, deployment service mapping, account activation and the meeting rehearsal.
