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
  message: string
): Promise<void> {
  const sha = await getFileSha(repoName, path);
  const encoded = Buffer.from(content, "utf-8").toString("base64");

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

  if (!res.ok) {
    const err = await res.text();
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
