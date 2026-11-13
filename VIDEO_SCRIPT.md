# PicPixels — Portfolio Video Script

**Format:** Screen recording + voiceover (no on-camera)
**Target runtime:** 10–11 minutes
**Tone:** Confident, technical but human. You are the engineer explaining decisions, not a salesperson.
**Resolution:** 1920×1080, 60fps for scroll shots, browser at 100% zoom, hide bookmarks bar.

---

## Pre-Recording Checklist

**Environment**
- [ ] Close Slack/Discord/email — kill all notification popups
- [ ] Browser: fresh profile or hidden bookmarks bar, no extensions visible
- [ ] Zoom browser to 100%, window maximised at 1920×1080
- [ ] Terminal: large font (16pt+), dark theme, clean prompt, no secrets on screen
- [ ] VS Code: hide minimap, font size 16, close unused tabs
- [ ] Disable Windows notifications (Focus Assist → Alarms only)

**Accounts / data**
- [ ] Log in to `admin.picpixels.com` (Django admin) in a second tab before recording
- [ ] Log in to the client dashboard at `/dashboard/overview`
- [ ] Seed one demo order so "My Orders" isn't empty on camera
- [ ] Have one CMS edit ready to demonstrate (e.g. change a hero headline)

**Assets to prepare**
- [ ] `PROJECT_STRUCTURE.md` open in a tab (for the architecture beat)
- [ ] This script open on a second monitor
- [ ] A short before/after image pair for the revision-annotation demo

**Recording order tip:** Record the *code/terminal* segments last. If you fumble a line in the browser segments, you can re-record without redoing terminal setup.

---

## ACT 1 — COLD OPEN
### `0:00 – 0:35` · 35 seconds

**ON SCREEN**
Open on the live homepage hero, static, no scrolling. Cursor off-screen. Let it breathe for 3 seconds.

**VOICEOVER**
> "This is PicPixels — a production photo-editing platform. It has a public marketing site, a client dashboard, a retoucher console, and a Django backend with ninety-three database models.
>
> I built the entire thing in about three months, working almost entirely through AI-assisted 'vibe coding.'
>
> In the next ten minutes I'll show you the frontend, the backend, the features that actually matter, and the parts that were genuinely hard."

**DIRECTION**
- Hard cut to black at "vibe coding" for a beat, then title card.
- Title card: `PicPixels — Full-Stack Photo Editing Platform` + small subtitle `Next.js 15 · Django 5 · Built with AI pair-programming`

---

## ACT 2 — THE PROBLEM & THE SHAPE OF THE PRODUCT
### `0:35 – 1:20` · 45 seconds

**ON SCREEN**
Split screen or quick cuts: the marketing homepage → the client dashboard → the Django admin. Then `PROJECT_STRUCTURE.md` tree, scrolled slowly.

**VOICEOVER**
> "Photo-editing studios run on a specific kind of chaos. Clients send images over email and WhatsApp. Files get lost. Nobody knows which version is final. Feedback arrives as 'the shadow on the left shoe looks wrong' with no indication of *which* shoe.
>
> So the product has three surfaces, and they all have to agree with each other.
>
> One — a **public marketing site**. Services, portfolio, pricing, case studies, blog, a free-trial funnel.
>
> Two — a **client workstation**. Upload images, create orders, track progress, review deliverables, leave pin-point feedback.
>
> Three — a **content backend**. A Django admin that a non-technical editor can run without touching code.
>
> The interesting problem isn't any one of those. It's keeping all three in sync — instantly."

**DIRECTION**
- On "three surfaces," use three quick 1-second cuts, one per surface.
- Land on the folder tree and hold while you say "keeping all three in sync."

---

## ACT 3 — FRONTEND: THE PUBLIC SITE
### `1:20 – 3:20` · 2 minutes

**ON SCREEN**
Scroll the live homepage slowly, top to bottom. Do not rush — scroll in smooth 400px increments with a half-second pause.

**VOICEOVER**
> "Let's start with the frontend. Next.js 15, App Router, React 19, TypeScript, Tailwind v4, with Framer Motion and GSAP for the motion layer.
>
> The homepage alone is seventeen sections — hero, trust bar, service showcase, an interactive pricing configurator, quality assurance, a six-step process, portfolio, testimonials, blog, case study, contact, FAQ, and the closing CTA.
>
> Two decisions here shaped everything else.
>
> **First: it's server-rendered.** The layout fetches site settings, navigation, and mega-menu services on the server in a single `Promise.all`. That means the header is correct in the very first byte of HTML — no layout shift, no flash of the wrong menu.
>
> **Second: every section is CMS-driven.** Nothing on this page is hardcoded. The hero slides, the stats, the service cards, the testimonials, the FAQ — all of it comes from Django."

