import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateSlug, generateConfigTs } from "@/lib/config-generator";
import { createRepoFromTemplate, pushFile } from "@/lib/github";
import { createProject } from "@/lib/vercel";
import type { WizardFormData } from "@/lib/types";

export async function POST(req: NextRequest) {
  try {
    const data: WizardFormData = await req.json();

    const slug = generateSlug(data.school.name);
    const repoName = "schoolwatch-" + slug;

    const repo = await createRepoFromTemplate(repoName);

    const configContent = generateConfigTs(data);
    await pushFile(repoName, "school.config.ts", configContent, "Configure school via wizard");

    const project = await createProject(repoName, repo.fullName);

    const school = await prisma.school.create({
      data: {
        name: data.school.name,
        slug,
        contactEmail: data.contactEmail,
        configData: data as object,
        githubRepoName: repoName,
        vercelProjectId: project.projectId,
        deployedUrl: project.url,
      },
    });

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
