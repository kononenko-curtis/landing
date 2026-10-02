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

- **The copy is the owner's text, verbatim.** It started as a transfer of `CONTENT.md`
  and has since been revised by the owner directly (the short stat values and their
  labels, "Узнать подробнее ↓", the section labels, the footer, the education list and
  its group order, the closing sentence of the first О себе paragraph, "Лектариум (VK)"
  and Тетрика's "2023–2025"). Those revisions are equally final. Do not reword, shorten, "improve" or add to any of it — not in
  `site.ts`, and not as stray strings in components. Visible text the owner did not
  write does not belong on the page. The button closing "Как начать" reuses the hero's
  "Записаться на знакомство"; contacts has its own `cta`. Image `alt` is the owner's
  name.
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
    `SectionHeading`, `Button`, `ItemList` + `FormatNote` (the titled list and
    "Формат:" card used by consulting and coaching), `Emphasized`, and `Footer`.
  - **Section headings come in two shapes.** Консалтинг, Коучинг and Контакты have a
    caps label above a real h2. Опыт, О себе, Как начать and Образование have nothing
    but their name, so the caps label *is* the h2 (`SectionHeading` with `label` and no
    `title`); do not add a big h2 that repeats it. Цифры keeps a screen-reader-only h2.
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
  `@fontsource-variable` with the Cyrillic subsets preloaded in `Base.astro`. Onest is
  also the *second* family in `--font-serif`, on purpose: Playfair has no `₽` or `→`, and
  without that fallback those glyphs came from whatever system font the visitor had.
- Numbers band: every value shares one size, `min(3rem, 16.5cqi)` against equal-width
  columns (1 → 3 → 5). 16.5cqi is just under what the longest value, "Сотни млн ₽", needs
  (~16.8) to stay on one line. Re-measure whenever a value changes — capitalising its
  first letter was already enough to make it overflow at 17cqi.
- Hero text must fit above the fold on a 720p laptop, whose real viewport is about
  1280×560 once the browser and taskbar take their share (1280×720 itself has room to
  spare). The name is `clamp(2.6rem, min(7vw, 12vh), 5rem)` and the hero's top padding
  has a matching `vh` term; both only shrink on short screens. If the hero copy grows,
  re-check eyebrow-to-buttons at 1280×560 and 1024×600.
- Experience and education share column widths through `--label-col`, `--period-col`
  and `--rail-indent`, so the education entry titles sit under the company names. The
  experience label is sticky from 48rem up.
- Education is grouped ("Высшее", "Дополнительное"): the group label is an `h3` in the
  small caps `.eyebrow` style, each entry an `h4` (institution and year, serif) over its
  description (grotesk). The order inside "Дополнительное" is the owner's and is not
  chronological; do not sort it.
- Photos go through `astro:assets` `<Image>` with explicit `widths` and `sizes`. The hero
  image is `loading="eager"` + `fetchpriority="high"` (it is the LCP element); the rest
  stay lazy. Photo sections alternate sides on desktop (coaching left, about right,
  contacts left). On narrow screens every photo, the hero's included, sits above its
  text, set with `grid-template-areas` rather than source order.

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
