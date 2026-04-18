import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifySessionToken, isSuperAdmin } from "@/lib/auth";
import { VALID_TYPES } from "@/lib/announcements";

async function getSessionEmail(req: NextRequest): Promise<string | null> {
  const cookie = req.cookies.get("session")?.value;
  if (!cookie) return null;
  const session = await verifySessionToken(cookie);
  return session?.email ?? null;
}

async function loadAndAuthorize(req: NextRequest, id: string) {
  const email = await getSessionEmail(req);
  if (!email) return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };

  const announcement = await prisma.announcement.findUnique({
    where: { id },
    include: { school: true },
  });
  if (!announcement) {
    return { error: NextResponse.json({ error: "Not found" }, { status: 404 }) };
  }
  if (announcement.school.contactEmail !== email && !isSuperAdmin(email)) {
    return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }
  return { announcement };
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const result = await loadAndAuthorize(req, id);
  if ("error" in result) return result.error;

  const body = await req.json();
  const { title, body: text, type, pinned, active, expiresAt } = body;

  if (type && !VALID_TYPES.includes(type)) {
    return NextResponse.json({ error: "Invalid announcement type" }, { status: 400 });
  }

  const updated = await prisma.announcement.update({
    where: { id },
    data: {
      ...(title && { title }),
      ...(text && { body: text }),
      ...(type && { type }),
      ...(pinned !== undefined && { pinned }),
      ...(active !== undefined && { active }),
      expiresAt: expiresAt !== undefined ? expiresAt || null : undefined,
    },
  });
  return NextResponse.json(updated);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const result = await loadAndAuthorize(req, id);
  if ("error" in result) return result.error;

  await prisma.announcement.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
