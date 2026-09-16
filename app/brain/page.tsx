import type { Metadata } from "next";
import { VaultGraph } from "@/components/VaultGraph";

export const metadata: Metadata = {
  title: "The Vault: fly through my second brain",
  description:
    "An explorable WebGL map of my real Obsidian knowledge graph. Every note is a star and every link a thread. This is the system my writing comes from, live.",
};

export default function BrainPage() {
  return <VaultGraph />;
}
