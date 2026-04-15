# PocketBase Site Generator CLI (Working Name)

## Overview
A CLI tool that bootstraps a complete, production-ready headless CMS stack using PocketBase + Next.js or Astro.

The tool installs and runs PocketBase locally, scaffolds a frontend, auto-discovers schema, and generates a client-friendly CMS UI layer controlled entirely by the developer.

Goal: Replace WordPress onboarding with a fast, modern, headless-first setup.

---

## Objectives
- Zero-to-running CMS in under 2 minutes
- No prior PocketBase knowledge required
- Fully controlled frontend UI
- Clean developer + client experience
- WordPress migration-friendly

---

## Target Users
- Freelancers / agencies
- Developers moving away from WordPress
- Builders creating repeatable site templates
- White-label service providers

---

## Core Value Proposition
- PocketBase simplicity + custom UI control
- CLI-driven onboarding
- Automatic schema discovery → instant CMS UI
- No plugin overhead

---

## CLI Command
npx pb-site init

---

## Key Features (MVP)
- One-command setup
- Local PocketBase install
- Next.js / Astro scaffold
- Demo content seeding
- Schema discovery
- Auto page generation
- Config system
- Local dev environment

---

## Config Example
{
  "framework": "astro",
  "collections": ["posts", "pages"],
  "routes": {
    "posts": "/blog",
    "pages": "/"
  }
}

---

## Folder Structure
project/
├── pb/
├── web/
├── pb.config.json
├── package.json

---

## Future Features
- Authentication layer
- Role permissions
- Live preview
- Multi-language support
- Hosted SaaS version

---

## Monetization
Phase 1: Free, closed source  
Phase 2: Paid templates + UI kits  
Phase 3: Hosted SaaS + white-label  

---

## Summary
One CLI → One setup → One working CMS.
