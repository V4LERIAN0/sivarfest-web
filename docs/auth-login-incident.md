# Login returns to the login page — incident and release guide

Prepared 2026-09-16. Inspected frontend base: `8793a5f`. Inspected backend base: `945adcb`.

## Confirmed defect and limits of the diagnosis

Judges and athletes reported that correct credentials returned them to login without the incorrect-password warning. The same accounts worked on other devices. Clearing all Chrome site data helped one person.

The live deployment had a concrete hostname mismatch:

| Read-only check | Observed result |
|---|---|
| `https://www.sivarfest.fit/es/login` | HTTP 200; remained on `www`, without a redirect to the apex hostname |
| `https://sivarfest.fit/es/login` | HTTP 200 |
| JavaScript served from `https://www.sivarfest.fit/_next/static/chunks/44jw4xy33z800.js` | Axios `baseURL` was compiled as `https://sivarfest.fit/api` |
| Backend `AuthController.addAuthCookie` | Auth cookie has `Path=/` and no `Domain` attribute: it belongs to the host that issues it |

On the `www` site, login therefore calls the API on the apex host. A successful response can establish a cookie for `sivarfest.fit`, but that host-only cookie is absent when requesting a page at `www.sivarfest.fit`. The Next server guard cannot authenticate that request and redirects to login. Accepting the password and establishing the portal session are separate steps; the old form only checked the first.

This is a confirmed deployment/code defect, not a verified explanation for every individual report. We have not inspected the affected users' browser network traces or cookie stores, or reproduced their accounts on their devices. Clearing browser data is consistent with several session/navigation problems and does not prove a specific cause. No client credentials were needed for the read-only checks above.

The old frontend (`8793a5f`) also reproduced the silent loop in an isolated production-build browser test: the fixture login returned HTTP 200, the subsequent protected frontend request carried no authentication cookie, and the browser returned to `/es/login`. That test explicitly waited for React to attach the submit handler, separating the hostname failure from the slow-loading form issue. The patched frontend passes the corresponding test. This local fixture uses separate loopback hostnames; it does not prove which hostname each reported user visited.

The frontend also used client navigation after cookie-changing authentication operations, without verifying that the Next server received the session. The release adds a session check and full navigation to avoid carrying a previously cached unauthenticated route into the authenticated flow.

Backend inspection found an additional diagnostic consideration: its JWT filter uses the first matching cookie if multiple cookies share the auth cookie name. Expired or revoked cookies at old scopes could interfere, but the backend history consistently sets a host-only `Path=/` cookie; no duplicate-cookie cause was established. Do not reset users' passwords or weaken token validation to address this incident.

## Release behavior

- Browser API calls use the relative `/api` address, keeping login, password changes, authenticated requests and logout on the hostname the user is visiting.
- Next provides an API rewrite for deployments/local development that do not already proxy `/api` to the backend.
- Server-side calls use a separate backend URL. Optional `API_INTERNAL_URL` takes priority; the existing absolute `NEXT_PUBLIC_API_URL` remains a compatible fallback.
- After login or a password change, the frontend checks its own session endpoint before navigating. The check verifies what the Next server receives, rather than relying solely on the backend's successful login response.
- Authentication transitions perform full document navigation. Failed session persistence produces a visible error; incorrect credentials retain their separate error.
- Server authentication and server API calls forward the same raw incoming cookie header, avoiding inconsistent reconstruction of duplicate cookie names.
- Login and password-change inputs/buttons remain disabled until their JavaScript handlers are ready. This prevents a slow initial load from submitting the native HTML form and reloading login.

The release changes only the frontend. It requires no backend deployment, database migration, account recreation, password reset or heat/score changes. It does not copy sessions between hostnames: signing in on either host establishes a session for that host.

## Immediate workaround

Until the release is deployed, send this exact link and ask the user to sign in there:

**https://sivarfest.fit/es/login**

The absence of `www` matters. This avoids the confirmed mismatch; it is not a guarantee that every reported browser issue has the same cause. Users should not need to reinstall Chrome or clear unrelated browsing data.

