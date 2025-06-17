# Seat Defect Tracking

This monorepo contains both the backend API and frontend React application for tracking seat defects.

- **backend/** – Express API with SQLite database and Knex migrations
- **frontend/** – React user interface

## Development

Node modules are checked in for convenience. Run `npm run lint` to check formatting and `npm run format` to automatically format files. Husky will run lint-staged on commit to keep code style consistent.

## Linting & Formatting

The repository uses ESLint and Prettier configured in the root `package.json` and `.eslintrc.json`. Linting and formatting rules apply to both frontend and backend code.

## Commit Hooks

Husky and lint-staged are set up so `eslint --fix` and `prettier --write` are executed on staged files before each commit.
