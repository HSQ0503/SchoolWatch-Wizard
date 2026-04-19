import { NextRequest, NextResponse } from "next/server";
import { getDeploymentStatus } from "@/lib/vercel";

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("deploymentId");
  if (!id) {
    return NextResponse.json({ error: "Missing deploymentId" }, { status: 400 });
  }
  try {
    const state = await getDeploymentStatus(id);
    return NextResponse.json({ state });
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown";
    return NextResponse.json({ state: "UNKNOWN", error: message });
  }
}
