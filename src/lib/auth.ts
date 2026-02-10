import { cookies } from "next/headers";

const ADMIN_SESSION_COOKIE = "admin_session";

export async function isAdmin(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
  const secret = process.env.ADMIN_SECRET ?? "change-me-in-production";
  return token === secret;
}
