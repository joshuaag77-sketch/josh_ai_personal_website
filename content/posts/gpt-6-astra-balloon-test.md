---
title: "The Balloon Test: Building With GPT-6 Astra"
date: "2026-09-15T12:00:00Z"
tags: ["ai", "experiments", "learning-log"]
summary: "I asked GPT-6 Astra to build a convincing slow-motion water-balloon rupture. It produced a working interactive app, survived six critic rounds, and still missed the visual goal. Here's the full result and what I learned."
kicker: "Experiment Log"
heroImage: "/images/rupture-balloon-test.png"
heroAlt: "The actual Rupture render: a copper projectile leaving a red water balloon, with the exposed water still visibly synthetic."
hideHero: true
status: "published"
featured: false
---

===RUPTURE_EXPERIMENT===

I asked GPT-6 Astra to build a slow-motion scene of a bullet passing through a water balloon. I wanted the high-speed-camera moment: the skin gives way, the water briefly holds its shape, then stretches, breaks apart, and falls.

It produced a polished little experiment called **Rupture**. You could orbit the camera, change the conditions, pause the motion, and scrub through the impact. The controls worked. The page looked considered.

The central visual was disappointing. At one point I rated it roughly **1/10** because it barely read as a proper bullet hitting a balloon. I asked for a fundamental fix and three more critic rounds. The result improved, but it never became the convincing shot I had in mind.

I've kept the actual result above because a description of the work makes it sound more successful than watching it does.

## What I was testing

This was a practical test of GPT-6 Astra as a coding agent in Codex: could I describe a demanding visual effect, give feedback in ordinary language, and get something convincing back?

The brief had two parts. One was a usable application: replay, slow motion, camera controls, and settings for projectile speed, balloon size, impact height, gravity, surface tension, spray, and lighting. The other was the physical scene itself: an identifiable projectile, a local puncture, recoiling latex, and water that looked like water.

The build used native browser graphics, without Three.js or an external physics library. That constraint made the task harder. The agent had to construct the rendering and motion rather than assemble a ready-made fluid effect.

This was one experiment with a particular brief, tool setup, and sequence of feedback. It wasn't a controlled comparison with another model, and it doesn't establish a general limit on Astra's capabilities.

## The process, in plain English

The work started with recovery. There was an existing Rupture project, but its source repository was empty and the previous runtime wasn't recoverable. The agent rebuilt inside that same project. I required persistent source checkpoints and a resume log, including before every critic review, so another interruption wouldn't erase the work.

The first approach treated the water largely as a deforming outer skin, with extra droplets and stretched strands around it. Think of changing the shape of a transparent bag. That can suggest a splash, but it doesn't automatically give you the behavior of a volume of liquid. The critics kept spotting the result: bag-like water, artificial holes, bead-like spray, and a weak connection between the projectile and the rupture.

Three rounds of feedback improved details. They didn't solve the main problem. That's when I rejected the visual and asked for the next three rounds.

The rebuild changed the underlying approach. It filled the balloon with roughly **2,200 simulated points**, calculated how those points moved, and used their positions to draw a continuous-looking surface. In intuitive terms: work out where the water is, then try to make those samples look like one body of water.

It also replaced the vague oval projectile with a pointed copper bullet, made the latex distinctly red, and gave the very short impact more space on the timeline. The timeline is deliberately cinematic: equal distances along it don't represent equal amounts of physical time. The readout shows the simulated milliseconds separately.

The loop was straightforward: **build, inspect, criticize, revise, save, repeat.** Separate critic agents reviewed frames from the approach, contact, exit, breakup, landing, different camera angles, and mobile view. The coding agent then worked through their specific complaints.

There were real engineering fixes along the way. A particle-count error caused invalid positions and unnecessary computation. A depth-buffer issue produced visible banding. Blur sampling created stippled edges. Latex strips grew as they travelled, turning remnants into long red arcs. Those problems were diagnosed and corrected.

That is useful capability. It also explains why a long list of fixes can coexist with a disappointing final image.

## What worked

