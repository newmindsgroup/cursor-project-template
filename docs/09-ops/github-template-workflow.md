# GitHub Template Workflow

## Create the Template Repo
1. Create a new repository on GitHub (public or private as needed).
2. Push this template content to the repo.
3. In the repo settings, enable "Template repository".

## Using "Use this template"
1. Click "Use this template" from the repo page.
2. Choose the owner and name for the new project.
3. Clone the new repo and customize the docs.

## Branching Strategy
- `main` stays releasable.
- Optional `develop` if your team prefers an integration branch.

## Versioning (Optional)
- Tag meaningful template releases: `v1.0.0`, `v1.1.0`, etc.
- Record notable changes in `CHANGELOG.md`.

## Updating the Template Over Time
1. Pull the latest changes on `main`.
2. Make changes in small, reviewable commits.
3. Use conventional commits (e.g., `feat:`, `fix:`, `chore:`).
4. Push to `main`.
5. Tag releases and update `CHANGELOG.md` when appropriate.
