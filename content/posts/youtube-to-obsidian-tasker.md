---
title: "One Tap from YouTube to a Structured Note in My Second Brain"
date: "2026-05-24"
tags: ["builds", "automation", "obsidian", "second-brain"]
summary: "I wired Tasker, a transcript API, and Claude together so sharing any YouTube video automatically creates a structured, AI-formatted note inside my Obsidian knowledge vault. Here's the system."
kicker: "Second Brain"
heroImage: "/images/thumb-yt-obsidian.svg"
heroAlt: "Pipeline showing YouTube flowing into a structured Obsidian note."
heroCaption: "Share once. Structured note, permanently in the vault."
interactive: "workflow-demo"
status: "published"
---

I tap Share on a YouTube video. Choose *YT to Obsidian* from the share sheet. Thirty seconds later, a structured note is sitting in my Obsidian vault — title, summary, key ideas, tags, source link, date captured.

One tap. Zero friction. The idea is captured before I talk myself out of it.

## The problem

I was losing good ideas the moment I found them.

Not because I wasn't paying attention — because the gap between *finding something useful* and *doing something durable with it* was just wide enough to fall through. Videos got saved to Watch Later. Links got texted to myself. Screenshots piled up. 

That's not a second brain. That's a junk drawer with good intentions.

What I wanted: capture useful content at the moment I find it, without breaking flow, and have it land somewhere it can actually compound.

## What it does

===WORKFLOW_DEMO===

The phone grabs the YouTube link, pulls the full video transcript via API, sends it to Claude with a formatting prompt, and writes the output as a Markdown file directly into my Obsidian vault.

The note that comes out isn't a transcript dump. It's a structured inbox entry — a useful title, tight summary, key ideas pulled out, relevant tags, source metadata. Everything a future AI search, or my future self, needs to actually use it.

The difference between a saved link and a structured note is the difference between a receipt in your pocket and an entry in your ledger. One is technically preserved. One is actually useful.

## Why this matters — the second brain angle

I've been building an [AI-native Obsidian vault](/posts/ai-second-brain-obsidian) — a knowledge graph where every person I meet, idea I encounter, and decision I make gets linked to everything else I've ever captured. An AI can reason over the whole thing.

This is what mine looks like:

![My Obsidian knowledge graph — every node a person, idea, or concept I've captured](/images/obsidian-graph.svg)

The graph only works if what goes in is structured. A raw YouTube link teaches the system nothing. A note with a clear summary, relevant tags, and wikilinks to related concepts becomes a node the graph can actually use — searchable, linkable, connectable to things you were thinking about months ago.

This workflow is capture infrastructure. It makes the graph stronger every time I tap Share.

## The pattern is reusable

YouTube was just the first pipe to wire up. The same flow works for anything:

- Podcasts → transcript → note
- Articles → reader view → summarized note
- Voice memos → transcription → concept note
- PDFs → key ideas extracted → evergreen note
- Meeting notes → raw dump → structured entry

```
Capture content  →  Extract the useful material
  →  Structure it with AI  →  Save somewhere durable
    →  Let it compound
```

The template changes. The pipeline stays the same.

---

Most people still treat AI as a separate destination — open a chat window, ask something, copy the output elsewhere. What I'm building is different: AI that disappears *into* the workflow, doing the formatting work silently so the note just shows up where it belongs.

> The value isn't the model. It's the system around the model.

One tap from YouTube to Obsidian. Five hours of debugging to get there.

Absolutely worth it.
