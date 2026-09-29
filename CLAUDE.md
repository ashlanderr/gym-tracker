# Gym Tracker

Current state: rewrite to android app.
Read TODO.md for current tasks.

## Tools

Use Read, Edit and Write for files.
Use Grep and Glob for search.
Use shell commands only when significantly better for the task.

## Memory

Don't use auto-memory. Everything worth keeping goes into project files:
rules into this file, decisions and research into docs next to the code
(e.g. `design/branding/README.md` for the app name).

## Tests

Use mutation tests methodology:

1. Write test for new feature
2. It should pass
3. Break the feature, predict which test will fail and why
4. Run tests, check that your prediction is correct
5. If your prediction:
   a. is wrong - rewrite test and try again
   b. is right - fix code and continue

For visual tests use playwright MCP.

Write only reasonable tests.
Don't try to test any little thing.

## Git

Commit to the current branch. Don't branch out without explicit request.
Use English for commit messages.
Always try to prefer git message over comments.
Use commit message to describe reasons and decisions.
Keep the code clean from unnecessary comments.

## UI

- Mobile first, we are building a mobile app.
- No workarounds if possible, write clean UI code.
- Use containers to compute sizes, don't hard-code them.
- Use CSS Modules where possible.
- Follow current component folder structure.
- Check existing components before inventing new ones.
- Fix exactly the reported issue. Propose related improvements instead of shipping them.
- Build mockups and visual comparisons as pages in the repo (`src/client/pages/<Name>/`, a route, real components), not as published Artifacts. Open them and look before reporting.

## Naming

«Октус» is the marketing name only: store listing, launcher label, site
(octus.fit), texts. Technical identifiers keep the technical name so a
rebrand never touches them: package `ru.ashlanderr.gymtracker`, deep link
scheme, keys, secrets, buckets, containers, env vars — `gym-tracker`.
Reasons in `design/branding/README.md`.

## App Rewrite

Expect large functionality and UI changes.
Don't stick to old patterns.
Suggest changes to make production quality code.

- The only existing user is the author. Don't plan data migrations or backward compatibility for stored data: the data model can be refactored freely.
- The old recommendation algorithms are being thrown away. Don't suggest characterization tests or preserving their behavior.
- Don't invent recommendation or hint logic (weights, reps, when to show hints or questions) without explicit instructions. It's a separate design task. Use the dumbest possible stubs: repeat the last value, always show.