**ON SCREEN**
Hover the Services nav to open the mega menu. Click into a service detail page. Scroll it.

**VOICEOVER**
> "Service detail pages are assembled from reusable blocks — brand logos, E-E-A-T signals, process steps, pricing tiers, client feedback. Each block is its own component with its own data contract, so a new service page is a database row, not a development task.
>
> And because this is a marketing site, the SEO layer is real, not an afterthought. A dynamic sitemap that pulls every blog post, service, portfolio item, and guide. JSON-LD structured data. Google Tag Manager, GA4, Facebook Pixel, Search Console verification — all injectable from the admin panel. Even the favicon is CMS-controlled."

**DIRECTION**
- Show `src/app/sitemap.ts` for 4 seconds when you say "dynamic sitemap."
- Show `components/seo/TrackingScripts.tsx` briefly.

---

## ACT 4 — THE PRICING CONFIGURATOR
### `3:20 – 4:05` · 45 seconds

**ON SCREEN**
Scroll to the pricing configurator. Change the service dropdown, change the unit range, watch the cards update. Then go to `/pricing`.

**VOICEOVER**
> "This is the piece I'd point to first if you asked what makes it feel like a real product.
>
> It's a pricing configurator. Pick a service, pick a unit range, and the tier cards — Simple, Medium, Complex — repopulate with the right prices and the right strikethrough discounts.
>
> What makes it non-trivial is that the pricing isn't a flat table. It's a hierarchy: a section, dropdown options, cards, and per-card price rows — each a separate model with its own ordering and active flag.
>
> The same pricing engine exists on the backend as a pure function, `calculate_order_price`. It applies a turnaround multiplier — three-hour jobs cost double, twenty-four-hour jobs cost 1.3× — then layers on bulk discounts at fifty and two hundred units, then the subscription tier discount. Solo, Professional, Enterprise.
>
> So the number the customer sees in the browser and the number the invoice uses come from the same rules, expressed twice. Once in TypeScript for instant feedback, once in Python as the source of truth."

**DIRECTION**
- When you say "same rules, expressed twice," split-screen `InteractiveCalc.tsx` and `orders/services.py` side by side for 3 seconds.

---

## ACT 5 — THE CLIENT DASHBOARD
### `4:05 – 6:00` · ~2 minutes

**ON SCREEN**
Go to `/login`. Show the glassmorphic login card. Then `/dashboard/overview`.

**VOICEOVER**
> "Now the client side. Login is JWT — a one-hour access token, a seven-day refresh token with rotation and blacklisting. Behind it, Cloudflare Turnstile and a honeypot field, plus per-endpoint rate limits: ten login attempts a minute, five registrations, three password resets.
>
> The dashboard is where the workflow actually lives."

**ON SCREEN**
Point at each sidebar item as you name it: Overview, Create Order, My Orders, Notifications, Media Library, API & FTP, Purchase Credits. Then click **Create Order** and step through the wizard.

**VOICEOVER**
> "Overview gives you live KPIs pulled straight from the orders API. Create Order is a three-step wizard: upload, configure, confirm. Upload a batch, pick a workflow template — output format, background type, shadow style, DPI, colour profile — and choose your turnaround speed. The estimate recalculates as you go.
>
> Then My Orders, where each order moves through a real state machine: uploaded, retouching, quality check, review pending, approved, or sent back for revision."

**ON SCREEN**
Open an order detail. Then open the revision view and click on the image to drop a feedback pin. Type a short comment. Show the pin appear in the list.

**VOICEOVER**
> "This is my favourite feature in the whole build.
>
> When a client rejects a deliverable, 'please fix the shadow' is useless. So revisions aren't a text box — they're annotations.
>
> Click anywhere on the image and a pin drops at that exact point. The coordinates are stored as *percentages*, not pixels — which means the pin lands on the same spot whether you're reviewing on a 4K monitor or a phone. Each pin carries its own comment, and they stack into a numbered list beside the image.
>
> The retoucher opens the same image and sees exactly where the problem is. No ambiguity, no email thread."

**DIRECTION**
- Slow down here. This is the emotional peak of the frontend section.
- Hold on the pin list for a full 2 seconds after you stop talking.

---

## ACT 6 — BACKEND ARCHITECTURE
### `6:00 – 8:00` · 2 minutes

**ON SCREEN**
Switch to the terminal. Run `tree` on the backend, or show the folder list in VS Code. Then show `core/urls.py`.

