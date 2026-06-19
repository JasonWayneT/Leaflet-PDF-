---
title: "Product Brief: Bookit v2"
status: draft
created: 2026-06-18
updated: 2026-06-18
version: 0.1
---

# Product Brief: Bookit v2

## Executive Summary

Bookit is a personal content transformation tool that takes raw non-fiction content — articles, transcripts, notes, markdown files, YouTube videos — and produces structured, visually designed PDFs built for reading away from a screen.

Most digital content is written to be indexed, not learned from. Bookit applies cognitive science-backed learning design principles to reorganize any content for comprehension, then renders it in a visual style designed for immersion. The result is a portable, publication-quality reading artifact the user actually wants to open — something to take to a coffee shop, a park bench, or anywhere away from a desk.

The core constraint that makes this trustworthy: Bookit restructures how information is presented, not what the information says. Every factual claim in the output is validated against the source. It is not summarization — it is editorial design applied systematically.

---

## The Problem

Knowledge professionals consume enormous amounts of content — articles, wikis, YouTube transcripts, newsletters, reports — but the format that content arrives in is built for indexing and scanning, not for deep reading. White backgrounds, walls of unbroken text, no visual hierarchy — these aren't design failures. They're just optimized for the wrong goal.

The result is a growing backlog of "read later" content that never gets read. Not because the information isn't valuable — but because the experience of getting through it competes with everything else demanding attention. Annual reports and industry publications get read. Medium articles and wiki pages don't. The difference isn't the content. It's the design.

Valuable learning content is also locked to the environment where you found it — a browser tab, a wiki page, a YouTube transcript. That environment isn't portable. There's no tool that takes raw content you care about and produces something you'd actually want to take somewhere: structured for how you learn, formatted for your tablet, and styled to your taste.

The reading experience shapes whether you actually learn. When something is pleasant to look at and well-organized, you stay longer, go deeper, and bring it with you. That experience is available in professionally designed publications. It isn't available for the content most people actually want to learn from.

---

## The Solution

Bookit takes any piece of raw non-fiction content and produces a structured, visually designed PDF built for reading away from a screen. It does two things in sequence.

**First, it restructures.** The content is reorganized according to learning design principles — not rewritten, reorganized. The author's words and facts stay intact. The structure changes to serve the reader:

- Key ideas surface first (BLUF — Bottom Line Up Front)
- Headers teach rather than label
- Jargon is translated in context
- Facts are paired with their implications
- Dense sections are chunked into named mental buckets
- A 60-second cheat sheet closes every document

A source fidelity check runs against the original before output. The same information, better organized. No factual drift.

**Second, it renders.** The restructured content is laid out in Orbital Light — a high-contrast editorial visual style with bold display typography, structured framing, and color-coded section markers (blues, yellows, greens). The output is a PDF designed to be taken somewhere: a tablet, a park bench, a coffee shop. Something you actually want to open.

The experience is closer to reading a well-produced industry report than parsing a web page. That's the point.

---

## What Makes This Different

**Not summarization — reorganization.** Bookit preserves every factual claim from the source. It restructures how information is presented, not what the information says. A source fidelity validation pass prevents factual drift — the classic failure mode of AI content tools.

**Learning design, not just formatting.** The transformation applies a pedagogical framework rooted in cognitive science (BLUF, progressive disclosure, mental chunking, dual coding). This isn't a template applied to existing structure; it's a structural change that makes the content more learnable.

**Aesthetic-first output.** The visual style is a feature, not a wrapper. The design is built to create immersion — the same way a well-designed game UI makes you want to read the text within it. Reading something you enjoy looking at changes how long you stay with it.

**Portable by design.** The PDF format is intentional. Content becomes a reading artifact that travels with you, on any device, outside your normal work environment.

---

## Who This Serves

**Primary (v2 MVP):** A product professional who consumes large amounts of technical and professional content daily — articles, transcripts, documentation, YouTube explainers. Content he wants to learn deeply, not just skim. He reads on a tablet, often away from his desk, and values aesthetic experience as part of how he engages with material.

**Future users:** Any knowledge professional who wants to transform content they encounter into a format they actually prefer to read. The signal that Bookit has reached them: they start asking "how do I automate this so everything I want to learn goes through here first?"

---

## Success Criteria

**For v2 MVP:**
- The tool is used habitually — content goes in, the output is compelling, and it keeps getting used without forcing it
- The output PDFs are things worth taking somewhere: opened on a tablet, read away from the desk
- The content is actually learned from — not just formatted
- The reading experience feels immersive, not just legible

**The broader signal (future):**
- Users begin asking how to automate Bookit into their content intake workflows
- Bookit becomes the default layer between discovered content and personal learning — not an occasional tool, but a content funnel

---

## Scope

### In for v2 MVP
- **Input:** copy/paste text, `.md` and `.txt` files, YouTube URL (transcript extraction via `youtube-transcript-api`)
- **Transformation:** AI restructures content using the learning design framework — BLUF, mental buckets, translation boxes, progressive disclosure, facts → implications, teach-not-label headings, 60-second cheat sheet
- **Source fidelity validation:** output checked against source to prevent factual drift before PDF is produced
- **Output:** PDF rendered in Orbital Light visual style
- **Single user**

### Explicitly out for v2
- Article or website URL scraping
- Email and newsletter input
- Multiple visual style templates (Strategyzer style is a planned future option — see addendum)
- Critical thinking / alternatives layer
- Hermes / Gmail integration
- Multi-user, sharing, or collaboration features

---

## Vision

Bookit becomes the layer between the internet and how you learn from it. You don't consume raw content anymore — you Bookit it first. Every article, transcript, or document you care about becomes a personal reading artifact, structured for your comprehension and styled for your taste.

Over time, the platform supports multiple visual styles, automated content streams, and integration with tools like Hermes and Gmail. But its core value is always the same: raw content in, intentional reading experience out.
