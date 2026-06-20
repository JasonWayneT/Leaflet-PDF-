---
title: "Addendum: Leaflet PDF Product Brief"
created: 2026-06-18
updated: 2026-06-18
---

# Addendum: Leaflet PDF Product Brief

This addendum captures roadmap context, design decisions, and parked ideas that belong downstream of the brief — in the PRD, architecture, or future planning — but were surfaced during the product brief session.

---

## Visual Style System

### Orbital Light (v2 Primary)
The primary output style for v2. Defined in `docs/spec/04-design-specs/ORBITAL-LIGHT.md` under the name "Orbital Surveillance // Tactical Sci-Fi." Each Visual Style will have its own named spec file in that folder.

Key characteristics:
- **Ground:** Light/white base (not dark terminal)
- **Typography:** Anton for display headlines (heavy, condensed, uppercase); Hanken Grotesk for body; JetBrains Mono for labels, metadata, technical callouts
- **Accent colors:** Blues, yellows, greens for section markers, callouts, and headings
- **Shape language:** Strictly sharp (0px radius) — no rounded corners
- **Structural elements:** Corner brackets, thick border framing, rigid technical grid, barcode strips for visual interest
- **Tone:** Classified document printed on paper — military-precision structure, light ground, deliberate ink colors
- **Reference:** Pragmata (Capcom) and Marathon (Bungie) websites — structural language and contrast, not their dark color palettes

The Google Stitch mockup referenced during design is the directional prototype for this style.

### Strategyzer Style (Future — Phase 3)
Carried over from v1. Warm off-white paper (#f7f4ef), clean editorial, Strategyzer-style color coding.

**Modification from v1:** Remove the illustrated characters that were part of v1's design direction. Keep the warm paper, color coding (electric blue, bold red, amber, teal), and editorial structure.

This style shares DNA with Orbital Light's reading zones — both prioritize legibility in content areas. Future work should explore how the two styles can share a reading-zone foundation while diverging at the chrome/framing level.

---

## Roadmap Items (Parked — Not in MVP)

### Phase 2: Additional Input Types
- **Article/website URL scraping** — paste a URL, Leaflet PDF fetches and processes the content
- **Newsletter/email input** — extract content from email newsletters

### Phase 3: Style Library
- Strategyzer style as a selectable template
- User-selectable style at generation time
- Style preview before generating

### Phase 4: Critical Thinking Layer
Inspired by M. Neil Brown and Stuart Keeley's *Asking the Right Questions*. Would surface prompts alongside the reading material:
- What are the value conflicts and assumptions?
- Are there fallacies in the reasoning?
- How good is the evidence?
- Are there rival causes?
- What significant information is omitted?
- What reasonable conclusions are possible?

**Implementation consideration:** The critical thinking layer asks questions about the content — it does not assert new facts — making it safer from a fidelity standpoint than the alternatives callout feature. Lower hallucination risk.

### Phase 4: Alternatives / Context Callouts
Sidebar callouts that surface context the author may not have mentioned:
- "This article recommends Windows Remote Desktop — note: this requires Windows Pro or higher. Alternatives for Home edition: TeamViewer, AnyDesk."
- "This transcript covers Docker — alternatives worth knowing: Podman, containerd, Kubernetes."

**Risk:** This feature requires the AI to generate new knowledge beyond the source material, which breaks the source fidelity constraint. Needs a careful architecture — possibly restricted to flagging where evidence is thin rather than suggesting alternatives outright. Do not implement before source fidelity is proven in MVP.

### Phase 5: Hermes / Gmail Integration
Integrate Leaflet PDF as a rendering engine within the Hermes agent system. Potential use case: scan Gmail for newsletters, extract content, generate a daily Leaflet PDF brief in Orbital Light style. This is an automation layer, not a core product feature.

### Phase 5: Zettelkasten / Living Documents
The idea that a Leaflet PDF document could be annotated and amended as you learn. "I learned this from Document A, but Document B contradicts the claim on page 3." Connects to Obsidian-style note-taking workflow. Long-term vision item.

---

## Source Material Available for Reuse

V1 project documentation contains:
- `BOOK_ARCHITECTURE.md` — book structure model (parts/chapters/sections)
- `PEDAGOGY_RULES.md` — teaching methodology (useful for defining the transformation framework)
- `VALIDATION_CHECKLISTS.md` — quality gate framework
- `CONTENT_MODELS.md` — metadata schemas
- `VOCABULARY_AND_GLOSSARY_MODEL.md` — term definition rules
- `TRANSFORMATION_RULES.md` — input type transformation logic

The v1 architecture was over-engineered for the problem. Do not port the 6-stage pipeline or the PostgreSQL/Redis/Celery stack into v2 without explicit scope justification. Start simpler.

The Learning Document Playbook (10-technique pedagogical framework) defines how Leaflet PDF restructures transformation input. This is the canonical reference for the restructuring logic.
