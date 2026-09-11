# Athlete and judge release — apply, rehearse, deploy

Prepared 2026-09-11. This package changes source code; it has not changed your live server or activated any real athlete accounts.

## What is included

- Athlete usernames, reviewed before activation; the default suggestion is first name + `.` + last name, lowercase without accents. Compound names can be corrected in the table and duplicates receive a suffix.
- Initial password option: normalized first name + `sf!` (for example, `María López` → `maria.lopez` / `mariasf!`). A custom temporary password is also available.
- Server-enforced mandatory password changes. Until completed, protected athlete/judge functionality is blocked. New personal passwords require 12–72 characters, at most 72 UTF-8 bytes, and must differ from the current password. Password changes/resets revoke older sessions.
- Public athlete profiles, private editing/photo upload, and the athlete's competition dashboard.
- Athlete check-in, assigned-judge attendance confirmation and admin manual check-in.
- Mobile judge workspace with filters, category-specific rep context, WOD standards link, review before submission, submitted/rejected/read-only states, and device drafts.
- Admin announcements: publish/hide for spectators, athletes or judges. Public and private audiences are enforced by the API.
- Existing public styling, heat assignments and scoring rules are preserved. Admin visual redesign is deferred.

## Apply locally (Windows PowerShell)

Extract this ZIP into `$HOME\Downloads\sivarfest-meeting-release`. It should contain both patch files alongside this guide.

Each patch contains ONE new feature commit, based on the latest main inspected for that repository. No old navbar, variation or heat-generation patch is bundled.

| Repository | Patch base |
|---|---|
| competition-portal-api | `10a8cf4cc502c210739611a998a4e450f646fe5e` |
| sivarfest-web | `8d333c33395470b4e3c7fc1d5e3ef16baf8e7e6d` |

Check that `git status --short --branch` shows only its `##` branch line before switching. If there are local modifications or an unfinished `git am`, resolve that first; do not discard them. Stop at any failed command.

Backend:

```powershell
cd D:\dev\competition-portal-api
git status --short --branch
git switch main
git pull --ff-only origin main
git switch -c feature/athlete-and-judge-experience
git am "$HOME\Downloads\sivarfest-meeting-release\competition-portal-api-athlete-judge.patch"
java -version
.\mvnw.cmd clean package
git status --short --branch
git log --oneline -2
```

Use JDK 21 for Maven. Expected feature subject: `feat: add athlete access, profiles and competition-day workflows`.

Frontend:

```powershell
cd D:\dev\sivarfest-web
git status --short --branch
git switch main
git pull --ff-only origin main
git switch -c feature/athlete-and-judge-experience
git am "$HOME\Downloads\sivarfest-meeting-release\sivarfest-web-athlete-judge.patch"
npm ci
npm run lint
npm run build
git status --short --branch
git log --oneline -2
```

Expected subject: `feat: add athlete profiles and mobile judge workspace`.

If a patch fails, stop and inspect `git am --show-current-patch=diff`. Do not automatically skip it: each file contains the actual feature commit.

Start the updated backend with your normal local development configuration, then `npm run dev` in the frontend. Ensure `NEXT_PUBLIC_API_URL` points at that updated local API rather than production. Keep your existing database/configuration; no reset or reseed is required.

## Rehearse before the meeting

Use a designated test athlete/account and a test event. Avoid entering fake scores into the real published WODs.