**VOICEOVER**
> "Underneath all of that is Django 5 with Django REST Framework — thirteen apps, ninety-three models, about a hundred serializers, roughly twenty thousand lines of Python.
>
> The apps are split by domain, not by convenience. Users and subscriptions. Orders and order items. Revisions and annotations. Workflows. A CMS app that is genuinely enormous — sixty-plus models covering services, blog, hero sections, pricing, free trials, the about page, privacy and terms. Plus notifications, navigation, media library, portfolio, case studies, and guides.
>
> Every app exposes a versioned REST surface under `/api/v1/`, and the whole thing self-documents through drf-spectacular — there's a live Swagger UI at `/api/docs/`."

**ON SCREEN**
Open `/api/docs/` in the browser. Expand one endpoint. Then switch to `admin.picpixels.com`.

**VOICEOVER**
> "But the API is the easy half. The hard half is the admin — because the person running this site is an editor, not a developer.
>
> So the admin is heavily customised. It runs on Unfold with a custom dashboard: six stat cards, pending orders, unread inquiries, posts this month. Custom widgets — toggle switches instead of checkboxes, a colour picker, a location picker, and a live content-block preview for the blog editor. Bulk portfolio upload. A one-click cache revalidation button.
>
> And an inline quick-update endpoint, so toggling a service on or off, or reordering a section, fires an AJAX request instead of a full page reload. That single detail is the difference between an admin an editor tolerates and one they actually use."

**DIRECTION**
- Demonstrate one toggle in the admin. Show the instant optimistic update.
- Keep the admin demo under 25 seconds — it's supporting evidence, not the headline.

---

## ACT 7 — THE INVISIBLE ENGINEERING
### `8:00 – 9:30` · 90 seconds

**ON SCREEN**
Open `core/revalidation.py`, then `core/revalidation_signals.py`, then `src/app/api/revalidate/route.ts`. Show the `MODEL_REVALIDATION_MAP` dictionary.

**VOICEOVER**
> "Here's the problem nobody sees, and the reason I'm proud of this build.
>
> The frontend is statically rendered and cached. That's what makes it fast. But it means when an editor changes a headline in Django, the public site can keep serving the old version — for minutes, sometimes longer.
>
> The naive fix is to disable caching. That trades a real performance win for a fake correctness win.
>
> So instead: a revalidation pipeline.
>
> When any CMS model is saved or deleted, a Django signal fires. It waits for `transaction.on_commit` — so it never revalidates before the database actually commits — then clears the server-side cache and spawns a background thread that POSTs to a Next.js route with a shared secret.
>
> That route calls `revalidatePath` and `revalidateTag`, and clears the in-memory API cache.
>
> The clever part is the map. Every model declares which paths and which cache tags it affects. Save a blog post and it invalidates the homepage, `/blog`, and that post's own URL — and nothing else. Save a pricing card and only `/` and `/pricing` get touched.
>
> Editor saves. Two seconds later the live site reflects it. No rebuild, no deploy, no cache purge."

**ON SCREEN**
Do the live demo: edit a headline in the admin, save, switch to the public site, refresh, show the change.

**VOICEOVER**
> "That's a real edit, going live right now."

**DIRECTION**
- This is the strongest technical beat. Do not rush it.
- If the demo is slow, cut to a pre-recorded version rather than waiting on camera.

---

## ACT 8 — PERFORMANCE DETAILS
### `9:30 – 10:15` · 45 seconds

**ON SCREEN**
Open `lib/fetch.ts` and `services/public-api.ts`. Scroll to `fetchHomepageData`.

**VOICEOVER**
> "Two more things worth calling out.
>
> First, the homepage used to make thirteen separate API calls — one per section. On a cold backend that's the difference between a page and a wait. So I built a single consolidated endpoint that aggregates all thirteen sections into one response, cached server-side. One request instead of thirteen.
>
> Second, the fetch layer isn't a thin wrapper. It has abort-based timeouts, exponential-backoff retries, in-flight request deduplication so ten components asking for the same data share one network call, and a media-URL sanitiser that rewrites internal `localhost` and admin-domain URLs into clean relative paths — which is the kind of bug that only shows up in production and takes a day to find."

---

## ACT 9 — THE VIBE CODING STORY
### `10:15 – 11:10` · 55 seconds

**ON SCREEN**
Show `git log --oneline` scrolling. Then show the commit graph or the count.

