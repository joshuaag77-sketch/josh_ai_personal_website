# Rupture: review and verification notes

Experiment: GPT-6 Astra in Codex, September 14–15, 2026. One evolving build; no controlled model comparison, recorded cost comparison or elapsed-time benchmark.

## What was built

A native WebGL 2 scene of a copper projectile passing through a red water balloon, with orbit, zoom, replay, scrubbing, playback speed and seven condition controls. No Three.js or external physics library is used by this render.

The final version uses 2,221 particles, density relaxation, a localized impulse, gravity, approximate cohesion, drag and floor collisions. Particle trajectories are prepared in a worker and sampled for deterministic scrubbing. Screen-space depth smoothing forms the visible water surface. A small art-directed stream supplements the exit. This is not a validated incompressible fluid solver, and conservation of water volume was not established.

## Critic results

Scores are subjective AI-agent reviews of screenshots. Separate reviewers within the same workflow do not constitute independent human evaluation or a blind benchmark. Perceived physics and interface scores describe visible evidence, not physical accuracy or functional test results.

| Round | Realism | Perceived physics | Impact/deformation | Lighting/cinematography | Visual UI |
| --- | ---: | ---: | ---: | ---: | ---: |
| Original 1 | 2.5 | 3 | 3 | 5 | 8 |
| Original 2 | 3.5 | 4 | 4 | 5 | 8.5 |
| Original 3 | 4.5 | 4.5 | 5 | 5.5 | 8.5 |
| Additional A | 3 | 3.5 | 3 | 4.5 | 8 |
| Additional B | 4.5 | 4.5 | 5 | 5 | 8.5 |
| Additional C | 4.5 | 4.5 | 5 | 5 | 8.5 |

The particle rebuild happened between the original and additional series; this is not a clean like-for-like progression. Additional C placed subject/action recognition at approximately 7/10. The author's earlier roughly 1/10 reaction was an informal expression of dissatisfaction, not the same scoring exercise.

Final small shading, balloon-knot and caption changes were inspected by the owner agent after C. They were not scored in another independent critic round.

Recurring defects: cloudy or metallic water, weak local indentation, ribbon-like latex recoil, bead-like breakup and a raised pool edge. The intended convincing visual was not achieved.

## Recorded checks

- 62 browser checks: control limits and rendered changes, lighting, exact backward-seek pixels, timeline, play/pause/replay, camera, reset, WebGL errors at sampled times, mobile overflow and enlarged text.
- Four emulated touch/layout checks: orbit, pinch, reset and playback placement. No physical-phone testing.
- Six offline checks: startup, settings, reset, playback, zero HTTP requests, and worker-prepared fluid rendering.
- Default and two combined extreme numerical configurations: finite positions, bounded particle radii, consistent snapshot dimensions and increasing timestamps.
- Physical timeline anchors: -12 ms at the beginning, contact at 0 ms, expanded impact through +20 ms, and the end at +1,100 ms. The editing timeline is non-linear.

These checks establish behavior under the tested conditions, not calibrated fluid accuracy or a GPU frame-rate guarantee.

## Preservation

The source and a resume log were checkpointed throughout the work and before critic rounds. The full render in this article is the saved offline HTML, hosted alongside the article. It requires WebGL 2 with floating-point render targets, but makes no external network requests and requires no login to the original private project.

Technical reference: NVIDIA, Screen Space Fluid Rendering, https://developer.download.nvidia.com/tools/docs/Fluid_Rendering_Alice.pdf