The agent built an application I could actually explore. The final render has a recognizable bullet and balloon, a complete sequence, functioning controls, and a camera that works from different angles. Going backward on the timeline reconstructs the same state instead of trying to reverse the simulation.

The project also became recoverable. The source, intermediate versions, critic reports, and resume notes were saved, and the complete experiment was exported as a single HTML file. The version embedded above runs from this website's own files; it doesn't depend on signing into the original private project.

The recorded verification included **62 browser checks**, **four emulated touch and layout checks**, and **six offline checks**. The final offline export ran its water simulation without network requests or browser errors. Combined extreme settings also produced finite numerical trajectories.

Those checks tell me the software behaves consistently under the conditions tested. They don't tell me that the water obeys real fluid mechanics, or that the result looks convincing. A slider can work perfectly while the picture it controls is wrong.

## Where it fell short

The exposed water still looks too much like cloudy glass or soft metal. Its reflections can feel painted onto a rounded object. As it breaks apart, you can see the construction: lots of individual beads, with too little convincing sheet formation between them. The pool has a raised edge that can read as a slab.

The causal moment is also weak. A real-looking shot needs the point of contact to explain what happens next. Here, the entry dimple remains subtle, the latex can look like decorative ribbons, and the water doesn't communicate the bullet's passage as clearly as the interface labels do.

The last critic's scores captured that split:

===RUPTURE_RESULTS===

These were the **three additional reviews**, after the first three had already happened. They were AI-generated judgments of screenshots, not independent human ratings, a blind benchmark, or measurements of physical accuracy. The final critic put recognition of the objects and action at about 7/10. Some small shading and knot corrections followed that review; they did not receive another independent score.

The plateau matters more to me than the decimal places. More iterations made the scene easier to recognize, but the final two reviews saw no further gain in realism. My original visual goal was still unmet.

## What this taught me about the workflow

The strongest part of the process was persistence: generating an implementation, keeping state recoverable, diagnosing concrete bugs, and wiring an experience together. The weakest part was closing the gap between a plausible technical explanation and a visually credible physical event.

The critic agents helped name defects. They weren't a substitute for a better representation of the thing being simulated. Repeatedly asking for more realistic water doesn't, by itself, supply the missing fluid mechanics or rendering technique.

There was a human evaluation problem too. The UI looked polished enough to suggest that the difficult part was nearly finished. The controls, test results, and progress reports all supplied evidence of work. The water itself supplied the evidence that mattered to the brief.

Next time I'd start with a much smaller test: one fixed camera, one projectile, one balloon, and a short sequence that convincingly shows contact, rupture, and the first instant of release. I'd compare those stages with a real high-speed reference before adding the settings panel. I'd decide upfront whether the target was a stylized interactive illustration or physical realism, because those require different choices.

I'd also set a stopping rule. If the central visual stops improving across reviews, change the method or reduce the scope. Don't keep adding detail around an unresolved core.

## Where I landed

I was disappointed by this result, and I still am. Astra produced substantial working software under a demanding constraint. It didn't produce the convincing water-balloon shot I asked for.

That makes this a useful entry in the notebook. It shows what happened when the agent had to keep working past the attractive first demo: a recoverable application, identifiable improvements, and a visual boundary that repeated criticism didn't overcome in this run.

The render above is the result. I think it's better evidence than another paragraph about how much code the agent wrote.

---

*Experiment conducted September 14–15, 2026. This account draws on the saved build log, source checkpoints, test receipts, and all six critic rounds. The model name is the one used for this experiment. No elapsed-time, cost, or comparative model-performance claim is made.*

**For a closer look:** [open the complete experiment](/experiments/rupture/index.html), [open the offline HTML](/experiments/rupture/rupture-offline.html), or read the [review and verification notes](/experiments/rupture/review-notes.md). The rendering approach drew on NVIDIA's [Screen Space Fluid Rendering](https://developer.download.nvidia.com/tools/docs/Fluid_Rendering_Alice.pdf). This implementation remains an approximate, partly art-directed fluid study; it does not establish conservation of water volume or validated physical prediction.
