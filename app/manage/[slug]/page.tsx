import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { verifySessionToken, isSuperAdmin } from "@/lib/auth";
import ManageShell from "./ManageShell";
import type { WizardFormData } from "@/lib/types";
import { defaultLightColors } from "@/lib/colors";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export default async function ManagePage({ params }: PageProps) {
  const { slug } = await params;

  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("session")?.value;
  if (!sessionCookie) {
    redirect("/login");
  }
  const session = await verifySessionToken(sessionCookie);
  if (!session) {
    redirect("/login");
  }

  const school = await prisma.school.findUnique({ where: { slug } });
  if (!school) {
    notFound();
  }

  if (school.contactEmail !== session.email && !isSuperAdmin(session.email)) {
    redirect("/login");
  }

  // Migrate legacy flat color format (same migration /edit does)
  const cfg = school.configData as WizardFormData & {
    colors?: { primary?: string; accent?: string; light?: unknown; dark?: unknown };
  };
  if (cfg?.colors && !cfg.colors.light) {
    const primary = cfg.colors.primary || "#003da5";
    const accent = cfg.colors.accent || "#003da5";
    cfg.colors = {
      primary,
      accent,
      light: defaultLightColors(primary, accent),
      dark: {},
    } as WizardFormData["colors"];
  }

  return (
    <ManageShell
      schoolId={school.id}
      schoolName={school.name}
      schoolSlug={school.slug}
      initialData={cfg as WizardFormData}
    />
  );
}
