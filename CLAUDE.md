# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Landing page for Кирилл Кононенко — consulting for online schools and education projects,
and coaching for founders and executives. Served at https://kononenko.duckdns.org.
Every call to action opens Telegram, `@kononenko_curtis`.

**Stack: Astro** (static output, no client JS). Chosen because the page is content, not
an application: Astro ships zero JavaScript by default, so the built output drops straight
into the existing rsync-to-nginx pipeline while still giving components, layouts and
TypeScript. Next.js was rejected — it ships a React runtime for a page that has no
interactivity. If interactivity is ever needed, reach for an Astro island rather than
changing the stack.

## Content rules

- **The copy is the owner's final text, transferred verbatim.** Do not reword, shorten,
  "improve" or add to it — not in `site.ts`, and not as stray strings in components.
  Visible text that is not in the owner's copy does not belong on the page. Where a
  button repeats (end of "Как начать работу", contacts), it reuses a hero label rather
  than introducing new wording. Image `alt` is the owner's name.
- **Never publish a phone number.** The owner asked for it explicitly.
- A bold lead-in inside a sentence is stored as `{ strong, rest }`, with `rest` carrying
  its own leading separator (`' — '` or `' '`). Render it through `Emphasized.astro`,
  which keeps `<strong>{strong}</strong>{rest}` on one line: whitespace there would
  produce a double space in the sentence.
- The original source (`CONTENT.md`) was deleted after the transfer; it is in git history
  (`git show 273cdea:CONTENT.md`) if the wording ever needs checking against it.

## Workflow

- **Commit directly to `main`. Do not create feature branches** and do not open pull
  requests unless explicitly asked. This is the owner's standing instruction for this
  repository.
- **Every code change gets committed.** Do not leave work only in the working tree —
  finish a change by committing it to `main` and pushing to `origin`.
- Push with `git push -u origin main`.

## Architecture

Three pieces, deliberately kept separate:

- `src/` — **the site.** `npm run build` emits static files into `dist/`, and that is what
  gets rsynced. `dist/` and `node_modules/` are gitignored; never commit build output.
  - `src/data/site.ts` — **all copy and the photo-to-section mapping**, as one object.
    Components decide layout only.
  - `src/components/` — one component per section, in page order in
    `src/pages/index.astro`. Shared building blocks: `Section` (band tone + padding),
    `SectionHeading` (label + h2, optionally screen-reader-only), `Button`, `ItemList` +
    `FormatNote` (the titled list and "Формат:" card used by consulting and coaching),
    and `Emphasized`.
  - `src/pages/og.jpg.ts` — builds `/og.jpg` (1200×630) by cropping `hero.jpg` with sharp
    at build time, so the social preview cannot drift from the page photo. The crop's
    vertical position is the `TOP` constant, picked by eye; revisit it if the hero photo
    is replaced.
- `deploy/provision.sh` — **server state.** Piped into `bash -s` over SSH on every deploy,
  so it must stay idempotent. Installs nginx and certbot if absent, writes
  `/etc/nginx/sites-available/landing`, removes Debian's default site (it also claims
  `default_server`, which would fail `nginx -t` on a duplicate), obtains a certificate,
  and reloads nginx. Server-side configuration belongs here, not in the workflow.
- `.github/workflows/deploy.yml` — **orchestration.** Runs on every push to `main` and on
  manual dispatch.

### Design system

- **Monochrome**, built around the black-and-white studio portraits: every surface and
  text colour is a neutral grey, and `--accent` (vermilion) is used by buttons and
  nothing else. Tokens live on `:root` in `src/styles/global.css`, with contrast noted
  beside the ones near the WCAG limit; `--ink-3` is the lightest grey allowed for text.
- **Light theme only, on purpose.** The photos are shot on a light backdrop and would read
  as glowing rectangles on a dark page. Contrast comes from `tone="dark"` bands instead
  (numbers, how to start, contacts), alternating with light and white bands.
- Type: Playfair Display for headings, Onest for text, both self-hosted through
  `@fontsource-variable` with the Cyrillic subsets preloaded in `Base.astro`.
- Photos go through `astro:assets` `<Image>` with explicit `widths` and `sizes`. The hero
  image is `loading="eager"` + `fetchpriority="high"` (it is the LCP element); the rest
  stay lazy. Photo sections alternate sides: coaching left, about right, contacts left.

The deploy is verified end-to-end inside the workflow: after rsync it requires
`https://kononenko.duckdns.org/` to return 200 and plain HTTP to redirect to it.
Keep that step — Claude Code sessions cannot reach the server directly (see below), so
those logs are the only proof the deploy actually worked.

### TLS

Certbot runs in `certonly --webroot` mode and issues certificates only; `provision.sh`
stays the sole owner of the nginx config. Do not switch to `certbot --nginx`: it edits
that config, and the next deploy overwrites the edit and silently drops the site to plain
HTTP. The config is rendered twice per run — plain HTTP first (the http-01 challenge is
answered on port 80, and referencing a certificate that does not exist yet fails
`nginx -t`), then with the TLS block once a certificate is on disk. Challenges are served
from `/var/www/certbot`, deliberately outside the deploy path, so `rsync --delete` cannot
wipe them. A certbot failure leaves the site up on HTTP rather than taking it down.

Renewal is certbot's own systemd timer; a deploy hook reloads nginx so a renewed
certificate is actually picked up. `CERTBOT_EMAIL` is an optional secret — without it the
certificate is registered without an address and no expiry warnings are sent.

## Deployment

Target: the owner's own VDS at VDSina, `193.124.66.61` / `kononenko.duckdns.org`.
Debian/Ubuntu, nginx, plain static files under `/var/www/landing`.

Authentication is **SSH password, not a key** — a deliberate temporary choice by the
owner for this test server. `sshpass -e` reads it from the environment; never switch to
`sshpass -p`, which would expose the password in the runner's process list. Migrating to
a key later touches only the two `sshpass` steps and one secret.

Connection details come from repository secrets and must never be hardcoded:
`DEPLOY_HOST`, `DEPLOY_USER`, `DEPLOY_PASSWORD`, `DEPLOY_PATH`, plus the optional
`DEPLOY_KNOWN_HOSTS` and `CERTBOT_EMAIL`. The workflow scans the host key on the runner
and treats `DEPLOY_KNOWN_HOSTS` as an extra pin — a bad paste in that secret must never be
able to break the deploy, which it did once already.

### Network limits inside Claude Code sessions

The session sandbox **cannot reach the server at all**: outbound port 22 is blocked to
every host, and HTTP to `kononenko.duckdns.org` / `193.124.66.61` is refused by the egress
proxy (`403 host_not_allowed`). There is also no `ssh`, `rsync`, or `sshpass` binary.

So do not try to SSH in, curl the live site, or ask the owner for the password — none of
it can work from here. Deploy by pushing to `main` (or dispatching the workflow) and read
the run logs; that is the only available path, and the verify step is what confirms
success.

## Commands

- **Install:** `npm ci`
- **Dev server:** `npm run dev`
- **Production build:** `npm run build` (emits `dist/`)
- **Preview the build:** `npm run preview`
- **Typecheck:** `npm run check` (`astro check` — covers `.astro` templates too)
- **Deploy:** push to `main`, or trigger the `Deploy` workflow manually.
- **Check the workflow parses:** `python3 -c "import yaml; yaml.safe_load(open('.github/workflows/deploy.yml'))"`
- **Check the provisioning script parses:** `bash -n deploy/provision.sh`

There is no test suite yet. When one is added, record here how to run it in full and how
to run a **single** test.