1. Admin → competition → Athletes → **Acceso de atletas**. Review the username and activate ONE test athlete. Existing heat/athlete IDs are retained.
2. In a private browser window, sign in as that athlete. The change-password screen must appear before the dashboard. Refresh or revisit login: it must still be required until saved.
3. Choose a new password. Check the dashboard's name, category, next heat, lane and El Salvador time. Confirm the old temporary password no longer works after logout.
4. Edit gym/country/bio, upload a JPG/PNG photo, and open the public profile. The public page should show those values. Height/weight appear only after the explicit visibility checkbox is selected. Email/phone/date of birth remain private.
5. Check-in opens according to **competition settings → minutes before heat**. For a test heat, either schedule it inside that window or explicitly set its status to `CHECK_IN_OPEN`. Confirm the athlete can check in and see the status. Judges/admin can confirm attendance manually. Scheduled/delayed heats close self-check-in at their scheduled start; update the schedule or explicitly reopen check-in after a delay.
6. Admin → Judges: create/assign the test judge to a heat position. Newly created/reset judge accounts must change their password. Existing judge passwords remain untouched unless explicitly reset.
7. On a phone, open `/es/judge`. Filter by event and heat, confirm the athlete and lane, open **Ver WOD y estándares**, then enter a result and tiebreak. **Revisar resultado** must show the athlete/lane/value before **Confirmar y enviar**.
8. Verify the score appears as submitted in admin. Judges cannot publish it; validate and publish using the existing admin score workflow. A validated/published/locked score is read-only for the judge. A rejected score shows the correction reason.
9. Type a test score without sending it, refresh the same tab and reopen the form. Its device draft should return. A failed send must retain the fields. Drafts require the same tab/browser storage and are cleared on logout; they are not an offline submission queue. A successful server confirmation is required.
10. Admin → **Avisos**: publish one public and one judge-only test notice. The judge-only message must not appear publicly or in an athlete account. Hide both test notices when finished.
11. Spot-check `/en/athlete`, `/en/athlete/profile`, `/en/judge`, `/en/change-password`, and public athlete/leaderboard links. Event content remains in the organizers' Spanish as configured.

After the one-account rehearsal, activate the remaining reviewed athletes. Repeating bulk activation skips already configured accounts. Use **Restablecer acceso** only for deliberate recovery; it invalidates that athlete's sessions and requires another password change. Confirm identity with the organizer before resetting a real athlete's account.

The predictable initial-password scheme carries the accepted first-login impersonation risk. Mandatory change cannot identify who used the initial password first.

## Push and merge both PRs

After local validation, run in each repository:

```powershell
git push -u origin feature/athlete-and-judge-experience
```

Open each PR against `main`, review and merge. Deploy the backend first, then the frontend. Source branches/PRs alone do not update the server.

## Server targets

| Component | Service | Directory / artifact |
|---|---|---|
| SIVARFEST API | `sivarfest-api` | Source `/opt/sivarfest/src/competition-portal-api`; JAR `/opt/sivarfest/releases/competition-portal-api.jar`; port 8081; Java 21 |
| SIVARFEST frontend | `sivarfest-web` | `/opt/sivarfest/src/sivarfest-web` |
| Athlete photos | API-managed files | `/opt/sivarfest/uploads/athlete-photos` by default |

The separate WodNSivar application and its service/JAR are not involved in this release.

## Deploy the API after merge

SSH into the existing server. Preserve your normal database backup before deployment. The existing Hibernate `update` setting adds three user-account columns, one athlete privacy column and the announcements table. Never change production to `create` or `create-drop`. This release does not recreate athletes, events, scores or heats.

Run this block as `wodnsivar`; it stops on errors:

