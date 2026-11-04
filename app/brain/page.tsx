import type { Metadata } from "next";
import { VaultGraph } from "@/components/VaultGraph";

export const metadata: Metadata = {
  title: "The Vault: fly through my notes",
  description:
    "A map of my real notes, filed under the questions I keep coming back to. Every note is a star and every link a thread. It updates itself.",
};

export default function BrainPage() {
  return <VaultGraph />;
}
