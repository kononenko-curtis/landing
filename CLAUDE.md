# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Personal landing page for the repository owner (`kononenko-curtis/landing`), served at
http://kononenko.duckdns.org.

**Status: early.** The site is currently a single hand-written static page — no framework,
no package manager, no build step. A stack has not been chosen yet; the deploy pipeline
is deliberately built so that introducing one only changes what lands in `site/`.

## Workflow

- **Commit directly to `main`. Do not create feature branches** and do not open pull
  requests unless explicitly asked. This is the owner's standing instruction for this
  repository.
- **Every code change gets committed.** Do not leave work only in the working tree —
  finish a change by committing it to `main` and pushing to `origin`.
- Push with `git push -u origin main`.

## Architecture

Three pieces, deliberately kept separate:

- `site/` — **what gets served.** Everything here is rsynced to the server's web root
  verbatim. Today that is one static `index.html`. When a framework is introduced, add a
  build step to the workflow that emits into this directory (or repoint the rsync source)
  — nothing else in the pipeline needs to change.
- `deploy/provision.sh` — **server state.** Piped into `bash -s` over SSH on every deploy,
  so it must stay idempotent. Installs nginx if absent, writes
  `/etc/nginx/sites-available/landing`, removes Debian's default site (it also claims
  `default_server`, which would fail `nginx -t` on a duplicate), and restarts nginx.
  Server-side configuration belongs here, not in the workflow.
- `.github/workflows/deploy.yml` — **orchestration.** Runs on every push to `main` and on
  manual dispatch.

The deploy is verified end-to-end inside the workflow: after rsync it curls
`http://kononenko.duckdns.org/` from the runner and fails the job unless it gets a 200.
Keep that step — Claude Code sessions cannot reach the server directly (see below), so
those logs are the only proof the deploy actually worked.

## Deployment

Target: the owner's own VDS at VDSina, `193.124.66.61` / `kononenko.duckdns.org`.
Debian/Ubuntu, nginx, plain static files under `/var/www/landing`.

Authentication is **SSH password, not a key** — a deliberate temporary choice by the
owner for this test server. `sshpass -e` reads it from the environment; never switch to
`sshpass -p`, which would expose the password in the runner's process list. Migrating to
a key later touches only the two `sshpass` steps and one secret.

Connection details come from repository secrets and must never be hardcoded:
`DEPLOY_HOST`, `DEPLOY_USER`, `DEPLOY_PASSWORD`, `DEPLOY_PATH`, `DEPLOY_KNOWN_HOSTS`
(the last one is optional — the workflow falls back to `ssh-keyscan`).

### Network limits inside Claude Code sessions

The session sandbox **cannot reach the server at all**: outbound port 22 is blocked to
every host, and HTTP to `kononenko.duckdns.org` / `193.124.66.61` is refused by the egress
proxy (`403 host_not_allowed`). There is also no `ssh`, `rsync`, or `sshpass` binary.

So do not try to SSH in, curl the live site, or ask the owner for the password — none of
it can work from here. Deploy by pushing to `main` (or dispatching the workflow) and read
the run logs; that is the only available path, and the verify step is what confirms
success.

## Commands

No package manager or build tool yet, so there is nothing to install and no test suite.

- **Deploy:** push to `main`, or trigger the `Deploy` workflow manually.
- **Check the workflow parses:** `python3 -c "import yaml; yaml.safe_load(open('.github/workflows/deploy.yml'))"`
- **Check the provisioning script parses:** `bash -n deploy/provision.sh`

When a stack is introduced, record here the commands for install, dev server, production
build, lint, typecheck, the full test run, and running a **single** test.
