---
title: "One Tap from YouTube to a Structured Note in My Second Brain"
date: "2026-05-24"
tags: ["builds", "automation", "obsidian", "second-brain"]
summary: "I wired Tasker, a transcript API and Claude together so sharing any YouTube video from my phone creates a structured note in my Obsidian vault. Here's the system."
kicker: "Second Brain"
heroImage: "/images/thumb-yt-obsidian.svg"
heroAlt: "Pipeline showing YouTube flowing into a structured Obsidian note."
heroCaption: "Share once. The note lands in the vault."
interactive: "multi"
status: "published"
---

I tap Share on a YouTube video and pick YT to Obsidian from the share sheet. Thirty seconds later a structured note is sitting in my Obsidian vault: title, summary, key ideas, tags, source link, date captured. The idea is captured before I talk myself out of it.

## The problem

I was losing good ideas the moment I found them. The gap between finding something useful and doing something durable with it was just wide enough to fall through. Videos got saved to Watch Later. Links got texted to myself. Screenshots piled up. That's a junk drawer with good intentions, not a second brain.

## What it does

===WORKFLOW_DEMO===

The phone grabs the YouTube link, pulls the full transcript through an API, sends it to Claude with a formatting prompt, and writes the output as a Markdown file straight into my Obsidian vault.

The note that comes out isn't a transcript dump. It's a structured inbox entry with a useful title, a tight summary, key ideas, tags and source metadata. Everything a future search, or my future self, needs to use it.

## How it works

One Android automation, two API calls, and an Obsidian folder.

When I find a useful video, I tap a custom share button on my phone. [Tasker](https://tasker.joaoapps.com/) receives the shared link, URL-encodes it, and sends it to [Supadata](https://supadata.ai/) to pull the transcript. Tasker then sends that transcript to the [Claude API](https://platform.claude.com/docs) with a prompt that turns it into a clean Markdown note, and writes the file into my [Obsidian](https://obsidian.md/) inbox.

===PIPELINE_SECTION===

## Why it matters

I've been building an [Obsidian vault an AI can read](/posts/ai-second-brain-obsidian), a knowledge graph where every person I meet, idea I run into and decision I make gets linked to everything else I've captured.

![My Obsidian knowledge graph: every node a real person, concept or idea from the vault](/images/obsidian-graph.svg)

The graph only works if what goes in is structured. A raw YouTube link teaches the system nothing. A note with a clear summary, tags and links to related concepts becomes a node the graph can use, searchable and connectable to things I was thinking about months ago. This workflow is capture infrastructure. The graph gets a little stronger every time I tap Share.

## The pattern is reusable

YouTube was just the first pipe. The same flow works for podcasts (transcript to note), articles (reader view to summary), voice memos (transcription to concept note) and PDFs (key ideas to an evergreen note). The template changes and the pipeline stays the same.

Most people still treat AI as a separate destination: open a chat window, ask something, copy the output somewhere else. What I'm building is AI that disappears into the workflow so the note shows up where it belongs. One tap from YouTube to Obsidian. Five hours of debugging to get there, and worth it.

*The whole build was guided by [Claude Code](https://claude.ai/code), from wiring the Tasker flow to diagnosing the variable bugs. It's a different experience having an AI that can hold the full context of what you're building and think through the handoffs with you.*