## Configuration

Keep the existing production environment files. Do not replace them with an example file or change the public API URL to a relative value in the old release.

The new release works with the existing absolute `NEXT_PUBLIC_API_URL`. On the known server, this optional server-only setting can avoid routing server requests through the public hostname:

```dotenv
API_INTERNAL_URL=http://127.0.0.1:8081/api
```

This optional value must be available to both the Next build and the running process if used. It is not necessary to change configuration for the existing absolute fallback to work. The URL must include `/api` and must resolve to the backend, not back into the same Next `/api` rewrite.

**Rebuild the frontend.** Restarting the old build alone leaves the compiled browser API URL in place. The release does not require an Nginx change or a canonical-host redirect. Both served hostnames must reach the updated frontend and route `/api` to the same backend. Existing Nginx `/api` proxying continues to handle those requests where configured.

## Deploy after the frontend fix is merged

Use the existing manual SSH workflow as `wodnsivar`. The frontend directory is `/opt/sivarfest/src/sivarfest-web`; its service is `sivarfest-web`. The separate `wodnsivar` application and the `sivarfest-api` service are not deployment targets for this patch.

The block below stops on failure, captures the actual pre-deployment commit, and backs up the running `.next` build. The build step briefly stops the frontend so `npm ci` and `.next` replacement do not modify a running release. If the build fails, the block restores the previous source, dependencies and saved build. Save the printed backup path for later rollback. Do not deploy with uncommitted source changes.

```bash
bash <<'SIVARFEST_AUTH_DEPLOY'
set -euo pipefail
cd /opt/sivarfest/src/sivarfest-web
if [ -n "$(git status --porcelain)" ]; then
  echo 'Source has local changes. Preserve and resolve them before deploying.'
  exit 1
fi
test -d .next
sivarfest_auth_previous_head=$(git rev-parse HEAD)
sivarfest_auth_backup="/opt/sivarfest/releases/web-auth-$(date +%Y%m%d-%H%M%S)"
sudo mkdir -p "$sivarfest_auth_backup"
printf '%s\n' "$sivarfest_auth_previous_head" | sudo tee "$sivarfest_auth_backup/git-head" >/dev/null
sudo cp -a .next "$sivarfest_auth_backup/next"
echo "Frontend backup: $sivarfest_auth_backup"
git switch main
git pull --ff-only origin main
test -f docs/auth-login-incident.md
git log -1 --oneline
sudo systemctl stop sivarfest-web
sudo chown -R wodnsivar:www-data .next
if npm ci && npm run build; then
  sudo chown -R sivarfestapp:www-data .next
  sudo systemctl start sivarfest-web
else
  echo 'Install/build failed. Restoring the previous release.'
  git switch --detach "$sivarfest_auth_previous_head"
  npm ci
  if [ -e .next ]; then
    sudo mv .next "$sivarfest_auth_backup/failed-next"
  fi
  sudo cp -a "$sivarfest_auth_backup/next" .next
  sudo chown -R sivarfestapp:www-data .next
  sudo systemctl start sivarfest-web
  echo 'Previous frontend restored. Stop here and inspect the build error.'
  exit 1
fi
systemctl is-active sivarfest-web
curl --retry 10 --retry-delay 2 --retry-all-errors --connect-timeout 3 --max-time 5 -fsS -o /dev/null -w 'Apex login: %{http_code}\n' https://sivarfest.fit/es/login
curl --retry 10 --retry-delay 2 --retry-all-errors --connect-timeout 3 --max-time 5 -fsS -o /dev/null -w 'WWW login: %{http_code}\n' https://www.sivarfest.fit/es/login
echo "Frontend backup: $sivarfest_auth_backup"
SIVARFEST_AUTH_DEPLOY
```

If dependency installation also fails during automatic recovery, the service remains stopped; retain the backup and resolve that installation error before starting it. For a startup/health failure inspect `sudo journalctl -u sivarfest-web -n 100 --no-pager`, then use the rollback below if needed. A public HTTP 200 alone does not verify authenticated access.

