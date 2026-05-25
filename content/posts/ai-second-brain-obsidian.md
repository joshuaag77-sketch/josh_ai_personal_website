---
title: "I Built a Second Brain That Actually Knows Me"
date: "2026-05-24"
tags: ["builds", "ai", "obsidian", "knowledge", "systems"]
summary: "How I turned a plain-text Obsidian vault into an AI-native knowledge graph that compounds over time — every person, idea, and decision, indexed and queryable forever."
kicker: "Second Brain"
heroImage: "/images/thumb-second-brain.svg"
heroAlt: "A neural network graph of interconnected notes and people."
heroCaption: "Plain text. Linked ideas. AI-queryable forever."
status: "published"
---

I had a one-hour coffee with a mentor six months ago.

Good conversation. A few ideas. A couple of names dropped. I went home, made a voice memo on the drive back, and forgot about it.

That used to be the end of the story. The memo would sit in some folder, never opened again.

Now it's different.

## What actually happened

I dumped the voice memo into a daily note. Raw, unstructured. Maybe 400 words of messy prose — her name, a few concepts she mentioned, a mutual connection we discovered, one idea about somatic leadership that stuck.

Later that week, an AI ran through my inbox and pulled out the signal:

- One person note for her, linked to every other time she'd shown up in my vault
- One evergreen concept note on embodied leadership, connected to other things I'd read about physiology and decision-making
- One connection note between her and another person in my network

Three months after that conversation, I was heading into a second meeting with her. I asked my vault:

> *What's the most unique question I could ask her, given everything I know about her?*

It came back with something I couldn't have assembled myself. It pulled from the original conversation, from the mutual connection note, from the embodied leadership concept she'd introduced — and synthesized something specific enough that she actually stopped mid-sentence when I asked it.

That's when I realized the system was working.

---

## The architecture

The whole thing runs on Obsidian, Markdown files, and a weekly AI extraction pass. No proprietary app. No subscription lock-in. Just plain text in folders.

**The three layers:**

**Capture** — daily notes are the inbox. Voice memo, shower thought, meeting notes, random idea — all goes in as-is. Messy is fine. The goal is zero friction.

**Structure** — once a week, I run a batch extraction: an AI reads the inbox and promotes anything durable. A name becomes a person note. A recurring idea becomes an evergreen concept. A decision becomes a log entry. Everything gets cross-linked.

**Compound** — every new entry strengthens the network. The person note for my mentor now has two years of context behind it. The concept note on embodied leadership is connected to three people and two other ideas. Ask a question and the AI answers using the whole graph as context.

---

## Why plain text is the key move

Every app that stores your knowledge in a proprietary format is a single point of failure. The notes app pivots. The startup shuts down. The export is broken.

Plain Markdown files never rot. They work with every AI model, today and in ten years. They can be read, searched, and passed as context to any model without any special tooling.

The format compounds. The proprietary app doesn't.

---

## What the graph looks like now

Color-coded by zone:

- **Cyan** — people I've met, mentors, classmates, contacts
- **Blue** — learnings distilled from books, courses, conversations
- **Orange** — self-knowledge: values, career narrative, patterns, annual reviews
- **Purple** — recurring patterns I'm tracking across years
- **Yellow** — MOCs (maps of content): navigation hubs linking zones together

Every person node I add links outward. Every learning links back to the person who introduced it. The graph is a map of how my thinking actually moves — not a filing cabinet.

---

## The 20-minute week

The whole maintenance cadence is 20 minutes a week.

- Dump daily notes throughout the week (voice memos, rough thoughts, meeting notes)
- One extraction pass: AI reads the inbox and promotes signal
- Review promoted notes, fix any links, close the loop

That's it. Twenty minutes a week. Forever-valuable output.

---

## What surprised me

I expected the system to be useful as a reference — a place to look things up. What I didn't expect was how it changed the quality of my questions.

When you have a structured record of someone's ideas, their context, and how their thinking connects to other people in your network, you stop asking generic questions. You start asking questions that can only exist because you've been paying attention for a long time.

That shift — from retrieval to synthesis — is the actual value. And it only happens when the system has enough context to work with.

The longer you build, the sharper it gets.

---

## The stack

- **Obsidian** — local Markdown vault, no cloud dependency
- **Plain `.md` files** — future-proof, AI-native
- **Wikilinks** (`[[double brackets]]`) — the connective tissue
- **Claude** — weekly extraction pass, Q&A over the graph
- **Frontmatter YAML** — metadata for filtering and querying
- **Dataview plugin** — dynamic views across the vault

No magic. No complex automation. Just a system that rewards consistency.

---

If you've been meaning to build something like this and keep putting it off — start small. One daily note. One weekly extraction. One question asked of your vault.

The graph will tell you if it's working.
