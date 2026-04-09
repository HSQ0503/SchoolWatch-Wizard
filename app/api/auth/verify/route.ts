import { NextRequest, NextResponse } from "next/server";
import { verifyMagicLinkToken, createSessionToken } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const { token } = await req.json();

  const payload = await verifyMagicLinkToken(token);

  if (!payload) {
    return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
  }

  const sessionToken = await createSessionToken(payload.email);

  const response = NextResponse.json({ email: payload.email });

  response.cookies.set("session", sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: "/",
  });

  return response;
}
