---
title: "I Didn't Know How to Code. So I Built an AI Agent Anyway."
date: "2026-02-18"
tags: ["builds", "agents", "automation", "raspberry-pi"]
summary: "From zero to a working Telegram-to-email agent in one day on a Raspberry Pi."
kicker: "First Project"
heroImage: "/images/ai-agent-pi.svg"
heroAlt: "Diagram of an AI agent pipeline running on a Raspberry Pi."
heroCaption: "Text in. Actions out. A tiny box doing real work."
status: "published"
---

I didn't know how to code. I still built the agent.

Everyone online was flexing these insane ClawDBot setups running on Mac Minis. Looked sick. I wanted one.

Problem: I was not about to drop a stack just to experiment.

So instead I bought a Raspberry Pi and said screw it -- I am building my own.

## The chaos phase

I opened Cursor, fired up Claude Code, barely knew what I was doing, and just started wiring things together. APIs, keys, errors, crashes, things breaking for no reason -- the usual chaos.

Somehow, it started to click. The small wins stacked up.

## The moment it worked

Now I can literally text a Telegram bot:

> Email this guy and tell him I'll send the file tomorrow.

It takes the message, structures it, sends it through an AI model, cleans it up, and automatically sends the email.

I tested it by spamming my brother like 20 times. It worked every time.

## The build map

**Stack**

- Raspberry Pi
- Cursor + Claude Code
- Telegram Bot API
- SMTP email sender
- One stubborn human

**Message flow**

```
Telegram
  -> Intent parser
  -> AI model
  -> Output cleaner
  -> Email sender
```

## The real shift

What's wild is not that it works.

It's that I built it in a day, starting basically from zero.

I used to think building systems like this required years of coding. Turns out it mostly requires curiosity and the willingness to break things until they work.

This is just version one. Next I am adding memory, more tools, more context -- basically turning it into a real agent instead of a one-trick script.

> AI is not just a tool you use anymore. It is infrastructure you can build.

And once you realize that, you start seeing systems everywhere.

