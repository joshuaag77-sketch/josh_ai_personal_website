---
title: "What a Car Sees. What an Owl Sees."
date: "2026-10-18T12:00:00Z"
tags: ["experiments", "learning-log"]
summary: "I wanted to pull apart what a Waymo sees. Then I thought about owls. An interactive experiment in the information different observers can detect, and the limits of showing it on a screen."
kicker: "Experiment Log"
status: "published"
featured: false
---

I started with a question about Waymo: what does the car actually see? I wanted to pull apart the camera image, the lidar point cloud and the radar returns, then put them back together.

Then I thought about a great horned owl. Same question, very different equipment. What information is available to it that I miss?

That became this experiment: two scenes where you can change the observer and see which information survives. I called it Umwelt, a term for an organism’s perceptual world. The car is a useful comparison, though sensors and animal experience are different things.

===UMWELT_CITY===


## Start with the missing information

Choose lidar and rotate the city. The backs of objects are missing because the rays come from one sensor position. Moving your view around the point cloud does not create measurements from the other side. That gap is easier to understand when you can look into it.

Now choose radar and change the cyclist’s direction. The speed readout measures motion toward or away from the sensor. Someone can move quickly across its line of sight while having little radial speed. “Radar sees motion” leaves out the part that makes this interesting.

The camera keeps colour and texture. The combined view lays those different signals together. Its boxes are labels I put in the scene, not objects a driving system has learned to recognize.

This is a simplified browser model inspired by autonomous-vehicle sensors. It uses a generated city, ray intersections and synthetic motion. It is not Waymo footage or a replica of its perception software.


## Then change the observer

The animal question is harder. An owl’s low-light sensitivity, an eagle’s fine detail and a bee’s ultraviolet sensitivity are different capabilities. A pit viper adds another complication: its heat-sensitive facial pits are separate from its eyes.

In the woodland below, drag the divider and adjust the control for each animal. Look for the small animal in owl mode, the distant stripes for the eagle, the flower patterns for the bee, and the warm body for the viper.

===UMWELT_ANIMALS===


## Where the picture stops being evidence

I can make a screen brighter. That does not mean I have reproduced owl vision. I can colour a flower purple, but that is a display choice for an ultraviolet signal I authored. These comparisons illustrate particular capabilities; they do not reconstruct what it feels like to be another animal.

That distinction matters after [my water-balloon experiment](https://joshagarwal.com/posts/gpt-6-astra-balloon-test). A polished interface can make a rough model look more convincing than it deserves. Here, the useful question is whether changing a control helps explain a specific idea.

For me, the lidar gaps and the cyclist’s radial speed are the clearest examples. A paragraph can describe both. The interaction lets you change something, make a prediction and check it.

That is what I wanted to explore with visuals. A picture that looks impressive gets attention. A model you can question gives you somewhere to go with it. The next version should earn more realism with measured sensor data and calibrated animal comparisons, rather than just more detail in the scene.

**Methods and sources:** [open the research notebook](/experiments/umwelt/index.html#method). Built with [Three.js](https://threejs.org/) and a [CC0 forest environment from Poly Haven](https://polyhaven.com/a/nature_reserve_forest). The sensor model draws on [CARLA’s sensor reference](https://carla.readthedocs.io/en/latest/ref_sensors/); the animal comparisons link to primary research in each view.
