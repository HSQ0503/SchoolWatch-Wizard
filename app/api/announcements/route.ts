import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifySessionToken, isSuperAdmin } from "@/lib/auth";
import { MAX_ACTIVE, VALID_TYPES } from "@/lib/announcements";

async function getSessionEmail(req: NextRequest): Promise<string | null> {
  const cookie = req.cookies.get("session")?.value;
  if (!cookie) return null;
  const session = await verifySessionToken(cookie);
  return session?.email ?? null;
}

export async function GET(req: NextRequest) {
  const email = await getSessionEmail(req);
  if (!email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const schoolId = req.nextUrl.searchParams.get("schoolId");
  if (!schoolId) {
    return NextResponse.json({ error: "Missing schoolId" }, { status: 400 });
  }

  const school = await prisma.school.findUnique({ where: { id: schoolId } });
  if (!school) {
    return NextResponse.json({ error: "School not found" }, { status: 404 });
  }

  if (school.contactEmail !== email && !isSuperAdmin(email)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const rows = await prisma.announcement.findMany({
    where: { schoolId },
    orderBy: [{ pinned: "desc" }, { createdAt: "desc" }],
  });
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const email = await getSessionEmail(req);
  if (!email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { schoolId, title, body: text, type, pinned, expiresAt } = body;

  if (!schoolId || !title || !text || !type) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }
  if (!VALID_TYPES.includes(type)) {
    return NextResponse.json({ error: "Invalid announcement type" }, { status: 400 });
  }

  const school = await prisma.school.findUnique({ where: { id: schoolId } });
  if (!school) {
    return NextResponse.json({ error: "School not found" }, { status: 404 });
  }
  if (school.contactEmail !== email && !isSuperAdmin(email)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const now = new Date().toISOString().slice(0, 10); // "YYYY-MM-DD" — matches expiresAt format
  const activeCount = await prisma.announcement.count({
    where: {
      schoolId,
      active: true,
      OR: [{ expiresAt: null }, { expiresAt: { gte: now } }],
    },
  });
  if (activeCount >= MAX_ACTIVE) {
    return NextResponse.json(
      { error: `Maximum of ${MAX_ACTIVE} active announcements allowed` },
      { status: 400 }
    );
  }

  const created = await prisma.announcement.create({
    data: {
      schoolId,
      title,
      body: text,
      type,
      pinned: pinned ?? false,
      active: true,
      expiresAt: expiresAt || null,
    },
  });
  return NextResponse.json(created, { status: 201 });
}