```bash
bash <<'SIVARFEST_API_DEPLOY'
set -euo pipefail
cd /opt/sivarfest/src/competition-portal-api
if [ -n "$(git status --porcelain)" ]; then
  echo 'Source has local changes; resolve them before deploying.'
  exit 1
fi
git switch main
git pull --ff-only origin main
git rev-parse --short HEAD
export JAVA_HOME=/usr/lib/jvm/java-21-openjdk-amd64
export PATH="$JAVA_HOME/bin:$PATH"
bash mvnw -version
bash mvnw clean package
sudo install -d -o sivarfestapp -g www-data -m 0750 /opt/sivarfest/uploads/athlete-photos
sivarfest_backup="/opt/sivarfest/releases/competition-portal-api.jar.pre-meeting-$(date +%Y%m%d-%H%M%S)"
sudo cp -p /opt/sivarfest/releases/competition-portal-api.jar "$sivarfest_backup"
echo "API backup: $sivarfest_backup"
sudo cp target/competition-portal-api-0.0.1-SNAPSHOT.jar /opt/sivarfest/releases/competition-portal-api.jar.next
sudo chown --reference=/opt/sivarfest/releases/competition-portal-api.jar /opt/sivarfest/releases/competition-portal-api.jar.next
sudo chmod --reference=/opt/sivarfest/releases/competition-portal-api.jar /opt/sivarfest/releases/competition-portal-api.jar.next
sudo cmp target/competition-portal-api-0.0.1-SNAPSHOT.jar /opt/sivarfest/releases/competition-portal-api.jar.next
sudo systemctl stop sivarfest-api
sudo mv /opt/sivarfest/releases/competition-portal-api.jar.next /opt/sivarfest/releases/competition-portal-api.jar
sudo systemctl start sivarfest-api
curl --retry 10 --retry-delay 2 --retry-all-errors --connect-timeout 3 --max-time 5 -fsS -o /dev/null -w 'SIVARFEST API: %{http_code}\n' http://127.0.0.1:8081/api/public/competitions/sivarfest-2026/events
systemctl is-active sivarfest-api
sudo sha256sum target/competition-portal-api-0.0.1-SNAPSHOT.jar /opt/sivarfest/releases/competition-portal-api.jar
echo "API backup: $sivarfest_backup"
SIVARFEST_API_DEPLOY
```

Expected: API `200`, service `active`, matching hashes. On failure, stop before frontend deployment and inspect `sudo journalctl -u sivarfest-api -n 100 --no-pager`. The backup path is printed; older code must not be restored after account activation without preserving the new password-change enforcement.

## Deploy the frontend after merge

The following preserves the previous `.next` build and restarts it if installation/build fails. It uses the existing service users and does not touch the API or database.

```bash
bash <<'SIVARFEST_WEB_DEPLOY'
set -euo pipefail
cd /opt/sivarfest/src/sivarfest-web
if [ -n "$(git status --porcelain)" ]; then
  echo 'Source has local changes; resolve them before deploying.'
  exit 1
fi
git switch main
git pull --ff-only origin main
git rev-parse --short HEAD
sivarfest_web_backup="/opt/sivarfest/releases/web-next.pre-meeting-$(date +%Y%m%d-%H%M%S)"
sudo cp -a .next "$sivarfest_web_backup"
sudo systemctl stop sivarfest-web
sudo chown -R wodnsivar:www-data .next
if npm ci && npm run build; then
  sudo chown -R sivarfestapp:www-data .next
  sudo systemctl start sivarfest-web
else
  sudo mv .next ".next.failed-$(date +%Y%m%d-%H%M%S)"
  sudo cp -a "$sivarfest_web_backup" .next
  sudo systemctl start sivarfest-web
  echo 'Build failed; previous frontend build restored. Stop here.'
  exit 1
fi
curl --retry 10 --retry-delay 2 --retry-all-errors --connect-timeout 3 --max-time 5 -fsS -o /dev/null -w 'SIVARFEST web: %{http_code}\n' https://sivarfest.fit/es
systemctl is-active sivarfest-web
echo "Frontend backup: $sivarfest_web_backup"
SIVARFEST_WEB_DEPLOY
```

Confirm the new **Acceso de atletas** and **Avisos** links in admin. Repeat the one-account rehearsal on production before activating everyone. A `200` public homepage alone does not verify authenticated workflows.

## Evidence and remaining scope

Backend: 23 tests passing, including 8 new integration scenarios. Frontend: lint and production build/type checks passing. Patches are checked against their exact main bases. Physical phone/browser interaction testing is a manual rehearsal, not an automated validation claim.

Still deferred: admin visual redesign; automated emails and email recovery (real verified emails/provider needed); browser push/offline score submission; sponsor/gallery CMS, registrations/payments and generalized SaaS work. Existing public sponsor content and all established public views remain intact.