## Acceptance checks

The automated suite uses an isolated mock API and a real production Next build. Run `npm ci`, `npx playwright install chromium`, then `npm run test:auth`. It covers desktop Chrome and a mobile Chrome device profile, deliberately using different frontend/backend hostnames. It never uses production credentials or data. The mock checks frontend session behavior; it does not replace backend JWT/security tests or testing on an affected physical device.

Validation on 2026-09-16: all 30 browser checks passed; ESLint, TypeScript and a fresh normal production build passed. Browser runs used Chromium 153, including a Pixel 7 device profile; physical iOS/Safari validation remains a rollout check.

The suite builds `.next` with fixture API addresses. Always run a fresh `npm run build` with the real environment before deploying; do not deploy the test build. CI runs a normal production build after the authentication suite.

Use designated test accounts and repeat on **both** `https://sivarfest.fit` and `https://www.sivarfest.fit`, including a phone browser. Also ask at least one previously affected person to retry with their existing browser data.

| Scenario | Expected result |
|---|---|
| Judge, valid credentials | Opens the judge portal; refresh stays authenticated |
| Athlete, valid credentials | Opens the athlete portal; refresh stays authenticated |
| Admin, valid credentials | Opens the admin portal |
| Account requiring password change | Must finish that step before entering its portal; a successful change establishes the new session |
| Wrong credentials | Visible incorrect-credentials warning; no successful-session navigation |
| Session cookie cannot be stored/sent, using a controlled test browser | Visible session error; no silent return to an empty login form |
| Logout, then refresh or revisit a protected page | Login is required; old protected content is not treated as an active session |
| Previously visited protected route before login | Successful login opens it with the new session instead of replaying an unauthenticated navigation |
| English login/password-change flow | Same behavior with English messages |

In browser developer tools, confirm the login request's hostname matches the page hostname. Its response cookie should remain `HttpOnly`, `Secure` in production, and `Path=/`. Confirm the frontend session check succeeds before portal navigation. Do not publish credentials, cookie values, or unredacted network exports in a support ticket.

## Rollback

Prefer the saved release above because it preserves the actual pre-deployment build. Replace the example backup path with the exact printed path; this block validates it before stopping the service. It preserves any failed/new build and switches source to the saved commit without discarding local changes.

```bash
bash <<'SIVARFEST_AUTH_ROLLBACK'
set -euo pipefail
cd /opt/sivarfest/src/sivarfest-web
sivarfest_auth_backup=/opt/sivarfest/releases/web-auth-YYYYMMDD-HHMMSS
test -f "$sivarfest_auth_backup/git-head"
test -d "$sivarfest_auth_backup/next"
if [ -n "$(git status --porcelain)" ]; then
  echo 'Source has local changes. Preserve and resolve them before rollback.'
  exit 1
fi
sivarfest_auth_previous_head=$(sudo cat "$sivarfest_auth_backup/git-head")
git cat-file -e "$sivarfest_auth_previous_head^{commit}"
sudo systemctl stop sivarfest-web
git switch --detach "$sivarfest_auth_previous_head"
npm ci
if [ -e .next ]; then
  sudo mv .next ".next.before-auth-rollback-$(date +%Y%m%d-%H%M%S)"
fi
sudo cp -a "$sivarfest_auth_backup/next" .next
sudo chown -R sivarfestapp:www-data .next
sudo systemctl start sivarfest-web
systemctl is-active sivarfest-web
SIVARFEST_AUTH_ROLLBACK
```

If only the captured previous commit is available, switch to it with `git switch --detach <captured-commit>`, install that commit's dependencies with `npm ci`, and rebuild using the existing environment before restarting `sivarfest-web`. Do not use `git reset --hard`. Rollback restores the old hostname defect too, so resume sharing the exact no-`www` login link. A future deployment can return to `main` with `git switch main` after confirming the worktree is clean.
