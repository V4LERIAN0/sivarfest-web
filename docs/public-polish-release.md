# Public navigation polish — apply and rehearse

This frontend-only patch follows the athlete/judge feature release you already tested. It does not change backend code, account activation, scores, WOD content, eligibility or generated heat assignments. Keep the approved font and brand styling.

## Changes to inspect

- `/es/athlete`: the profile action sits above the identity row, beside “Mi SIVARFEST”. The photo and name share the full row below. The header contains one account menu instead of the second wrapping account bar. The menu includes dashboard, profile, password change, public pages and logout; Escape and outside clicks close it.
- `/es/athletes`: SC/RX sections expand, then their gender sections expand. The home roster retains its initial ten-athlete preview and show-all control, and can now also be collapsed at either heading.
- `/es/events`: WODs start closed. Opening a WOD reveals category choices. Choosing a category expands that variant’s description, instructions and standards. Each content block can be collapsed separately. Missing variant fields still use the existing default values. WOD links containing `?category=ID#event-ID` reveal the targeted event/category.
- `/es/heats`: each event groups its heats by the actual assigned category, including gender. Those lists start closed. Empty heats remain in “Categoría por confirmar”; any legacy mixed heat stays visible with its actual category names. Public station labels say “Estación”.
- Both leaderboard routes: category/gender groups start closed. Rankings, tables, athlete links and event-result navigation are preserved.
- Public navbar links show a yellow underline and `aria-current` for the current section, including nested athlete profiles and event leaderboards. Mobile keeps its established public links; the athlete area uses the compact account menu.
- Home roster copy now starts “Categorías SC y RX. Conoce a los atletas…”. English labels are updated too.

## Apply locally — PowerShell

Extract this ZIP into `$HOME\Downloads\sivarfest-public-polish`.

You already applied the previous athlete/judge feature patch. Start from that frontend branch, unless you have since merged it into `main`.

```powershell
cd D:\dev\sivarfest-web
git status --short --branch
git log -3 --oneline
```

If the athlete/judge feature PR is NOT merged yet:

```powershell
git switch feature/athlete-and-judge-experience
```

If that frontend PR IS already merged, use this instead:

```powershell
git switch main
git pull --ff-only origin main
```

Then run these commands one at a time. Stop on any error. Preserve any local edits rather than resetting or deleting them.

```powershell
git switch -c feature/public-navigation-polish
$sivarfestPolishPatch = "$HOME\Downloads\sivarfest-public-polish\sivarfest-web-public-polish.patch"
Test-Path $sivarfestPolishPatch
```

`Test-Path` must return `True`. Keep the next command on ONE line:

```powershell
git am $sivarfestPolishPatch
git log -1 --format="%h %s"
npm run lint
npm run build
npm run dev
```

Expected subject: `feat: polish athlete navigation and collapsible public views`.

This contains one new commit only. It does not repeat the earlier athlete/judge patch. Its inspected source base is `33fd952fbca7d4976d74b5b73e9b291eba8da42f`; your locally applied feature commit may have a different hash. Compare the subject/content rather than expecting identical commit hashes.

## Short local review

1. Phone width (320–430 px): open the athlete dashboard. Check that “Carlos Mendoza” wraps at the space if needed; the profile button must not narrow the name. Open/close the account menu, visit profile, then return through the menu. Test English too.
2. `/es/athletes`: expand RX, then male; expand SC independently. Close a group and reopen it. Athlete links must still work. On the landing page, also test show all/show fewer.
3. `/es/events`: open WOD 3 directly without scrolling through WOD 1/2 instructions. Select a category, switch to another, collapse standards, close/reopen the WOD. Confirm exact organizers’ text remains unchanged and a blank override still shows the default.
4. From the judge panel, open its WOD/standards link. It must reveal the linked WOD/category, with the heading visible below the sticky navbar.
5. `/es/heats`: expand Male RX for the desired event. Confirm only that group’s assigned heats appear, with the original names/times/athletes and “Estación” labels. Close it and open Female SC independently.
6. Both leaderboard routes: expand a category, open an athlete profile and event results, and check the active navbar highlight. Recheck at desktop width.
7. Keyboard: Tab to each disclosure heading and use Enter/Space to open/close. Escape closes the account menu and returns focus to its button. On mobile, confirm no accidental horizontal page scrolling.

## Merge and deploy

After local review:

```powershell
git push -u origin feature/public-navigation-polish
```

Open a frontend PR against `main`. If the previous frontend feature was not merged, this branch contains both the tested athlete/judge feature and this polish commit; inspect the PR accordingly. The backend still needs the previous athlete/judge feature PR merged/deployed if that has not happened yet. There is no additional backend patch in this ZIP.

Use the included `DEPLOYMENT_AND_REHEARSAL.md` for the exact server commands and meeting rehearsal. Deploy the new athlete APIs before the matching frontend if the previous release is not live yet. SIVARFEST services are **sivarfest-api** and **sivarfest-web**. The separate `wodnsivar` service is not a target.

Do not regenerate the client-reviewed heats or reset athlete passwords during this polish deployment. Use a designated test athlete/judge and test event for scoring rehearsal; do not publish demonstration scores into real WOD standings.

## Sponsor assets

Send a ZIP containing `sponsors.json` and the logos. Use the existing fields `name`, `instagramUrl`, and `logoSrc` (for example a path under `/sponsors/`). Match each logo filename exactly. Send either the full desired list, or only additions/updates and say which it is. Preserve the existing sponsor name when replacing its logo; identify renames explicitly. Current sponsor entries are unchanged by this patch.
