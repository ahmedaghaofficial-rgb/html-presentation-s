# LOKAL — Interactive Case Study (Syntax Deck original)

An Egyptian-Arabic, 14-scene business case study of LOKAL, implemented on **the original Syntax Deck architecture** (Astro + shared Deck layout + Canvas drawing primitives + LiveBoard), not a mockup or exported images.

## Run it

```bash
npm ci
npm run dev
# open http://localhost:4340/lokal
```

For a static build:

```bash
npm run build
npm run preview
# /lokal.html may be emitted due to Astro build.format = 'file'
```

Start at the lesson index (`/`) or go directly to `/lokal` in dev mode.

## Features

- 14 scenes covering claims, six drivers, platform model, buying journey, loyalty, competition, risk and takeaways.
- Three new animated Canvas diagrams built with the **original** `src/lib/viz.ts` functions and `Deck.astro`.
- Existing live drawing board, presenter notes, keyboard navigation, film mode and progress meter.
- Interactive unit-economics calculator, labelled **hypothetical**, not LOKAL's disclosed commissions.
- Editorial distinctions between declared sales, total transaction value, revenue and profits.
- Clickable references within slides and presenter notes.

## Controls (inherited from upstream)

- Left arrow / PageDown: next slide; Right arrow / PageUp: previous.
- B: draw; 1–6: pen color; E: erase; Z: undo.
- V: dim the slide; N: presenter notes; F: film mode; L: lesson list.

On the economic calculator, keyboard arrows operate its sliders without changing slides.

## Evidence and limitations

Public information reviewed 2026-11-11. Sales and order totals are company/founder claims rather than audited financial statements. The founder said annual 2025 sales passed nine figures. GMV, accounting revenue and net profit may differ. The competitor economic models cited in EnterpriseAM **must not** be imputed to LOKAL.

Sources:

- [LOKAL official site — branches, claimed orders and loyalty](https://lokaleg.com/)
- [Shark Tank Arabic: initial sales and pitch](https://sharktankarabi.com/1964/)
- [Founder's annual sales milestone](https://www.linkedin.com/posts/hisham-el-gawly_proud-of-all-of-you-fady-el-gawly-mina-activity-7421520990561591296-19Uw)
- [LOKAL Loyalty App description](https://apps.apple.com/eg/app/lokal-egypt/id6759270199)
- [EnterpriseAM, October 22, 2026 — Locally and Go Native](https://enterpriseam.com/egypt/2026/10/22/a-new-category-of-egyptian-retail-is-anchoring-the-countrys-biggest-malls/)
- [LOKAL refund policy](https://lokaleg.com/policies/refund-policy)

## Ownership and attribution

This is a derivative presentation built *within the user's existing GitHub fork* of [mostfamohamedrgab/syntax-deck-demo](https://github.com/mostfamohamedrgab/syntax-deck-demo). Original concept and code: Mustafa Mohamed / Syntax Academy. The upstream repository does not currently expose a license file; **do not assume permission for redistribution or commercial reuse outside the rights granted by GitHub's platform terms without explicit permission from the rights holder**. This independent case study is not endorsed by LOKAL.

## Scope

This feature branch leaves the upstream example slide and engine intact. The only shared-code change is the lesson registry entry linking to the new route. There is no automatic AI content import, PPTX export, or production deployment.
