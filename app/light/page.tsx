import type { Metadata } from "next";
import { LightFigure } from "@/components/LightFigure";

export const metadata: Metadata = {
  title: "Light",
  description:
    "A figure made of light. Generated with Veo, cut out with rembg, given depth with Depth Anything, then drawn as particles in WebGL.",
};

export default function LightPage() {
  return <LightFigure />;
}
