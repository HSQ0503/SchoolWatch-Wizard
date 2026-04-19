import { NextRequest, NextResponse } from "next/server";
import { sendDomainRequestEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { schoolName, contactEmail, currentUrl, desiredDomain, notes } = body;

    if (!schoolName?.trim() || !contactEmail?.trim() || !desiredDomain?.trim()) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail)) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    await sendDomainRequestEmail({
      schoolName: schoolName.trim(),
      contactEmail: contactEmail.trim(),
      currentUrl: currentUrl?.trim() || undefined,
      desiredDomain: desiredDomain.trim(),
      notes: notes?.trim() || undefined,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[custom-domain] send failed:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