**VOICEOVER**
> "One hundred commits over three months. And if you read them in order, you can watch the actual process.
>
> The early commits are structural — scaffold, components, layout. Then you hit a wall of commits that are all the same bug: favicon. Nine commits in a row fighting browser favicon caching. Then another cluster on cache staleness, because editors were changing content and not seeing it. Then media permissions, `Errno 13`, a production-only problem that doesn't exist locally.
>
> That's what vibe coding actually looks like. It is not 'describe an app, receive an app.' It's fast generation paired with fast diagnosis. The AI writes the first version in minutes. You spend the next hour understanding why the second version broke.
>
> What made it work was keeping the feedback loop tight — real data, real browser, real deploy. Every time I let the loop get long, I lost more time than I saved."

**DIRECTION**
- Let the git log scroll run under the narration. Freeze on the favicon cluster when you mention it.

---

## ACT 10 — CLOSE
### `11:10 – 11:40` · 30 seconds

**ON SCREEN**
Return to the homepage hero. Slow scroll into the footer, then fade.

**VOICEOVER**
> "PicPixels is a full-stack platform: a Next.js frontend that's server-rendered and CMS-driven, a Django backend with ninety-three models, a real order and revision workflow, and a cache-revalidation pipeline that keeps content fresh without giving up static performance.
>
> The code is on GitHub, the site is live, and the admin panel is something a non-developer can actually run.
>
> Thanks for watching."

**DIRECTION**
- End card: project name, live URL, GitHub handle, your name/role. Hold 4 seconds.

---

## B-ROLL & OVERLAY SHOT LIST

Use these as cutaways when you need to cover an edit or a breath:

| # | Shot | Where it goes |
|---|---|---|
| 1 | Slow scroll of full homepage (sped to 1.5×) | Act 3 background |
| 2 | Terminal `git log --oneline --graph` scrolling | Act 9 |
| 3 | `tree` output of backend apps | Act 6 |
| 4 | Swagger UI expanding an endpoint | Act 6 |
| 5 | Admin toggle flipping with optimistic update | Act 6 |
| 6 | Pin dropping on an image | Act 5 |
| 7 | Before/after slider dragged slowly | Act 3 or 5 |
| 8 | Pricing cards recalculating on dropdown change | Act 4 |
| 9 | Lighthouse / performance panel (if you have one) | Act 8 |
| 10 | Mobile viewport scroll of the homepage | Act 3 |

---

## LOWER-THIRD / TEXT CALLOUTS

Drop these as small corner labels when the matching line is spoken:

- `Next.js 15 · React 19 · TypeScript · Tailwind v4`
- `Django 5.2 · DRF · SimpleJWT · Channels`
- `13 apps · 93 models · 103 serializers`
- `~48k lines frontend · ~20k lines backend`
- `100 commits · 3 months`
- `JWT + Cloudflare Turnstile + rate limiting`
- `on_commit → revalidatePath → live in ~2s`
- `1 request instead of 13`

---

## CHAPTER MARKERS (for YouTube description)

```
0:00  Intro
0:35  The problem
1:20  Frontend — public site
3:20  Pricing configurator
4:05  Client dashboard & revision pins
6:00  Backend architecture & admin
8:00  Cache revalidation pipeline
9:30  Performance work
10:15 The vibe coding process
11:10 Results & close
```

---

## RECORDING NOTES

**Pacing.** The instinct is to talk over every scroll. Don't. Let the site move in silence for 1–2 seconds after each section lands. Dead air reads as confidence.

**Numbers.** Say them slowly. "Ninety-three models" lands; "93 models" mumbled does not.

**Honesty.** When you say "this was hard," name the specific failure — the favicon loop, the `Errno 13` permissions bug, the stale cache. Specificity is what separates a portfolio video from a demo reel.

**What to cut if you run long.** Act 8 (performance details) is the safest cut — fold the "one request instead of thirteen" line into Act 6. Act 2 can also compress to 25 seconds.

**What never to cut.** Act 7 (revalidation) and the revision-pin demo in Act 5. Those are the two moments that prove you understand systems, not just syntax.

---

## OPTIONAL: 60-SECOND SHORT (for LinkedIn / X)

Reuse the same footage, different cut:

> "Ninety-three database models. Forty-eight thousand lines of frontend. Three months, built almost entirely with AI pair-programming.
>
> This is PicPixels — a photo-editing platform with a public site, a client dashboard, and a Django backend.
>
> The hard part wasn't building it. It was the cache problem: the frontend is static for speed, so editor changes didn't appear. I fixed it with a signal-driven revalidation pipeline — save in Django, invalidate exactly the right paths in Next.js, live in two seconds.
>
> And feedback: instead of 'fix the shadow,' clients drop pins directly on the image, stored as percentages so they land correctly on any screen.
>
> Full breakdown in the long video."

Cut points: hero → dashboard pin demo → admin toggle → git log → close.
