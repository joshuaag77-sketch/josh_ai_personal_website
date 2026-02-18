import fs from "fs";
import path from "path";

export function getProfileMarkdown(): string {
  const filePath = path.join(process.cwd(), "content", "profile.md");
  if (!fs.existsSync(filePath)) return "";
  return fs.readFileSync(filePath, "utf-8");
}

