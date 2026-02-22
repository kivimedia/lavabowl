import { Octokit } from "octokit";

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

// The org or user that owns the LavaBowl-managed repos
const GITHUB_OWNER = process.env.GITHUB_OWNER || "kivimedia";

/**
 * Fork a user's repo into the LavaBowl org for management.
 * Returns the new repo info.
 */
export async function forkRepo(repoFullName: string) {
  const [owner, repo] = repoFullName.split("/");
  if (!owner || !repo) throw new Error("Invalid repo format. Use owner/repo");

  const { data } = await octokit.rest.repos.createFork({
    owner,
    repo,
    organization: GITHUB_OWNER !== owner ? GITHUB_OWNER : undefined,
    name: `${repo}-lavabowl`,
    default_branch_only: true,
  });

  return {
    fullName: data.full_name,
    htmlUrl: data.html_url,
    cloneUrl: data.clone_url,
    defaultBranch: data.default_branch,
  };
}

/**
 * Parse a GitHub URL into owner/repo format.
 */
export function parseGitHubUrl(url: string): string {
  // Handle various GitHub URL formats
  const patterns = [
    /github\.com\/([^/]+\/[^/]+?)(?:\.git)?$/,
    /github\.com\/([^/]+\/[^/]+?)(?:\/.*)?$/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }

  // If it's already in owner/repo format
  if (/^[^/]+\/[^/]+$/.test(url)) return url;

  throw new Error("Invalid GitHub URL or repo format");
}

/**
 * Get repo info (check it exists and is accessible).
 */
export async function getRepoInfo(repoFullName: string) {
  const [owner, repo] = repoFullName.split("/");
  if (!owner || !repo) throw new Error("Invalid repo format");

  const { data } = await octokit.rest.repos.get({ owner, repo });

  return {
    fullName: data.full_name,
    htmlUrl: data.html_url,
    cloneUrl: data.clone_url,
    defaultBranch: data.default_branch,
    isPrivate: data.private,
    language: data.language,
  };
}

/**
 * Create a new branch on a repo (for staging fix previews).
 */
export async function createBranch(
  repoFullName: string,
  branchName: string,
  fromBranch?: string
) {
  const [owner, repo] = repoFullName.split("/");
  if (!owner || !repo) throw new Error("Invalid repo format");

  // Get the sha of the base branch
  const baseBranch = fromBranch || "main";
  const { data: refData } = await octokit.rest.git.getRef({
    owner,
    repo,
    ref: `heads/${baseBranch}`,
  });

  // Create the new branch
  const { data } = await octokit.rest.git.createRef({
    owner,
    repo,
    ref: `refs/heads/${branchName}`,
    sha: refData.object.sha,
  });

  return { ref: data.ref, sha: data.object.sha };
}

/**
 * Get file content from a repo.
 */
export async function getFileContent(
  repoFullName: string,
  filePath: string,
  branch?: string
) {
  const [owner, repo] = repoFullName.split("/");
  if (!owner || !repo) throw new Error("Invalid repo format");

  const { data } = await octokit.rest.repos.getContent({
    owner,
    repo,
    path: filePath,
    ref: branch,
  });

  if ("content" in data) {
    return {
      content: Buffer.from(data.content, "base64").toString("utf-8"),
      sha: data.sha,
    };
  }

  throw new Error("Path is a directory, not a file");
}

/**
 * Update or create a file in a repo (commit directly).
 */
export async function updateFile(
  repoFullName: string,
  filePath: string,
  content: string,
  commitMessage: string,
  branch?: string,
  existingSha?: string
) {
  const [owner, repo] = repoFullName.split("/");
  if (!owner || !repo) throw new Error("Invalid repo format");

  const { data } = await octokit.rest.repos.createOrUpdateFileContents({
    owner,
    repo,
    path: filePath,
    message: commitMessage,
    content: Buffer.from(content).toString("base64"),
    branch: branch || "main",
    sha: existingSha,
  });

  return {
    commitSha: data.commit.sha,
    htmlUrl: data.content?.html_url,
  };
}

/**
 * Delete a branch (cleanup after fix is deployed or rejected).
 */
export async function deleteBranch(repoFullName: string, branchName: string) {
  const [owner, repo] = repoFullName.split("/");
  if (!owner || !repo) throw new Error("Invalid repo format");

  await octokit.rest.git.deleteRef({
    owner,
    repo,
    ref: `heads/${branchName}`,
  });
}

/**
 * List recent commits on a branch.
 */
export async function listCommits(
  repoFullName: string,
  branch?: string,
  perPage = 10
) {
  const [owner, repo] = repoFullName.split("/");
  if (!owner || !repo) throw new Error("Invalid repo format");

  const { data } = await octokit.rest.repos.listCommits({
    owner,
    repo,
    sha: branch || "main",
    per_page: perPage,
  });

  return data.map((c) => ({
    sha: c.sha,
    message: c.commit.message,
    date: c.commit.committer?.date || c.commit.author?.date,
    author: c.commit.author?.name,
  }));
}
