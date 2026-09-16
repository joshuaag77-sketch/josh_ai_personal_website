// The exchange that plays itself on a visitor's first load of the homepage.
// Cached on purpose: no API call, no latency, and it is the best answer the
// bot gives, so it is the one a first-time visitor should see.
// Vault titles in [[brackets]] must match node labels in public/vault-graph.json
// exactly, or they render as plain bold instead of chips.

export const COLD_OPEN = {
  question: "Why did an Enbridge engineer go to Wharton?",
  answer:
    "Four years building first-of-a-kind hydrogen and carbon-capture assets taught him something the job description never mentioned: the projects that stall are not failing on engineering. They stall on capital, risk tolerance, and who is willing to own the last mile. He kept ending up as that person without the title for it. Wharton is the bet that the title is worth having. The argument is in [[The Deployment Gap - My AI Career Thesis]] and the trust half of it is in [[The Five Layers of Trust]].",
};

// Questions the hero input types by itself while idle. Enter sends whatever is showing.
export const ROTATING_QUESTIONS = [
  "Why did an Enbridge engineer go to Wharton?",
  "What is the deployment gap?",
  "What have you actually built?",
  "What is your biggest blind spot?",
  "How does this second brain work?",
  "What did you do at Enbridge?",
];

export type AudienceKey = "recruiter" | "classmate" | "builder";

export const SUGGESTIONS: Record<AudienceKey | "default", string[]> = {
  default: [
    "What is the deployment gap?",
    "What have you actually built?",
    "What is your biggest blind spot?",
  ],
  recruiter: [
    "What did you do at Enbridge?",
    "Why consulting, and why energy?",
    "What is your biggest blind spot?",
  ],
  classmate: [
    "How does the second brain work?",
    "What are you recruiting for?",
    "What should I read first?",
  ],
  builder: [
    "How is this site built?",
    "What runs on a schedule?",
    "How does the chatbot stay private?",
  ],
};

export const PITCHES: Record<AudienceKey, string> = {
  recruiter:
    "Engineer first. Four years turning first-of-a-kind energy projects into operating assets, and building the tools my teams actually adopted. Now at Wharton, recruiting consulting with an energy focus.",
  classmate:
    "WG'28, Philadelphia. I build systems that remember things so I don't have to. This site is the public window into one of them.",
  builder:
    "Everything here is built, not bought: Next.js on Vercel, a WebGL map of a real Obsidian vault, seven scheduled agents, and Claude behind a hard privacy sandbox.",
};
