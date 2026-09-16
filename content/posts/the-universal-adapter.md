---
title: "The Universal Adapter"
date: "2026-09-13"
tags: ["ai", "physical-ai", "standards", "energy"]
summary: "MHS gives an AI a common software interface and an instruction sheet for machines that already have digital controls. Once a machine has a driver, one agent can run a workflow across machines nobody programmed to work together."
kicker: "Field Notes"
heroImage: "/images/thumb-universal-adapter.svg"
heroAlt: "Five factory machines, an MHS driver under each, one AI agent connected to all five."
hideHero: true
status: "published"
featured: false
---

In August, a team at Carnegie Mellon connected four lab machines that lived on three computers that didn't talk to each other. Then they ran a full experiment through the whole chain, the kind where you test a drug at ten doses and plot the curve. Eight hours, start to finish, including a rerun the system decided to do on its own. Their estimate for a vendor-built automated setup was several weeks.

The thing that made the difference is called the Model Hardware Standard. Anthropic previewed it on August 27. I think it's one of the more important AI announcements this year, and the idea is simple once you see the chain.

## The chain

Here is the whole thing in one line:

**AI agent → MHS software driver → the machine's existing programmable interface → the physical machine.**

MHS is not a box you bolt onto a machine. It's a software driver and a specification. The machine's own controller still moves the motor, heats the nozzle, or turns the robot joint, exactly as it does today. MHS gives an AI a standard way to understand that controller and send it commands.

===MHS_FACTORY===

## What the driver does

An MHS driver does two things. It translates a machine's existing controls into a common interface. Underneath, that's a small set of commands, read this value, set that one. A CNC mill and an inspection camera look the same to the AI at that level.

And it gives the AI a reference sheet. What the machine can do. What it can measure. What limits it must obey. The kind of information that today lives in a paper manual or in the head of the one technician who has run the rig for a decade. You write it in plain language, or let an agent interview you about the setup, and the driver turns it into a sheet the AI reads before it sends a command.

One prerequisite matters. MHS works with equipment that already has a programmable interface, and each machine still needs its own MHS driver written. An agent can't walk up to arbitrary hardware and take over. But once a machine has a driver, any agent can discover it and control it through the same interface it uses for every other machine.

## The software version of this already happened

Two years ago, every AI tool needed a hand-built integration for every app it wanted to touch. Then Anthropic published the Model Context Protocol, which gave AI a standard way to connect to software tools. It went from 100,000 downloads a month to 97 million in eighteen months.

Anthropic wants MHS to do the same thing for physical equipment.

## Why this is different from normal automation

I spent five years around industrial equipment at Enbridge, so my first reaction was, we already automate machines. Plants run on PLCs and OPC UA. Labs run on SiLA. Robots run on ROS. All of that works, and MHS doesn't replace any of it. The difference is what sits on top of it.

Traditional automation is sensor, predefined logic, actuator. "If pressure exceeds X, open this valve." An engineer writes that rule in advance, and it does exactly that, forever.

MHS plus an agent is goal, understand the available equipment, plan a sequence, command the machines, observe the result, adapt. "Run these samples, inspect the result, and change the next run if something looks wrong." Nobody hard-coded that sequence. The agent assembled it from what the reference sheets said each machine could do.

The change is that one general-purpose agent can run a workflow across machines that were never programmed to work together. That used to take a specialist weeks per workflow.

The industrial world seems to be moving toward the same junction from its own side. The OPC Foundation is making more than 430 of its companion specifications easier for AI systems to consume through RAG and MCP. The existing industrial layers and the AI-facing ones look like they are meeting in the middle.

## What the pilots actually showed

The numbers are in the strip above. The prose is for what they mean.

The QuEra story is the one I keep thinking about. Claude was given a laser that needed relocking whenever it drifted. It didn't run the laser by reasoning about it every time. It explored, watched the beam through a camera, adjusted, watched again, over hundreds of runs. Then it wrote a plain Python controller that does the job as one deterministic script. In blind testing, that script recovered 695 of 700 induced faults. The exploration was the AI. The finished product was ordinary code a person can read, running with no model in the loop. That is a better shape for physical AI than a model with its hand on a valve.

At Genentech, the agent set different pipetting speeds on its own for water and for a thick protein solution, which is the kind of adjustment a careful technician makes. Then a step started foaming. Claude read the error and kept retrying the same step in the same vessel. It understood the error code. It didn't understand that bubbles are a physical problem, and that the fix was to change vessels rather than to try again. A scientist had to explain that.

## The boundary

Several pilots hit the same wall. Connecting a machine is easier than understanding its physics. The reference sheet tells the agent what it can read, what it can change, and the limits. It does not tell it why a process failed, or what an experienced engineer would make of that failure. That still comes from a person who has spent years watching things foam.

## How early this is

It's a research preview. It isn't open source yet. Every published example runs on Claude, though the standard is model-agnostic by design. The results are partner-reported and preliminary, and nobody outside the preview has replicated them. Whether it gets adopted widely is uncertain, and a standard nobody outside the preview can download is still a promise.

## Where this could go

This last part is my extrapolation, not something the pilots demonstrated.

If MHS works at scale, the expensive part of automation shifts. Less effort goes into making incompatible machines talk. More value sits in knowing what those machines should do, what can go wrong, and how the physical process actually behaves.

That knowledge already exists, in the technician who knows a pump must never run dry and the scientist who knows foam means change the vessel, not retry the command. MHS is the first standard I've seen with a place to write that down. Someone still has to know it.

---

*A note on sourcing. The pilot numbers are partner-reported and preliminary. I've kept the ones that are specific enough to be wrong.*

**Sources**

1. Anthropic, [Previewing the Model Hardware Standard](https://www.anthropic.com/news/model-hardware-standard-research-preview), August 27, 2026.
2. CNBC, "Anthropic pushes into physical world with new standard to help AI agents operate machines," August 27, 2026.
3. The Decoder, [Anthropic wants to do for physical hardware what its Model Context Protocol did for software](https://the-decoder.com/anthropic-wants-to-do-for-physical-hardware-what-its-model-context-protocol-did-for-software/).
4. Kingy.ai, [What MHS Actually Changes](https://kingy.ai/blog/anthropic-model-hardware-standard-mhs/). Partner case-study details.
5. Brinvik Journal, [Anthropic MHS: what it is and what the pilots showed](https://brinvik.com/en/journal/anthropic-mhs-model-hardware-standard-explained). The OPC Foundation note.
6. MCP adoption figures: [the 2026 MCP roadmap](https://blog.modelcontextprotocol.io/posts/2026-mcp-roadmap/) and the May 2026 registry count from digitalapplied.com.
