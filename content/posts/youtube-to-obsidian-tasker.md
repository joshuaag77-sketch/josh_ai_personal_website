---
title: "One Tap from YouTube to a Structured Note in Obsidian"
date: "2026-05-24"
tags: ["builds", "automation", "obsidian", "second-brain"]
summary: "I wired together Tasker, a transcript API, and Claude so that sharing any YouTube video drops a structured, AI-formatted note straight into my knowledge vault."
kicker: "Second Brain"
heroImage: "/images/thumb-yt-obsidian.svg"
heroAlt: "Pipeline showing YouTube flowing into a structured Obsidian note via automation."
heroCaption: "Share once. Structured note, permanently in the vault."
interactive: "workflow-demo"
status: "published"
---

I tap Share on a YouTube video. Choose *YT to Obsidian* from the share sheet. Thirty seconds later, a structured note is sitting in my Obsidian inbox — title, summary, key ideas, tags, source link, date captured.

One tap. No copy-paste. No "I'll come back to this."

## The problem it solves

I was losing ideas the moment I found them.

Not because I wasn't paying attention. Because the gap between *finding something useful* and *doing something durable with it* was just wide enough that I never crossed it. A video would get saved to Watch Later. A link would get texted to myself. A screenshot would sit in a camera roll.

That's not a second brain. That's a junk drawer with good intentions.

The thing I actually wanted: something that captures useful content at the moment I find it — without breaking flow — and drops it somewhere it can compound.

## What it does now

===WORKFLOW_DEMO===

The phone grabs the YouTube link, pulls the full video transcript via API, sends it to Claude with a formatting prompt, and writes the output as a Markdown file directly into my Obsidian vault.

The note that comes out isn't a transcript dump. It's a structured inbox entry: a useful title, a tight summary, the key ideas pulled out, relevant tags, and the source metadata. Everything a future AI search — or my future self — needs to actually use it.

The difference between a saved YouTube link and a structured note is the difference between a receipt in your pocket and an entry in your ledger. One is technically preserved. One is actually useful.

## Why this matters for the second brain

I've been building an [AI-native Obsidian vault](/posts/ai-second-brain-obsidian) — a knowledge graph that compounds over time. The core idea is that every person, concept, and idea you capture gets linked to every other relevant thing you've ever captured, and an AI can reason over all of it.

The graph only works if what goes in is structured. A raw YouTube link teaches the system nothing. A note with proper tags and a clear summary is a node the graph can actually use — searchable, linkable, connectable to other things you're thinking about.

This workflow is capture infrastructure. It makes the graph stronger every time I tap Share.

## Where it goes from here

YouTube was just the first pipe to wire up. The pattern is reusable for anything:

- Podcasts → transcript → note
- Articles → reader view → summarized note
- Voice memos → transcription → concept note
- PDFs and papers → key ideas extracted → evergreen note
- Meeting notes → raw dump → structured entry

The template changes. The pipeline stays the same.

```
Capture content
  → Extract the useful material
  → Structure it with AI
  → Save somewhere durable
  → Let it compound
```

That's the whole idea. Most people still treat AI as a separate destination — open a chat window, ask something, copy the output somewhere. What I'm after is something different: AI that disappears into the workflow, doing the formatting work silently so the note just shows up where it belongs.

The value isn't the model. It's the system around the model.

One tap from YouTube to Obsidian. Five hours of debugging to get here.

Absolutely worth it.
