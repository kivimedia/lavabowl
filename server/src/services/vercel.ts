/**
 * Vercel API service for managing projects and deployments.
 * Uses the Vercel REST API v6+.
 */

const VERCEL_TOKEN = process.env.VERCEL_TOKEN;
const VERCEL_TEAM_ID = process.env.VERCEL_TEAM_ID; // optional

const BASE_URL = "https://api.vercel.com";

async function vercelFetch(
  path: string,
  options: RequestInit = {}
): Promise<Response> {
  const url = new URL(path, BASE_URL);
  if (VERCEL_TEAM_ID) {
    url.searchParams.set("teamId", VERCEL_TEAM_ID);
  }

  const res = await fetch(url.toString(), {
    ...options,
    headers: {
      Authorization: `Bearer ${VERCEL_TOKEN}`,
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Vercel API error ${res.status}: ${body}`);
  }

  return res;
}

/**
 * Create a new Vercel project linked to a GitHub repo.
 */
export async function createVercelProject(opts: {
  name: string;
  gitRepoFullName: string;
  framework?: string;
  buildCommand?: string;
  outputDirectory?: string;
  envVars?: Record<string, string>;
}) {
  const body: Record<string, unknown> = {
    name: opts.name,
    framework: opts.framework || "vite",
    buildCommand: opts.buildCommand || "npm run build",
    outputDirectory: opts.outputDirectory || "dist",
    gitRepository: {
      type: "github",
      repo: opts.gitRepoFullName,
    },
  };

  // Add environment variables
  if (opts.envVars) {
    body.environmentVariables = Object.entries(opts.envVars).map(
      ([key, value]) => ({
        key,
        value,
        target: ["production", "preview", "development"],
        type: "encrypted",
      })
    );
  }

  const res = await vercelFetch("/v10/projects", {
    method: "POST",
    body: JSON.stringify(body),
  });

  const data = await res.json();
  return {
    projectId: data.id,
    name: data.name,
    accountId: data.accountId,
  };
}

/**
 * Trigger a new deployment for a Vercel project.
 */
export async function createDeployment(opts: {
  projectName: string;
  gitRepoFullName: string;
  branch?: string;
  commitMessage?: string;
}) {
  const [owner, repo] = opts.gitRepoFullName.split("/");

  const body = {
    name: opts.projectName,
    project: opts.projectName,
    target: opts.branch === "main" ? "production" : undefined,
    gitSource: {
      type: "github",
      org: owner,
      repo,
      ref: opts.branch || "main",
    },
  };

  const res = await vercelFetch("/v13/deployments", {
    method: "POST",
    body: JSON.stringify(body),
  });

  const data = await res.json();
  return {
    id: data.id,
    url: data.url ? `https://${data.url}` : null,
    readyState: data.readyState,
    createdAt: data.createdAt,
  };
}

/**
 * Get deployment status.
 */
export async function getDeployment(deploymentId: string) {
  const res = await vercelFetch(`/v13/deployments/${deploymentId}`);
  const data = await res.json();

  return {
    id: data.id,
    url: data.url ? `https://${data.url}` : null,
    readyState: data.readyState as string,
    createdAt: data.createdAt,
    buildingAt: data.buildingAt,
    ready: data.ready,
    errorMessage: data.errorMessage,
  };
}

/**
 * List deployments for a project.
 */
export async function listDeployments(projectId: string, limit = 20) {
  const res = await vercelFetch(
    `/v6/deployments?projectId=${projectId}&limit=${limit}`
  );
  const data = await res.json();

  return (data.deployments || []).map((d: Record<string, unknown>) => ({
    id: d.uid as string,
    url: d.url ? `https://${d.url}` : null,
    state: d.readyState as string,
    createdAt: d.createdAt as number,
    meta: d.meta as Record<string, unknown> | undefined,
  }));
}

/**
 * Add a custom domain to a Vercel project.
 */
export async function addDomain(projectId: string, domain: string) {
  const res = await vercelFetch(`/v10/projects/${projectId}/domains`, {
    method: "POST",
    body: JSON.stringify({ name: domain }),
  });

  const data = await res.json();
  return {
    name: data.name,
    verified: data.verified,
    verification: data.verification,
  };
}

/**
 * Remove a domain from a Vercel project.
 */
export async function removeDomain(projectId: string, domain: string) {
  await vercelFetch(`/v9/projects/${projectId}/domains/${domain}`, {
    method: "DELETE",
  });
}

/**
 * Get domain verification status and DNS records needed.
 */
export async function getDomainConfig(domain: string) {
  const res = await vercelFetch(`/v6/domains/${domain}/config`);
  const data = await res.json();

  return {
    configuredBy: data.configuredBy,
    acceptedChallenges: data.acceptedChallenges,
    misconfigured: data.misconfigured,
  };
}

/**
 * Add environment variables to a Vercel project.
 */
export async function addEnvVars(
  projectId: string,
  envVars: Record<string, string>
) {
  const variables = Object.entries(envVars).map(([key, value]) => ({
    key,
    value,
    target: ["production", "preview", "development"],
    type: "encrypted",
  }));

  const res = await vercelFetch(`/v10/projects/${projectId}/env`, {
    method: "POST",
    body: JSON.stringify(variables),
  });

  return res.json();
}

/**
 * Delete a Vercel project.
 */
export async function deleteVercelProject(projectId: string) {
  await vercelFetch(`/v9/projects/${projectId}`, {
    method: "DELETE",
  });
}

/**
 * Get Vercel project info.
 */
export async function getProject(projectIdOrName: string) {
  const res = await vercelFetch(`/v9/projects/${projectIdOrName}`);
  const data = await res.json();

  return {
    id: data.id,
    name: data.name,
    framework: data.framework,
    latestDeployments: data.latestDeployments,
  };
}
