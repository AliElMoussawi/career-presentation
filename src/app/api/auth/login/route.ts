import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const ADMIN_SESSION_COOKIE = "admin_session";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { password?: string };
    const password = body.password ?? "";
    const expected = process.env.ADMIN_PASSWORD ?? "";
    const secret = process.env.ADMIN_SECRET ?? "change-me-in-production";

    if (!expected) {
      return NextResponse.json(
        { error: "Admin login not configured" },
        { status: 500 }
      );
    }
    if (password !== expected) {
      return NextResponse.json({ error: "Invalid password" }, { status: 401 });
    }

    const cookieStore = await cookies();
    cookieStore.set(ADMIN_SESSION_COOKIE, secret, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Login failed" },
      { status: 500 }
    );
  }
}
