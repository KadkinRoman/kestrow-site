# Kestrow Motors — design spec

_Research-based redesign, 2026-11-04. The sibling project Alderline (same engine) is referenced only to explain the contrast._

Goal: Kestrow must read as a **different product** from Alderline (warm off-white, editorial serif, pill buttons,
soft rounded cards, hover dropdowns). Same engine underneath; different visual language, header, IA and key flows.
Owner's request: "the car site's menu doesn't work; the sites should differ — menu placement, design, UI/UX;
research how to do it best".

## 1. Research → decisions

| Finding | Source | Decision |
|---|---|---|
| Only 7% buy fully online, 63% want a mix; 57% want the exact monthly payment before visiting | Cox Automotive Car Buyer Journey 2025 (13.01.2026), Cars.com one-click soft pre-qualification (04.2024) | Monthly payment + soft-pull pre-approval are primary actions; goal of the site = a visit / test drive / pre-approval lead |
| Payment as a search dimension (Autotrader My Wallet); always footnote the payment assumptions (Carvana) | autotrader.com B2B "My Wallet"; carvana.com/finance | Hero search with tabs **Price / Monthly payment**; every "≈ $/mo" carries a footnote with APR, term, down payment |
| Second "price + CTA" block right under key specs on the VDP: +23% CTA clicks | Dealer.com A/B test | VDP: sticky price/CTA panel on desktop, sticky bottom bar on mobile |
| Filters: persistent left column on desktop; on mobile a full-screen drawer with "Show N cars"; removable active-filter pills; sort separate | Baymard ecommerce filter UI (17.04.2026); NN/g mobile faceted search | SRP layout rebuilt accordingly |
| Mega menus beat dropdowns for big catalogs; group columns, images only when they help choose (body-type silhouettes), one promo tile, no forms in the panel | NN/g "Mega menus work well" (2017) | "Shop cars" mega menu: By body type (silhouettes) / By price / By fuel / Collections + promo tile + "All N cars →" |
| Click-to-open is less error-prone than hover; heading does one thing (opens), "View all" inside; disclosure pattern, not `role="menu"`; Esc closes and returns focus | Smashing 2021 "Frustrating design patterns: mega-dropdown hover menus"; W3C APG disclosure navigation | Nav buttons with `aria-expanded`/`aria-controls`; click/tap opens; Esc, outside click, route change close |
| Sticky header: compact, opaque; hide on scroll down, reveal on scroll up for long pages; `scroll-padding-top` = header height | NN/g sticky headers (2021); WCAG 2.2 SC 2.4.11 | Hide-on-scroll header (respects reduced motion) |
| Visible nav beats hidden on mobile; hamburger is recognised but label it "Menu"; accordion beats drill-down for shallow trees | NN/g (2016, 2025), Smashing 2021 | Mobile: logo · search · call · "Menu"; full-screen panel with search on top, accordion sections, sticky CTAs at the bottom; a visible 3-item quick row under the header on home |
| Header search: a real input with placeholder and button; suggestions = queries + sections + a few items | Baymard search bar UI (02.10.2026) | Desktop: search field "Make, model or body type"; mobile: full-screen search layer; suggestions from inventory |
| Utility links (phone, hours) top-right, quieter than the main nav | NN/g utility navigation (2015) | Phone and hours at the right of the header, CTA "Get pre-approved" |
| Dealer IA: Shop / Sell-Trade / Finance / Research (CarMax, Carvana, Cars.com) | cars.com (read 04.11.2026); search results for CarMax/Carvana | Main nav: **Shop cars ▾ · Sell or trade ▾ · Financing ▾ · Why Kestrow ▾** + Reviews link |

Could not verify: live CarMax/Carvana UI (403 to bots); paid Baymard details; exact contrast ratios (checked with a validator during build).

## 2. Visual language

