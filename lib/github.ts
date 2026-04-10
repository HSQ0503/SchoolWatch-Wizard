const GITHUB_TOKEN = process.env.GITHUB_TOKEN!;
const GITHUB_ORG = process.env.GITHUB_ORG!;
const TEMPLATE_OWNER = process.env.GITHUB_TEMPLATE_OWNER || "HSQ0503";

const BASE = "https://api.github.com";

const headers = {
  Authorization: `Bearer ${GITHUB_TOKEN}`,
  Accept: "application/vnd.github+json",
  "Content-Type": "application/json",
};

export async function createRepoFromTemplate(
  name: string
): Promise<{ fullName: string; url: string }> {
  const res = await fetch(
    `${BASE}/repos/${TEMPLATE_OWNER}/SchoolWatch/generate`,
    {
      method: "POST",
      headers,
      body: JSON.stringify({
        owner: GITHUB_ORG,
        name,
        private: false,
      }),
    }
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Failed to create repo from template: ${res.status} ${err}`);
  }

  const data = await res.json();
  return { fullName: data.full_name as string, url: data.html_url as string };
}

// Wait for a template repo to finish initializing (GitHub copies files async)
export async function waitForRepoReady(
  repoName: string,
  maxAttempts = 15,
): Promise<void> {
  for (let i = 0; i < maxAttempts; i++) {
    const res = await fetch(
      `${BASE}/repos/${GITHUB_ORG}/${repoName}/contents/package.json`,
      { headers }
    );
    if (res.ok) {
      console.log(`[github] Repo ready after ${i + 1} attempt(s)`);
      return;
    }
    console.log(`[github] Repo not ready yet (attempt ${i + 1}/${maxAttempts}), waiting...`);
    await new Promise((r) => setTimeout(r, 2000));
  }
  throw new Error("Timed out waiting for template repo to initialize");
}

async function getFileSha(
  repoName: string,
  path: string
): Promise<string | null> {
  const res = await fetch(
    `${BASE}/repos/${GITHUB_ORG}/${repoName}/contents/${path}`,
    { headers }
  );
  if (res.status === 404) return null;
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Failed to check file SHA: ${res.status} ${err}`);
  }
  const data = await res.json();
  return data.sha as string;
}

export async function pushFile(
  repoName: string,
  path: string,
  content: string,
  message: string,
  maxRetries = 5,
): Promise<void> {
  const encoded = Buffer.from(content, "utf-8").toString("base64");

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    // Re-fetch SHA on each attempt in case the repo state changed
    const sha = await getFileSha(repoName, path);
    console.log(`[github] pushFile "${path}" attempt ${attempt + 1}/${maxRetries}, sha=${sha ?? "null"}`);

    const body: Record<string, unknown> = {
      message,
      content: encoded,
    };
    if (sha) body.sha = sha;

    const res = await fetch(
      `${BASE}/repos/${GITHUB_ORG}/${repoName}/contents/${path}`,
      {
        method: "PUT",
        headers,
        body: JSON.stringify(body),
      }
    );

    if (res.ok) {
      console.log(`[github] pushFile "${path}" succeeded on attempt ${attempt + 1}`);
      return;
    }

    const err = await res.text();

    // 409 = git ref conflict (template still settling), retry after backoff
    if (res.status === 409 && attempt < maxRetries - 1) {
      const delay = 3000 * (attempt + 1);
      console.log(`[github] pushFile "${path}" got 409, retrying in ${delay}ms...`);
      await new Promise((r) => setTimeout(r, delay));
      continue;
    }

    throw new Error(`Failed to push file "${path}": ${res.status} ${err}`);
  }
}

export async function pushLogo(
  repoName: string,
  logoBuffer: Buffer,
  filename: string
): Promise<void> {
  const path = `public/${filename}`;
  const sha = await getFileSha(repoName, path);
  const encoded = logoBuffer.toString("base64");

  const body: Record<string, unknown> = {
    message: `Add logo: ${filename}`,
    content: encoded,
  };
  if (sha) body.sha = sha;

  const res = await fetch(
    `${BASE}/repos/${GITHUB_ORG}/${repoName}/contents/${path}`,
    {
      method: "PUT",
      headers,
      body: JSON.stringify(body),
    }
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Failed to push logo "${filename}": ${res.status} ${err}`);
  }
}
