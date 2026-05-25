---
title: "Five Hours, One Button: My YouTube-to-Obsidian Capture Workflow"
date: "2026-05-24"
tags: ["builds", "automation", "obsidian", "tasker", "second-brain"]
summary: "I tap Share on a YouTube video and it lands as a structured note in my Obsidian vault. Here's how I wired it together — and the dumb bug that took most of the day."
kicker: "Second Brain"
heroImage: "/images/thumb-yt-obsidian.svg"
heroAlt: "Diagram of a phone sharing a YouTube link into an Obsidian note via Tasker and Claude."
heroCaption: "One tap. One structured note. Zero copy-paste."
status: "published"
---

I tap Share on a YouTube video. Choose *YT to Obsidian* from the share sheet. My phone grabs the transcript, sends it to Claude, and drops a structured note into my Obsidian inbox.

That's it. That's the whole thing.

Getting there took five hours. One Tasker variable was wrong.

## The actual problem

I consume a lot of useful content. YouTube, podcasts, articles, rabbit holes at midnight. The information is not the problem. The problem is what happens to it after.

My old system looked like this:

- Save to Watch Later
- Send myself a link
- Screenshot something
- Tell myself I'll organize it later
- Never organize it later

That's not a second brain. That's a junk drawer with better branding.

The version I wanted: tap once at the moment I find something useful, and have a structured note waiting for me in Obsidian. No friction. No later. Just captured.

And here's the part that matters beyond convenience -- a saved link is basically dead. A transcript is better. A structured note with a title, summary, key ideas, tags, and source metadata is something AI can actually reason over later.

The goal was never just to save videos. It was to feed the knowledge graph.

<!-- Image: share sheet screenshot showing "YT to Obsidian" in the Android share menu -->

## The full flow

```
YouTube share
  → Tasker receives the URL
  → Supadata pulls the transcript
  → Claude formats the note
  → Tasker writes the file
  → Obsidian inbox
```

One tap from YouTube. Structured note in Obsidian. AI happens in the middle and disappears.

## The stack

Nothing exotic.

- **Android share sheet** — the trigger
- **Tasker** — the glue that connects everything
- **Supadata** — pulls YouTube transcripts via API
- **Claude API** — summarizes and formats the note
- **Obsidian** — where the note lives permanently

Tasker is the part that makes it feel native. The workflow starts inside YouTube, not inside some separate app.

## Building it, step by step

### 1. Create the share trigger

In Tasker: *Event → Received Share*, named `YT to Obsidian`.

That name is what shows up in the Android share sheet. The workflow starts where the content already is.

### 2. Grab the YouTube URL

Here's the dumb bug that cost me most of the day.

I assumed Tasker passed the shared link through `%evtprm1` or `%astext`. Wrong. For a Received Share event, the correct variable is:

```
%rs_text
```

So the first action is just:

```
Variable Set
Name: %url
To: %rs_text
```

Once I saw the actual YouTube URL flash on screen I knew the share side was fixed. Before that I was debugging the wrong thing entirely.

Lesson: don't guess Tasker variables. Open the event variable list and use what Tasker actually gives you.

### 3. URL-encode the link

YouTube URLs have `?`, `&`, and `=` in them. Drop those raw into another API URL and things break.

```
Variable Convert
Name: %url
Function: URL Encode
Store Result In: %url_enc
```

### 4. Pull the transcript

```
GET https://api.supadata.ai/v1/transcript?url=%url_enc&text=true&lang=en
Header: x-api-key: YOUR_KEY
```

This is the real unlock. The system has just gone from "I saved a video" to "I have the underlying text."

### 5. Parse the transcript

A quick JavaScriptlet extracts the transcript text and stores it in a variable. Nothing complicated -- just clean text ready for the next step.

### 6. Send to Claude

Tasker posts the transcript to the Claude API with a prompt asking for:

- A useful title
- Concise summary
- Key ideas
- Practical takeaways
- Tags
- Source metadata
- Clean markdown

