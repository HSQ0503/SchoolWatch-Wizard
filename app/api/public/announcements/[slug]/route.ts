import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const PUBLIC_HEADERS = {
  "Cache-Control": "public, s-maxage=5, stale-while-revalidate=30",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: PUBLIC_HEADERS });
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const school = await prisma.school.findUnique({ where: { slug } });
  if (!school) {
    return NextResponse.json([], { headers: PUBLIC_HEADERS });
  }

  const now = new Date().toISOString().slice(0, 10); // "YYYY-MM-DD" — matches expiresAt format
  const rows = await prisma.announcement.findMany({
    where: {
      schoolId: school.id,
      active: true,
      OR: [{ expiresAt: null }, { expiresAt: { gte: now } }],
    },
    orderBy: [{ pinned: "desc" }, { createdAt: "desc" }],
  });

  const payload = rows.map((r) => ({
    id: r.id,
    title: r.title,
    body: r.body,
    type: r.type,
    pinned: r.pinned,
    createdAt: r.createdAt.toISOString(),
  }));

  return NextResponse.json(payload, { headers: PUBLIC_HEADERS });
}
