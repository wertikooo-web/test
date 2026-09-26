# AI Photoshoot LUX

AI Photoshoot LUX is a web-based AI portrait studio that turns 5 user photos into professional, style-consistent AI portraits.

Live site: https://wertikooo-web.github.io/test/

## Main features

- Upload exactly 5 identity photos
- Optional style / outfit / lighting / pose references
- Styles: Business, LinkedIn, Luxury, Casual, Travel, Editorial, Creative, Dating
- Generate 1, 2, 4, 6 or 8 photos
- 2K and 4K options
- Text and voice instructions
- Regenerate a single photo
- Edit a generated photo
- Download one image or all results as ZIP
- RU / EN / RO interface
- Large preview / lightbox for generated images
- Loading indicator during regeneration and editing

## Signature LUX functions

### More like this
Continue from a successful result while preserving the same person, styling, light and mood, but changing pose, gaze and framing.

### Create a series
Build a coherent mini photoshoot from one successful frame with multiple shot types.

### Best shots
Analyze generated photos and mark useful standouts such as best overall, best for profile, most natural and best full-body shot.

## Structured shoot scenario

When **Make shots different** is enabled, the app shows a separate scenario for each requested photo.

Each slot is treated as one independent image. Prompts explicitly prevent collages, grids, contact sheets, split screens and multi-frame compositions.

Quick ideas include:

- Standing
- Sitting
- Walking
- Full body
- Waist-up
- Blurred background
- Viewpoint
- Mountains
- Beach
- City
- Market
- Cafe
- Park
- Old town
- Forest

When the checkbox is disabled, the per-shot controls are hidden and the app uses the general request as one overall direction.

## Credits model

Planned packs:

- Starter: 100 Credits + 20 bonus = 120 Credits for €4.99
- Standard: 250 Credits for €9.99
- LUX: 600 Credits for €19.99

Credits are valid for 12 months.

Planned usage:

- New 2K photo: 20 Credits
- Regeneration: 20 Credits
- Edit existing photo: 15 Credits
- 4K upgrade: 10 Credits

At the current prototype stage, Credits are demonstrational and are not yet connected to payments or a server-side balance.

## Current architecture

The current version is a front-end prototype deployed with GitHub Pages.

For testing, the user enters a Gemini API key in the browser. This is temporary and must be replaced before public launch.

Main app folder:

```text
ai-photoshoot-v2/
```

Important files:

```text
ai-photoshoot-v2/index.html
ai-photoshoot-v2/lux-enhancements.js
ai-photoshoot-v2/lux-enhancements.css
ai-photoshoot-v2/busy-indicator.css
ai-photoshoot-v2/planner-toggle-fix.js
ai-photoshoot-v2/ui-repair.js
```

Deployment workflow:

```text
.github/workflows/ai-photoshoot-pages.yml
```

## Production plan

Before public payments are enabled, the production version should move sensitive logic to a backend layer:

- Cloudflare Worker for Gemini API calls
- API key stored as a server-side secret
- Cloudflare D1 for users, balances and Credit ledger
- Secure payment webhooks
- Atomic Credit deductions
- Rate limiting / Turnstile
- Private temporary image storage
- Security headers and restricted CORS
- Lightweight sign-in by email or Google

The product does not need a complex personal dashboard. The intended UX is simply sign in, see the current Credits balance and buy more when needed.

## Status

This repository is currently in active prototype testing: design, generation quality, prompts, result tools and ergonomics are being refined before payment integration.

AI Photoshoot LUX ™ 2026 · Kando Connect
