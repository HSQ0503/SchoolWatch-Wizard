import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateSlug, generateConfigTs } from "@/lib/config-generator";
import { createRepoFromTemplate, waitForRepoReady, pushFile, pushLogo } from "@/lib/github";
import { createProject } from "@/lib/vercel";
import { createMagicLinkToken, getMagicLinkUrl } from "@/lib/auth";
import { sendMagicLinkEmail } from "@/lib/email";
import type { WizardFormData } from "@/lib/types";

export async function POST(req: NextRequest) {
  try {
    const data: WizardFormData = await req.json();

    const slug = generateSlug(data.school.name);

    const existing = await prisma.school.findFirst({ where: { slug } });
    if (existing) {
      return NextResponse.json(
        { error: "A school with this name already exists" },
        { status: 409 }
      );
    }

    const repoName = "schoolwatch-" + slug;

    const repo = await createRepoFromTemplate(repoName);

    // Wait for GitHub to finish copying template files before doing anything else
    await waitForRepoReady(repoName);

    // Create Vercel project BEFORE pushing config so the push triggers a deployment
    const project = await createProject(repoName, repo.fullName);

    // Extract logo before generating config (not part of the config file)
    const logoDataUrl = data.logo;
    const dataForConfig = { ...data };
    delete dataForConfig.logo;

    // Push logo if provided (before config so we know the real extension)
    let logoUrl: string | undefined;
    let logoPath = "/logo.png";
    if (logoDataUrl) {
      try {
        const match = logoDataUrl.match(/^data:image\/(\w+);base64,(.+)$/);
        if (match) {
          const ext = match[1] === "svg+xml" ? "svg" : match[1];
          const filename = `logo.${ext}`;
          const buffer = Buffer.from(match[2], "base64");
          await pushLogo(repoName, buffer, filename);
          logoUrl = `/${filename}`;
          logoPath = `/${filename}`;
        }
      } catch (logoErr) {
        console.error("[deploy] Failed to push logo:", logoErr);
      }
    }

    const configContent = generateConfigTs(dataForConfig, logoPath);
    await pushFile(repoName, "school.config.ts", configContent, "Configure school via wizard");

    const school = await prisma.school.create({
      data: {
        name: data.school.name,
        slug,
        contactEmail: data.contactEmail,
        configData: dataForConfig as object,
        logoUrl,
        githubRepoName: repoName,
        vercelProjectId: project.projectId,
        deployedUrl: project.url,
      },
    });

    // Send the admin their first magic link email so they can edit later
    try {
      const token = await createMagicLinkToken(data.contactEmail);
      const editUrl = getMagicLinkUrl(token);
      await sendMagicLinkEmail(data.contactEmail, editUrl, data.school.name);
    } catch (emailErr) {
      console.error("[deploy] Failed to send welcome email:", emailErr);
    }

    return NextResponse.json({
      schoolId: school.id,
      deployedUrl: school.deployedUrl,
      vercelProjectId: school.vercelProjectId,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
