import { SignJWT, jwtVerify } from "jose";

const SECRET = new TextEncoder().encode(process.env.MAGIC_LINK_SECRET!);
const APP_URL = (process.env.NEXT_PUBLIC_APP_URL || "").replace(/"/g, "").replace(/\/$/, "");

export async function createMagicLinkToken(email: string): Promise<string> {
  return new SignJWT({ email })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("15m")
    .sign(SECRET);
}

export async function verifyMagicLinkToken(
  token: string
): Promise<{ email: string } | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return { email: payload.email as string };
  } catch {
    return null;
  }
}

export async function createSessionToken(email: string): Promise<string> {
  return new SignJWT({ email })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .sign(SECRET);
}

export async function verifySessionToken(
  token: string
): Promise<{ email: string } | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return { email: payload.email as string };
  } catch {
    return null;
  }
}

export function getMagicLinkUrl(token: string): string {
  return `${APP_URL}/edit?token=${token}`;
}

export function isSuperAdmin(email: string): boolean {
  return email === process.env.SUPER_ADMIN_EMAIL;
}