The instruction I care most about: *this is an inbox note, not a final essay*. Good enough to search, skim, and link. I can polish it later if it earns that.

<!-- Image: example output note in Obsidian — the Bezos/CNBC clip note -->

### 7. Parse Claude's response

Another JavaScriptlet extracts the note content into `%notes`.

This caused the second bug. At one point the workflow successfully created a file in Obsidian, but the file just said:

```
%notes
```

Tasker was writing the file before `%notes` actually existed. The fix was moving the parse step *before* the Write File step.

Obvious in hindsight. Brutal in the moment.

### 8. Write the file

```
Write File
Path: Obsidian/Daily Notes/Inbox/[timestamp].md
Text: %notes
```

Obsidian picks it up as a new note. Done.

<!-- Image: full Tasker task view showing all 8 steps -->

## The full Tasker flow

```
1. Variable Set        %url = %rs_text
2. Variable Convert    %url → URL Encode → %url_enc
3. HTTP Request        Supadata transcript
4. JavaScriptlet       Parse transcript → %transcript
5. HTTP Request        Claude API
6. JavaScriptlet       Parse response → %notes
7. Write File          Save %notes to Obsidian inbox
8. Flash               "Saved to Inbox"
```

That's it.

## What made it hard

The APIs were not the hard part.

The hard part was debugging the handoffs between steps. A variable exists in one step, doesn't exist in the next, and nothing tells you clearly what went wrong.

The most useful tool was embarrassingly simple: **Tasker Flash actions**.

I kept flashing variables on screen at each stage:

```
Flash: %url
Flash: %url_enc
Flash: %transcript
Flash: %notes
```

If Tasker flashes the literal variable name, the variable doesn't exist yet. That one rule would have saved me hours.

The three real fixes:
1. Use `%rs_text` for the shared URL -- not `%evtprm1`
2. URL-encode before sending to Supadata
3. Parse Claude's response *before* writing the file

Five hours for three tiny things. Classic.

## Where this fits in the second brain

I have been building out an AI-native Obsidian vault for a while now -- a knowledge graph of people, ideas, and decisions that compounds over time. [I wrote about the full architecture here.](/posts/ai-second-brain-obsidian)

The core problem I kept hitting: the graph only works if capture is easy enough that you actually do it.

If every useful video requires ten minutes of manual effort, the system fails. Not because it is bad in principle -- because real life does not cooperate with high-friction workflows.

If capture is one tap, the system has a chance.

This workflow is one piece of a larger pattern:

```
Capture content
  → Extract the useful material
  → Structure it with AI
  → Save it somewhere durable
  → Let it compound
```

The YouTube workflow handles the first three steps automatically. The note lands in my inbox, ready to be linked, promoted, or ignored depending on how valuable it turns out to be. Most will stay in the inbox. A few will become concept notes. Some will show up six months later when I'm thinking about something connected.

That's the point. Not every video is worth a full note. But having the note costs almost nothing now, and the upside is real.

## Where it goes next

Version one works. Here's what I want to add:

- Better templates based on content type (interview vs. lecture vs. essay)
- Automatic backlink suggestions to existing vault notes
- A "why this matters to me" section in the prompt
- Routing notes into the right folders automatically
- The same pattern extended to podcasts, articles, PDFs, voice memos

The pattern is reusable. YouTube just happened to be the first one I wired up.

## The actual takeaway

This was a small project. But it changed how I think about where AI is useful.

Most people still interact with AI as a destination. Open a chat window. Ask something. Copy the output somewhere else. That works, but it is clunky.

What I wanted was for the AI work to disappear -- to just be one step inside a larger workflow that starts in YouTube and ends in Obsidian.

> The value is not only in the model. The value is in the system around the model.

Can you capture the right input? Can you route it somewhere durable? Can you reduce the friction enough that the workflow survives real life?

That is what I was trying to build.

Now it works.

One tap from YouTube to Obsidian. Five hours of pain for one button.

Absolutely worth it.
