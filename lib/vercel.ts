const VERCEL_TOKEN = process.env.VERCEL_TOKEN!;
const VERCEL_TEAM_ID = process.env.VERCEL_TEAM_ID;

const BASE = "https://api.vercel.com";

const headers = {
  Authorization: `Bearer ${VERCEL_TOKEN}`,
  "Content-Type": "application/json",
};

function teamParam(prefix: "?" | "&" = "?"): string {
  return VERCEL_TEAM_ID ? `${prefix}teamId=${VERCEL_TEAM_ID}` : "";
}

export async function createProject(
  name: string,
  gitRepoFullName: string
): Promise<{ projectId: string; url: string }> {
  const res = await fetch(`${BASE}/v10/projects${teamParam()}`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      name,
      framework: "nextjs",
      gitRepository: {
        repo: gitRepoFullName,
        type: "github",
      },
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Failed to create Vercel project: ${res.status} ${err}`);
  }

  const data = await res.json();
  return {
    projectId: data.id as string,
    url: `https://${data.name}.vercel.app`,
  };
}

type DeploymentSummary = { id: string; state: string; url: string } | null;

export async function getLatestDeployment(
  projectId: string
): Promise<DeploymentSummary> {
  const team = teamParam("&");
  const res = await fetch(
    `${BASE}/v6/deployments?projectId=${projectId}&limit=1${team}`,
    { headers }
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Failed to get deployments: ${res.status} ${err}`);
  }

  const data = await res.json();
  const deployment = data.deployments?.[0];
  if (!deployment) return null;

  return {
    id: deployment.uid as string,
    state: deployment.state as string,
    url: deployment.url as string,
  };
}

export async function getDeploymentStatus(
  deploymentId: string
): Promise<string> {
  const team = teamParam();
  const res = await fetch(
    `${BASE}/v13/deployments/${deploymentId}${team}`,
    { headers }
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(
      `Failed to get deployment status for "${deploymentId}": ${res.status} ${err}`
    );
  }

  const data = await res.json();
  return data.readyState as string;
}
