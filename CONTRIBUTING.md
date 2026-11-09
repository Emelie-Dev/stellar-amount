# Contributing

Contributions are welcome. Before starting substantial work, open or claim an issue so the scope and acceptance criteria are clear. This project participates in Drips Wave, and pull requests are reviewed against the linked issue's acceptance criteria.

## Local setup

1. Install Node.js 18 or newer and npm.
2. Clone the repository and run `npm install`.
3. Run `npm test` before making changes.

## npm scripts

- `npm run build` — create ESM, CommonJS, and declaration bundles in `dist/`
- `npm run dev` — rebuild when source changes
- `npm test` — run tests
- `npm run test:coverage` — run tests and enforce coverage thresholds
- `npm run lint` — run ESLint
- `npm run format` — format the project with Prettier
- `npm run typecheck` — run TypeScript without emitting output

## Project layout

- `src/` — public API and implementation modules
- `tests/` — module tests, edge cases, and fast-check properties
- `.github/` — CI and contribution templates

## Adding a helper

Implement a focused helper in the relevant source module, export it from `src/index.ts`, and cover behavior and edge cases. Keep all amount arithmetic in `bigint`.

Example implementation:

```ts
export function isZero(stroops: bigint): boolean {
  return stroops === 0n;
}
```

Example test:

```ts
it("detects zero stroops", () => {
  expect(isZero(0n)).toBe(true);
  expect(isZero(1n)).toBe(false);
});
```

## Commits and pull requests

Use Conventional Commits, such as `feat: add zero helper` or `fix: reject unsafe stroop numbers`. Before opening a PR:

- [ ] Tests and coverage pass
- [ ] Lint and typecheck pass
- [ ] User-facing documentation and CHANGELOG.md are updated
- [ ] The PR explains the change and links the issue
- [ ] Every acceptance criterion in the issue is addressed

## Claiming an issue

Comment on an open issue to discuss the approach and ask to take it on. Wait for maintainer confirmation before investing in larger or overlapping changes. PRs are reviewed against the issue acceptance criteria, including those for Drips Wave issues.
