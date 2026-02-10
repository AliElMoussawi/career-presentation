import type { PresentationContent } from "./types";
import path from "path";
import fs from "fs";

const DATA_FILE = path.join(process.cwd(), "data", "content.json");

export async function getContent(): Promise<PresentationContent> {
  const raw = fs.readFileSync(DATA_FILE, "utf-8");
  return JSON.parse(raw) as PresentationContent;
}

export async function saveContent(content: PresentationContent): Promise<void> {
  fs.writeFileSync(DATA_FILE, JSON.stringify(content, null, 2), "utf-8");
}
