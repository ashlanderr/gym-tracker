# Gym Tracker

Current state: the `legacy` branch is the app in real use. It gets ideas from
the rewrite in `main` and from prototypes, so they can be tried on real
workouts. `main` is the Android rewrite and is not merged here.

## Tools

Use Read, Edit and Write for files.
Use Grep and Glob for search.
Use shell commands only when significantly better for the task.

## Memory

Don't use auto-memory. Everything worth keeping goes into project files:
rules into this file, decisions and research into docs next to the code.

## Tests

Use mutation tests methodology:

1. Write test for new feature
2. It should pass
3. Break the feature, predict which test will fail and why
4. Run tests, check that your prediction is correct
5. If your prediction:
   a. is wrong - rewrite test and try again
   b. is right - fix code and continue

For visual tests use playwright MCP at a 366px wide viewport.

Write only reasonable tests.
Don't try to test any little thing.

## Git

Commit to the current branch. Don't branch out without explicit request.
Use English for commit messages.
Always try to prefer git message over comments.
Use commit message to describe reasons and decisions.
Keep the code clean from unnecessary comments.

## UI

- Mobile first: the app is used on a phone during a workout.
- No workarounds if possible, write clean UI code.
- Use containers to compute sizes, don't hard-code them.
- Use CSS Modules where possible.
- Follow current component folder structure.
- Check existing components before inventing new ones.
- Fix exactly the reported issue. Propose related improvements instead of shipping them.
- Build mockups and visual comparisons as pages in the repo (`src/pages/<Name>/`, a route, real components), not as published Artifacts. Open them and look before reporting.

## Legacy Branch

The point of this branch is to test new mechanics on real workouts.

- The stored data is real and synced: keep the data model. Change the UI
  freely, but take a feature from `main` or a prototype only if it fits the
  current data. If it needs more than a small, backward compatible data
  change, leave it out and say so.
- State that is not stored (statuses, locks, highlights) is derived from the
  existing data.
- Visual metaphor stays minimal dark. Typography, sizes, animations and
  details come from `main`.
- Don't invent recommendation or hint logic (weights, reps, when to show
  hints or questions) without explicit instructions. It's a separate design
  task.
