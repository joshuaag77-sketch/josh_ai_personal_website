---
title: "The Balloon Test: Building With GPT-6 Astra"
date: "2026-09-15T12:00:00Z"
tags: ["ai", "experiments", "learning-log"]
summary: "I asked GPT-6 Astra to build a convincing slow-motion water-balloon rupture. It built a working app, survived six critic rounds, and the water never looked like water. Here's the result and what I'd do differently."
kicker: "Experiment Log"
heroImage: "/images/rupture-balloon-test.png"
heroAlt: "The actual Rupture render: a copper projectile leaving a red water balloon, with the exposed water still visibly synthetic."
hideHero: true
status: "published"
featured: false
---

===RUPTURE_EXPERIMENT===

I asked GPT-6 Astra to build a slow-motion scene of a bullet passing through a water balloon. I wanted the high-speed-camera moment: the skin gives way, the water holds its shape for an instant, then stretches, breaks apart and falls.

It built a polished little app called Rupture. You can orbit the camera, change the conditions, pause and scrub through the impact. The controls work and the page looks considered. The water does not look like water. At one point I rated the central visual 1 out of 10, asked for a fundamental fix and three more critic rounds, and it got better without ever becoming the shot I had in mind. The render above is the actual result, because a description of the work makes it sound more successful than watching it does.

## What I asked for

Two things. A usable app, with replay, slow motion, camera controls and settings for projectile speed, balloon size, impact height, gravity, surface tension, spray and lighting. And the physical scene itself: an identifiable projectile, a local puncture, recoiling latex, water that reads as water.

The build had to use native browser graphics, no Three.js and no physics library. That made it harder. The agent had to construct the rendering and the motion instead of dropping in a ready-made fluid effect.

## What it built

The work started with recovery. There was an existing Rupture project, but its source repository was empty and the runtime was gone. The agent rebuilt inside the same project, and I made it keep source checkpoints and a resume log before every critic review so another interruption would not erase the work.

The first version treated the water as a deforming outer skin with droplets and strands around it, like changing the shape of a transparent bag. That can suggest a splash. It does not behave like a volume of liquid, and the critics kept saying so: bag-like water, artificial holes, bead-like spray, no clear link between the bullet and the hole.

Three rounds of feedback fixed details and left the main problem alone. That is when I rejected the visual and asked for a different approach.

The rebuild filled the balloon with about 2,200 simulated points, moved them, and drew a continuous surface over wherever they ended up. It swapped the vague oval for a pointed copper bullet, made the latex red, and stretched the impact across more of the timeline. The loop was the same every round: build, inspect, get criticized by separate critic agents looking at frames from approach, contact, exit, breakup and landing, revise, save.

There were real engineering fixes along the way. A particle-count bug produced invalid positions. A depth-buffer problem produced banding. Blur sampling produced stippled edges. Latex strips grew as they travelled and turned into long red arcs. All of that got diagnosed and fixed, which is real capability, and it is also why a long list of fixes can sit next to a disappointing final image.

It passed its own tests too: 62 browser checks, and an offline HTML file that runs with no network. None of that tells you whether the water looks like water.

## Why the water never looked right

The exposed water still reads as cloudy glass or soft metal. The reflections look painted on. When it breaks apart you can see the construction, lots of individual beads with not enough sheet between them, and the pool has a raised edge that reads as a slab.

The moment of contact is weak too. A convincing shot needs the entry point to explain everything that follows. Here the entry dimple is subtle, the latex can look like ribbon, and the water does not tell you the bullet passed through as clearly as the interface labels do.

The last critic's scores show the split:

===RUPTURE_RESULTS===

Those are AI judgments of screenshots, not human ratings or measurements of physical accuracy. What matters to me is the plateau. More rounds made the scene easier to recognize, and the last two rounds saw no gain in realism at all.

## What I'd do next time

Start much smaller. One fixed camera, one bullet, one balloon, and a short sequence that convincingly shows contact, rupture and the first instant of release. Compare those frames with a real high-speed reference before building a settings panel. Decide up front whether I want a stylized interactive illustration or physical realism, because they need different choices.

And set a stopping rule. If the central visual stops improving across reviews, change the method or cut the scope. Don't keep adding detail around an unresolved core.

I was disappointed by this result and I still am. Astra produced a lot of working software under a hard constraint and it did not produce the shot I asked for. The polished UI, the test results and the progress reports all looked like evidence that the hard part was nearly done. The water was the only evidence that counted, and I should have been looking at it sooner.

**For a closer look:** [open the complete experiment](/experiments/rupture/index.html), [open the offline HTML](/experiments/rupture/rupture-offline.html), or read the [review and verification notes](/experiments/rupture/review-notes.md). The rendering approach drew on NVIDIA's [Screen Space Fluid Rendering](https://developer.download.nvidia.com/tools/docs/Fluid_Rendering_Alice.pdf).
