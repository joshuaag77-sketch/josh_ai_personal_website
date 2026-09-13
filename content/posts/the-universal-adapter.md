---
title: "The Universal Adapter"
date: "2026-09-13"
tags: ["ai", "physical-ai", "standards", "energy"]
summary: "MCP gave every piece of software the same plug. Anthropic's Model Hardware Standard gives every piece of hardware the same plug, and a label written for a model to read. Scroll the bench to see it happen."
kicker: "Field Notes"
heroImage: "/images/thumb-universal-adapter.svg"
heroAlt: "Three lab machines, an amber MHS adapter on each port, one AI node connected to all three."
hideHero: true
status: "published"
featured: false
---

===MHS_BENCH===

In August, a team at Carnegie Mellon connected four machines that lived on three computers that didn't talk to each other: a robot that pipettes liquids, a reader that scans the results, a robotic arm, and a set of cameras. Then they ran a full experiment through the whole chain, the kind where you test a drug at ten doses and plot the curve. It took eight hours, start to finish. Their estimate for doing it the normal way, through the vendors, was several weeks.

The thing that made the difference is called the Model Hardware Standard. Anthropic previewed it on August 27. I think it's one of the quieter important things to come out of AI this year, and I want to explain it without the jargon, because the idea is simple once you see it. I might be overrating it. I'll say where I think that risk is.

## The plug problem

Every serious machine in a lab or a plant ships with its own port and its own software. A microscope has one program. A 3D printer has another. A robot arm has a third. None of them know the others exist. If you want the arm to move a sample into the microscope and then read the result, a person either does it by hand or someone spends weeks writing a custom translator between the two.

Software had this exact problem two years ago. Every AI tool needed a hand-built integration for every app it wanted to touch. Then Anthropic published the Model Context Protocol, one standard plug that any app could expose and any AI could connect to. It went from 100,000 downloads a month to 97 million in eighteen months. There are close to 10,000 MCP servers in the public registry now. It became the plug.

MHS is the same move, one floor down. It's a universal adapter for physical things.

## What the adapter does

You snap an MHS driver onto a machine. It does two jobs.

First, it gives the machine a standard plug. Every device speaks the same small set of commands, read this, set that. A microscope and a robot arm look the same to an AI at the plug. And the devices announce themselves on the network, so an agent can find a new machine without anyone writing a translator.

Second, and this is the part I find genuinely new, the driver carries a label written in plain English. What this machine is. Which knobs it has. How heavy the arm is. What temperature the nozzle must never pass. The kind of information that today lives in a paper manual, or in the head of the one technician who has run the rig for a decade. You write it in, or you let an agent interview you about the setup, and the driver turns it into a reference sheet the AI reads before it touches anything.

> Industrial standards were always written for machines to read. This one is written for a model to read.

## Why this is different from what plants already have

I spent five years around industrial equipment at Enbridge, so my first reaction was, we already have this. Plants run on OPC UA. Labs run on SiLA. Robots run on ROS. Device standards aren't new.

But those standards were built for one machine to talk to another machine, with every field defined ahead of time. There's no place in OPC UA to write "this arm weighs twelve kilograms and should slow down near samples" in a sentence, because a controller has no use for a sentence. A language model does. That's the whole gap MHS fills. It isn't a replacement for the old standards. It's the layer that lets an agent make sense of equipment it has never seen.

Picture a compressor station. Forty instruments, four vendors, and one operator who knows that the third unit runs hot on cold mornings and you wait ten minutes before you trust its reading. None of that is in the tag database. It's in his head. MHS is the first standard I've seen that has a place to write it down.

The old world seems to agree. In April, the OPC Foundation announced it's preparing more than 430 of its companion specifications so they can be read by AI systems over MCP. Two worlds, walking toward the same door from opposite sides.

## What it actually did

The numbers from the first six partners are in the strip under the bench. They're worth reading slowly, because they aren't marketing numbers. Carnegie Mellon's eight hours. QuEra's laser going from 58% to 99.3% success. Janelia collapsing seven vendor programs into one screen. Washington wiring six instruments in under a week. Tetsuwan running 9,143 liquid transfers and beating the manufacturer's precision spec by about 12%.

The QuEra story is the one I keep thinking about. Claude didn't run the laser by reasoning about it every time. It poked at it, watched the beam through a camera, adjusted, watched again, and then wrote a plain Python script that does the alignment as one command. The exploration was the AI. The final product was ordinary code that a person can read. That's a much better shape for physical AI than a chatbot with its hand on a valve.

## The catch

At Genentech, a pipetting step started foaming. Claude read the error, and kept retrying the same step in the same vessel. It understood the error code perfectly. It didn't understand that bubbles are a physical problem, and that the fix was to change vessels, not to try again. A scientist had to explain that.

Every one of the six pilots hit a version of this wall. The adapter tells the AI what's safe to turn. It doesn't tell it why the experiment failed. The plumbing got solved in eight hours. The physics still needed someone who had spent years watching things foam.

It's also early. There's no public spec yet, no SDK, no license, no open-source date. Every demo so far runs on Claude. The safety questions about who is allowed to discover a device and issue it a command aren't answered in public. This is a research preview, not a product. That's the part where I might be overrating it: a standard nobody outside the preview can download is still a promise.

## What gets scarce next

When the cloud standardized infrastructure, the scarce skill in software stopped being "can you set up a server" and became "do you know what to build." I think MHS starts the same shift for physical operations. Getting machines to talk was the expensive part for a long time. Now it's a driver and an afternoon.

What's left is the label. Somebody has to know that the arm should slow down near samples, that this pump must never run dry, that foam means change the vessel. That knowledge was always the valuable part. It was just buried under the integration work. Now it's the whole job.

---

*A note on sourcing. The pilot numbers are partner-reported and preliminary. Nobody outside the preview has replicated them. I've kept the ones that are specific enough to be wrong.*

**Sources**

1. Anthropic, [Previewing the Model Hardware Standard](https://www.anthropic.com/news/model-hardware-standard-research-preview), August 27, 2026.
2. CNBC, "Anthropic pushes into physical world with new standard to help AI agents operate machines," August 27, 2026.
3. The Decoder, [Anthropic wants to do for physical hardware what its Model Context Protocol did for software](https://the-decoder.com/anthropic-wants-to-do-for-physical-hardware-what-its-model-context-protocol-did-for-software/).
4. Kingy.ai, [What MHS Actually Changes](https://kingy.ai/blog/anthropic-model-hardware-standard-mhs/). Partner case-study details and the open-spec critique.
5. Brinvik Journal, [Anthropic MHS: what it is and what the pilots showed](https://brinvik.com/en/journal/anthropic-mhs-model-hardware-standard-explained). The SiLA 2 / OPC UA / ROS 2 comparison and the OPC Foundation note.
6. MCP adoption figures: [the 2026 MCP roadmap](https://blog.modelcontextprotocol.io/posts/2026-mcp-roadmap/) and the May 2026 registry count from digitalapplied.com.
