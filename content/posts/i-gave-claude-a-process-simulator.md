---
title: "I Gave Claude a Process Simulator. It Found a Bug in the Simulator."
date: "2026-09-16"
tags: ["builds", "ai", "agents", "energy", "carbon-capture"]
summary: "I wanted to see how far an AI agent could get with real engineering software. It built a carbon capture flowsheet in DWSIM from Python, hit a wall, read the simulator's source code, and fixed it. Fifteen flowsheets, zero clicks."
kicker: "Builds"
heroImage: "/images/thumb-dwsim.svg"
heroAlt: "An absorber column and a compressor train, with one stage flagged."
heroCaption: "Fifteen flowsheets. Zero clicks. One bug that was not mine."
status: "published"
---

This week I asked Claude a question I was slightly embarrassed by: can I give you something bigger than a browser? Like Blender. Or HYSYS. I was half planning to buy a GPU for it.

The answer was no GPU needed, plus a short lesson I should have known already. There are four ways an AI can touch software, and they are not equal.

![The four doors: API, browser pane, Claude in Chrome, computer use](/images/dwsim-four-doors.png)

The one that matters is door one. If the software has an API, the AI never needs to see a screen. It sends commands and reads numbers back. Everything below that is slower and breaks more.

So we picked a job that would actually test it.

## The job

At Enbridge I worked on hydrogen and carbon capture. I know what a capture flowsheet should look like, which means I can grade the answer. That was the whole point. A demo you cannot grade is just a demo.

HYSYS needs a licence I do not have. DWSIM is the open-source equivalent, same idea, same thermodynamics, built mostly by one person, Daniel Wagner. Claude installed it with one command, hit a .NET runtime problem on the first call, fixed that, and fifteen seconds later had a blank flowsheet with 28 property packages and 1,488 compounds to play with.

The case: the CO2 capture block of a blue hydrogen plant. Shifted syngas comes in at 30 bar with 20% CO2. Cold methanol at minus 40 pulls the CO2 out. Hydrogen goes out the top. The CO2 gets flashed off the solvent, compressed to 150 bar and sent to a pipeline. My old world.

I actually asked for an amine plant first, the classic post-combustion setup. Claude checked what thermodynamics DWSIM ships with and said no: there is no amine package, so any MEA number would be made up. I would rather it tell me that than pretend. We switched to methanol.

## The bug

First run. The absorber converged. The product streams came out empty. Zero flow, and a mass balance error on hydrogen.

Claude tried the obvious things. A different column solver. A different condenser setting. Pressure set on every stage. Warm feeds instead of cold. Same error every time, in under a second.

Then it did something I would not have thought to do. It loaded DWSIM's own sample absorber through the same code, and that one worked. So the thermodynamics were fine and the API was fine. Something about how we connected the column was different.

It pulled the column's source code off GitHub. 5,700 lines of VB.NET. And found it. The helper that connects an absorber's top product labels that stream as a liquid distillate. An absorber has no condenser, so the liquid distillate is always zero. The GUI labels the same stream correctly, as overhead vapour. The API helper does not.

One line from Python to flip the flag. 95.5% capture, 0.24% hydrogen loss. The column had been right the whole time. Nobody was reading the answer.

I would have spent a day on that. Probably ended with a forum post.

## The rest of the plant

After that it went fast.

![The capture block as built through the API](/images/dwsim-flowsheet.png)

Precooler, absorber, two flash drums, a heater, four compressors with intercoolers, a pump, a makeup stream. The whole block solved in 1.1 seconds with zero errors. CO2 came out 98% pure. Compression to 150 bar cost 102 kWh per tonne, which matches the 90 to 120 you see in the literature.

Then the honest part. The first version used fresh methanol on every pass, which makes the capture number look great and the refrigeration number meaningless. So we closed the loop. DWSIM's own recycle block ran 50 iterations and gave up, because with a free solvent inventory the flow just drifts. Claude moved the loop into Python instead: fix the circulation, adjust the makeup to close the balance, copy the lean composition back until it stops moving. Three iterations. 2.4 seconds.

Capture dropped to 84.8%. That is the real number. The chiller and the regeneration heater came out almost equal, 2.8 MW against 2.7 MW, which is exactly why real plants put a rich/lean exchanger between them. The model found the reason for a piece of equipment we had not drawn yet.

## Twelve plants in sixteen seconds

Then the part that would have taken me days.

![Capture and power per tonne across twelve cases](/images/dwsim-sweep.png)

Solvent rate from 2,500 to 4,000 kmol/h, regeneration at minus 10, 0 and plus 10 degrees. Twelve flowsheets, sixteen seconds. Ninety percent capture needs 3,500 kmol/h with regeneration at 0. Warmer regeneration gives you leaner solvent, and you pay for it in refrigeration and in methanol boiling off: makeup goes from 4 to 19 kmol/h. The curves flatten near 93%, which says the 1.3 bar flash is the limit. The next design move is a stripper, and the model pointed at it before anyone asked.

## What it could not do

Two things, and both matter.

It could not do amines, and it said so. Good.

It could not take a screenshot of the flowsheet. It launched the DWSIM window and tried to grab the screen from a script, twice, and both times captured the wrong window. My Claude app, then my Chrome. It deleted both and stopped trying. That is door four in the picture up top. Pixels and guessing. The table said it would be flaky, and it was.

## What I actually think

The flowsheet is fine. What stuck with me is the debugging.

Every step it took is a step a good engineer takes. Separate the thermo from the interface. Find a case that works. Diff it against yours. When the docs run out, read the source. It did them in minutes instead of days, and it did not get tired or proud along the way.

A ThinkPad with integrated graphics did all of this in about two hours, detours included. The bottleneck was never compute. It was the way in.

This is version one. Next is a proper stripper instead of the flash, the rich/lean exchanger, and then HYSYS if someone lends me a licence.

The scripts and the run log are on my desktop, plain Python, under 200 lines. Happy to share if you want to point it at your own plant. And a thank you to Daniel Wagner and the DWSIM project: free, open, and good enough that an AI could read its insides and fix its own problem.

I'd love to hear what you would throw at it next.
