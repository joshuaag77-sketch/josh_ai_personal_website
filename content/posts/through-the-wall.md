---
title: "I Made a Music Video About Every Time AI Was Supposed to Hit a Wall"
date: "2026-11-01"
tags: ["builds", "ai", "agents", "music", "video"]
summary: "Ethan Mollick made a music video about the Bitter Lesson with one prompt. I tried to make my own, about the walls AI keeps breaking through. It took a weekend, about 35 songs, and 5,458 frames."
kicker: "Builds"
heroImage: "/images/through-the-wall.jpg"
heroAlt: "A blueprint-style frame reading THEY SAID IT HIT THE WALL over a wall of bricks labelled DATA."
heroCaption: "Every brick says DATA. That was the first wall."
status: "published"
---

About a month ago Ethan Mollick posted a music video about Rich Sutton's Bitter Lesson. It was catchy, it was accurate, and he said he made it with one prompt. I wanted to make my own.

I've been thinking about the different levers AI has pulled over the last few years, from compute to reasoning to agents to long tasks, and the one nobody has pulled yet, recursive self-improvement. Every one of them showed up right after someone said progress was about to stall. So that became the song.

===THROUGH_THE_WALL_VIDEO===

## The idea

Every year someone writes the obituary. Deep learning is hitting a wall. We're running out of data. It's just a parrot. It can't stay on a task for more than an hour. Then the next lever shows up and the wall is gone.

I want to be fair here. The critics were not dumb. Most of those walls were real for the method of the time. Pretraining did start giving smaller returns, so labs leaned into reasoning. A single model did lose the thread on long tasks, so people started running teams of agents. The progress came from switching levers, not from proving anyone wrong.

The last wall in the song is the one that matters most. Right now people still design, train, test and ship every model. If models start building their successors, and each one does it faster, that loop is new. It hasn't happened yet. The video ends on a question mark for that reason.

## How I actually built it

Here is what it took.

**The song.** Google's Lyria 3.5 writes a full song from a text prompt, lyrics included, for about 8 cents. I went through roughly 35 songs over 9 batches, about $2.80 in total. Pop rock, a chant version I didn't like, folk, synth rock, hip-hop, pop-punk, country and finally R&B. The lyrics went through about six rewrites. The early ones rambled. The later ones are shorter and name real moments.

**Listening.** Claude can't hear. So it downloaded Mollick's song, ran it through Whisper to get the lyrics with timestamps, and measured it with an audio library: 86 BPM, B-flat major, story verses into a chorus that never changes. Then it scored every one of my takes the same way. Did it sing every line? Did the chorus come through? Was there a dropout anywhere?

**The visuals.** My first attempt looked cheap. Claude drew the frames with a Python image library, and it showed. The fix was the way the good AI music videos are made: write the whole animation as a web page, where every frame is a function of time, then have headless Chrome take a screenshot of each frame and stitch them together with the song in ffmpeg.

The first version of that copied Mollick's look a little too closely. Same colours, same type, same layout. So I asked for something only I would make. I'm a P.Eng, so it became an engineering blueprint: one long drawing sheet, white line drawings, red-pen markups, and a title block in the corner with my name on it. The revision letter goes up every time a wall falls.

**The numbers.** About 40 scenes, one per lyric line. 5,458 frames per cut, rendered by six copies of Chrome at once, about 15 minutes a render. I rendered the whole thing about eight times. There's a vertical cut too.

Everything except the song was free: Chrome, Node, ffmpeg, Whisper, and a couple of Python libraries.

## What it couldn't do

It couldn't tell me what sounded good. It could tell me which take sang every word. It could not tell me which one was catchy. That part was me.

It also made one thing worse before it made it better. One take had a tiny gap in the middle of the word "Olympiad." Claude patched it by copying the audio just before the gap, which made the word play twice. A second patch smeared it into "end." The real fix was to throw the take away and generate better ones. Some problems you don't edit, you regenerate.

And there's a hard limit: Lyria songs top out around three minutes, which is why the lyrics had to get cut down so many times.

## What I actually think

Mollick's video is about a lesson. Mine is more of a scoreboard, and I know it. If I make another one, I think it'll be about the wall I know best. Every wall in this song was software. The one AI hasn't gotten through yet is physical: power, grid connections, turbines, transformers. That's my old world.

Full credit to Ethan Mollick for the idea and the format. Sources for every claim in the video are below. I'd love to hear which wall you think falls next.

## Sources

- Gary Marcus, "Deep Learning: A Critical Appraisal" (Jan 2018) and "Deep Learning Is Hitting a Wall," Nautilus (Mar 2022)
- Bender, Gebru et al., "On the Dangers of Stochastic Parrots" (Mar 2021)
- Epoch AI, "Will We Run Out of Data?" (updated Jun 2024): public human text could be used up between 2026 and 2032
- Ilya Sutskever, NeurIPS (Dec 2024): "Pre-training as we know it will end"
- Kaplan et al., "Scaling Laws for Neural Language Models" (Jan 2020); GPT-3 (May 2020); ChatGPT (Nov 2022) and GPT-4 (Mar 2023)
- OpenAI o1 (Sep 2024); OpenAI and Google DeepMind models at gold-medal level, IMO 2025 (Jul 2025)
- Google DeepMind AlphaEvolve: 4x4 complex-valued matrix multiplication in 48 multiplications, against 49 from Strassen's 1969 method (May 2025)
- Google DeepMind and collaborators, "Discovery of Unstable Singularities" (Sep 2025): a step toward Navier-Stokes, not a solution
- Anthropic, "Building a C compiler with a team of parallel Claudes" (Feb 2026)
- METR, "Measuring AI Ability to Complete Long Tasks" (Mar 2025) and Time Horizon 1.1 (Jan 2026). Chart points in the video are approximate.
- Ethan Mollick, "The Dot and the Swarm," One Useful Thing (Oct 2026)
