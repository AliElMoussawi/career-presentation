import { NextResponse } from "next/server";
import { getContent, saveContent } from "@/lib/data";
import { isAdmin } from "@/lib/auth";
import type { PresentationContent } from "@/lib/types";

export async function GET() {
  try {
    const content = await getContent();
    return NextResponse.json(content);
  } catch (error) {
    console.error("Failed to load content:", error);
    return NextResponse.json(
      { error: "Failed to load content" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = (await request.json()) as PresentationContent;
    await saveContent(body);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to save content:", error);
    return NextResponse.json(
      { error: "Failed to save content" },
      { status: 500 }
    );
  }
}
