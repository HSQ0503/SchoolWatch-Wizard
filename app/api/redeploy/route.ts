import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateConfigTs } from "@/lib/config-generator";
import { pushFile } from "@/lib/github";
import { verifySessionToken, isSuperAdmin } from "@/lib/auth";
import type { WizardFormData } from "@/lib/types";

export async function POST(req: NextRequest) {
  const sessionCookie = req.cookies.get("session")?.value;
  if (!sessionCookie) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const session = await verifySessionToken(sessionCookie);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { schoolId, data }: { schoolId: string; data: WizardFormData } = await req.json();

    const school = await prisma.school.findUnique({ where: { id: schoolId } });
    if (!school) {
      return NextResponse.json({ error: "School not found" }, { status: 404 });
    }

    if (school.contactEmail !== session.email && !isSuperAdmin(session.email)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const configContent = generateConfigTs(data);
    await pushFile(school.githubRepoName, "school.config.ts", configContent, "Update school config via wizard");

    await prisma.school.update({
      where: { id: schoolId },
      data: { configData: data as object },
    });

    return NextResponse.json({ success: true, deployedUrl: school.deployedUrl });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
