# Gym Tracker

Current state: rewrite to android app.
Read TODO.md for current tasks.

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

## App Rewrite

Expect large functionality and UI changes.
Don't stick to old patterns.
Suggest changes to make production quality code.
