# Ichabod

One command to get a running PocketBase CMS + marketing site. Zero npm dependencies.

## Usage

```
npx ichabod init
```

## What it does

1. Downloads the PocketBase binary (platform + arch aware)
2. Prompts for project name, admin email, admin password
3. Creates your superuser account
4. Scaffolds a minimal static marketing site into pb/pb_public/
5. Creates a posts collection with title, slug, body, excerpt, published_date fields
6. Seeds 2 starter posts: a stack explainer + an LLM prompt guide
7. Writes pb.config.json with discovered schema

## Commands

- `npx ichabod init` — interactive setup wizard
- `npx ichabod start` — start PocketBase in an existing project

## URLs after init

- http://localhost:8090 — marketing site
- http://localhost:8090/blog/ — blog (fetches posts from PocketBase)
- http://localhost:8090/_/ — PocketBase admin UI

## Project layout

```
your-project/
  pb/
    pocketbase        binary
    pb_data/          database + uploads
    pb_public/        static site (plain HTML/CSS/JS)
  pb.config.json      schema snapshot
```

## Requirements

- Node.js 18+
- macOS, Linux, or Windows
- Internet connection for initial PocketBase download
