import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createMagicLinkToken, getMagicLinkUrl } from "@/lib/auth";
import { sendMagicLinkEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  const { email } = await req.json();

  const school = await prisma.school.findFirst({
    where: { contactEmail: email },
  });

  if (!school) {
    return NextResponse.json({ error: "School not found" }, { status: 404 });
  }

  const token = await createMagicLinkToken(email);
  const url = getMagicLinkUrl(token);

  await sendMagicLinkEmail(email, url, school.name);

  return NextResponse.json({ sent: true });
}
