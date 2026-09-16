---
title: "I Built a Second Brain That Actually Knows Me"
date: "2026-05-24"
tags: ["builds", "ai", "obsidian", "knowledge", "systems"]
summary: "How I turned a plain-text Obsidian vault into a knowledge graph an AI can read: every person, idea and decision, linked and searchable for good."
kicker: "Second Brain"
heroImage: "/images/thumb-second-brain.svg"
heroAlt: "A neural network graph of interconnected notes and people."
heroCaption: "Plain text, linked, readable by any model."
status: "published"
---

I had a one-hour coffee with a mentor six months ago. Good conversation, a few ideas, a couple of names dropped. I went home, made a voice memo on the drive back, and forgot about it. That used to be the end of the story. The memo would sit in a folder, never opened again.

## What happened instead

I dumped the voice memo into a daily note, raw and unstructured. Maybe 400 words of messy prose: her name, a few concepts she mentioned, a mutual connection we discovered, one idea about somatic leadership that stuck.

Later that week an AI ran through my inbox and pulled out what was worth keeping. It made a person note for her, linked to every other time she'd shown up in my vault. It made a concept note on embodied leadership, connected to other things I'd read about physiology and decision-making. And it made a note linking her to another person in my network.

Three months later I was heading into a second meeting with her, and I asked my vault: what's the most specific question I could ask her, given everything I know about her? It came back with something I couldn't have assembled myself. It pulled from the original conversation, from the mutual connection, and from the embodied leadership concept she'd introduced, and put together a question specific enough that she stopped mid-sentence when I asked it. That's when I knew the system was working.

## How it's built

The whole thing runs on Obsidian, Markdown files, and a weekly AI extraction pass. No proprietary app, no subscription. Plain text in folders, in three layers.

Capture. Daily notes are the inbox. Voice memo, shower thought, meeting notes, random idea, all of it goes in as-is. Messy is fine. The goal is zero friction.

Structure. Once a week I run a batch extraction. An AI reads the inbox and promotes anything durable. A name becomes a person note. A recurring idea becomes a concept note. A decision becomes a log entry. Everything gets cross-linked.

Compound. Every new entry strengthens the network. The person note for my mentor now has two years of context behind it. The concept note on embodied leadership is connected to three people and two other ideas. Ask a question and the AI answers using the whole graph as context.

## Why plain text

Every app that stores your knowledge in a proprietary format is a single point of failure. The notes app pivots, the startup shuts down, the export is broken. Plain Markdown files don't rot. They work with every AI model today and will work with whatever exists in ten years, and they can be read, searched and handed to a model as context without special tooling.

## What the graph looks like

It's colour-coded by zone. Cyan is people: mentors, classmates, contacts. Blue is learnings distilled from books, courses and conversations. Orange is self-knowledge: values, career narrative, annual reviews. Purple is recurring patterns I'm tracking across years. Yellow is maps of content, the navigation hubs that link zones together.

Every person node links outward. Every learning links back to the person who introduced it. The graph ends up as a map of how my thinking moves rather than a filing cabinet.

## The 20-minute week

Maintenance is about 20 minutes a week. I dump daily notes as I go (voice memos, rough thoughts, meeting notes). Once a week the extraction pass reads the inbox and promotes what's worth keeping. Then I review the promoted notes and fix any links.

## What surprised me

I expected the system to be useful as a reference, a place to look things up. What I didn't expect was how it changed the quality of my questions. When you have a structured record of someone's ideas, their context, and how their thinking connects to other people you know, you stop asking generic questions. You start asking questions that can only exist because you've been paying attention for a long time. That shift, from looking things up to putting things together, is where the value is, and it only happens once the system has enough context to work with.

## The stack

Obsidian for a local Markdown vault with no cloud dependency. Plain .md files. Wikilinks in double brackets as the connective tissue. Claude for the weekly extraction pass and for questions over the graph. YAML frontmatter for metadata, and the Dataview plugin for views across the vault. No complex automation, just a system that rewards consistency.

If you've been meaning to build something like this and keep putting it off, start small. One daily note, one weekly extraction, one question asked of your vault.