| Token | Kestrow (new) | Alderline (unchanged, for contrast) |
|---|---|---|
| Mood | cool, technical, confident | warm, editorial, quiet luxury |
| Display font | **Archivo** variable, width 75–80 (`font-stretch`), weight 800, tight tracking; prices in Archivo tabular numerals | Instrument Serif |
| Text font | Inter 400–600 | Inter |
| Background | `#FFFFFF`, sections `#F3F5F8`, lines `#E2E6EC` | `#F6F3EE` warm |
| Ink | text `#111827`, muted `#5B6472`; "night" `#0B1220` (hero, footer), surface on night `#141C2E` | espresso `#1F1B17` |
| Accent | cobalt `#1F4BFF` (primary action, hover `#1238D6`); signal orange `#FF5A1F` (price drop, text on it `#0B1220`); green `#047857` (great price / inspected) | oak `#8A5A3C` |
| Radius | cards 8, inputs/buttons 6, badges 4; pills only for removable filters | 14 / 10 / pill |
| Buttons | rectangular, 48 px tall (lg), weight 600; one primary (cobalt) per screen; secondary = 1.5 px ink outline; tertiary = text link with arrow | pill, espresso |
| Cards | white, 1 px line, no shadow; hover: lift 2 px + cobalt outline | warm paper, soft shadow |
| Motion | 150–200 ms transitions, header hide/reveal 300 ms; no scroll-reveal fades (Alderline has them); reduced motion respected | scroll-driven reveals |
| Eyebrows | small caps cobalt with a short rule before the text | oak tracked uppercase |

## 3. Components

### Header (desktop, ≥1024 px)
One row, 68 px, white, opaque, bottom line. Logo (K monogram + "KESTROW MOTORS" wordmark in Archivo condensed) ·
nav buttons · search input (grows, max 360 px) · phone (tel:) · primary button "Get pre-approved".
Hide on scroll down after 120 px, reveal on scroll up. Promo topline above it stays (dark, 32 px), not sticky.

Mega panels (full container width, opaque white, shadow, opens on click; Esc / outside click / route change closes):
- **Shop cars**: col 1 "By body type" — 6 tiles with a body-type silhouette (inline SVG) + name + count; col 2 "By price" — Under $15k / $15–25k / $25–40k / Over $40k (links to `/cars?price=`); col 3 "By fuel & collections" — Hybrid, Electric, Under 30,000 miles, Family-friendly, Price drops; col 4 promo tile ($1,000 trade-in bonus, photo, CTA). Footer row: "Browse all 30 cars →".
- **Sell or trade**: Value my car (trade-in page), How trade-in works, $1,000 bonus, We pay off your loan.
- **Financing**: Get pre-approved (soft check), Payment calculator (home `#estimate`), Financing guide, Warranty & protection.
- **Why Kestrow**: 172-point inspection, 7-day money-back guarantee, Home delivery, Test drive, Customer stories, About & team, Blog.
Plain link: Reviews. Contact lives in the footer + phone in the header.

### Header (mobile)
56 px: logo · search icon button · call icon button · "Menu" button with label. Menu = full-screen panel
(portal to `body`, focus trapped, scroll lock): search field on top, accordion sections (same IA), at the bottom sticky
"Call" + "Get pre-approved". Under the header on home and `/cars`: a visible quick row "Shop · Sell/trade · Finance"
(horizontal, 44 px targets).

### Hero (home)
Night background `#0B1220`. Left: eyebrow, condensed headline (2 lines), one-line lead, **search card** (white,
radius 8): tabs Price / Monthly payment; fields Body type (select) + Budget (select; in payment mode "Up to $300/mo …")
+ button "Show N cars" (N computed from the inventory). Below the card: row of body-type chips with silhouettes.
Right: photo (rounded 8, aspect 4/3) with a floating proof card (rating, 172-point, money-back). No full-bleed photo
(Alderline has one).

### Car card (SRP, rails)
Photo 16:10 on `#F3F5F8`; badge top-left (orange "Price drop" / green "Great price" / ink "Just arrived");
title "Year Make Model" (Archivo condensed 700) + trim/shortDesc; price row: price big tabular + "≈ $X/mo*";
spec chips row (mileage, fuel, drivetrain); footer: "1 owner · Free history report"; whole card is a link,
secondary action "Check availability" as text button. Footnote under grids: "*Est. payment: 5.9% APR, 72 mo, $0 down, before taxes and fees."

### SRP `/cars`
Desktop: left sidebar 280 px with filter groups (Body type, Price, Fuel, Drivetrain, Color, Collections, Price drops only),
top bar with result count, active filter pills (removable) + "Clear all", sort select. Grid 3 columns.
Mobile: sticky bar "Filters (n) · Sort"; full-screen filter drawer with sticky "Show N cars".

### VDP
Desktop: gallery left (main + thumbnails), sticky right panel: price, "≈ $/mo" + footnote, CTAs "Check availability"
(primary), "Book a test drive", "Value my trade-in", trust list. Under the gallery: key specs grid, features, included.
Mobile: sticky bottom bar with price + "Check availability" (replaces the generic mobile CTA bar on this page).

### Footer
Night `#0B1220`, 4 columns + contact, small legal row; no big editorial headline (Alderline has one).
