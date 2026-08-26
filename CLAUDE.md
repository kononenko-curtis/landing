# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Personal landing page for the repository owner (`kononenko-curtis/landing`).

**Status: greenfield.** At the time of writing the repository contains only `README.md`
and this file — no application code, no build tooling, no stack chosen yet. The
"Commands" and "Architecture" sections below are intentionally unfilled; fill them in
as part of the same change that introduces the tooling they describe, so this file never
documents a stack that isn't in the tree.

## Workflow

- **Commit directly to `main`. Do not create feature branches** and do not open pull
  requests unless explicitly asked. This is the owner's standing instruction for this
  repository.
- **Every code change gets committed.** Do not leave work only in the working tree —
  finish a change by committing it to `main` and pushing to `origin`.
- Push with `git push -u origin main`.

## Deployment

Target: the owner's own dedicated server (not a PaaS, not GitHub Pages).

The intended mechanism is a GitHub Actions workflow that deploys on push to `main`,
authenticating to the server with credentials stored as **GitHub repository secrets**.
Those secrets are not configured yet. Until they exist:

- Write the deploy workflow so that the connection details (host, user, SSH key, target
  path) come from `secrets.*` — never hardcode them, and never commit key material.
- Assume the workflow will fail until the secrets are populated; that is expected, not a
  bug to work around.

## Commands

_Not yet established — no package manager or build tool is present. When the stack is
introduced, record here the commands for install, dev server, production build, lint,
typecheck, the full test run, and running a **single** test._

## Architecture

_Not yet established. When there is enough structure that it can't be inferred from a
directory listing — routing model, content/data sourcing, styling system, the split
between static and server-rendered parts, any backend or form-handling endpoints —
describe that big picture here rather than enumerating files._
