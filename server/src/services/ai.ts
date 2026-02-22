/**
 * AI service using Claude for fix triage and code generation.
 * - Claude Haiku: Fast triage (classify complexity, estimate scope)
 * - Claude Sonnet: Code analysis and fix generation
 */

import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export interface TriageResult {
  complexity: "simple" | "complex" | "out_of_scope";
  summary: string;
  affectedFiles: string[];
  estimatedChanges: number;
  confidence: number;
  reasoning: string;
}

export interface FixResult {
  success: boolean;
  changes: FileChange[];
  explanation: string;
  testSuggestions: string[];
  error?: string;
}

export interface FileChange {
  filePath: string;
  action: "modify" | "create" | "delete";
  originalContent?: string;
  newContent: string;
  description: string;
}

/**
 * Triage a fix request using Claude Haiku (fast and cheap).
 * Determines complexity and affected files.
 */
export async function triageFix(
  description: string,
  projectContext: {
    fileTree: string[];
    techStack?: string;
    repoFullName?: string;
  }
): Promise<TriageResult> {
  const response = await anthropic.messages.create({
    model: "claude-3-5-haiku-20241022",
    max_tokens: 1024,
    system: `You are a code triage assistant for a web application maintenance service.
Analyze fix requests and classify them by complexity.

Complexity levels:
- "simple": Small changes — text updates, CSS tweaks, single-file fixes, config changes. Can be done in under 30 minutes.
- "complex": Multi-file changes, logic modifications, new features, API changes. Takes 1-4 hours.
- "out_of_scope": Major rewrites, new integrations, changes requiring external services setup, or requests that are unclear/impossible.

Respond in JSON only with this exact schema:
{
  "complexity": "simple" | "complex" | "out_of_scope",
  "summary": "one-line summary of what needs to change",
  "affectedFiles": ["list", "of", "likely", "file", "paths"],
  "estimatedChanges": number_of_lines,
  "confidence": 0.0_to_1.0,
  "reasoning": "brief explanation of your classification"
}`,
    messages: [
      {
        role: "user",
        content: `Fix request: "${description}"

Project files: ${projectContext.fileTree.slice(0, 100).join("\n")}
${projectContext.techStack ? `Tech stack: ${projectContext.techStack}` : "Tech stack: React + Vite + TypeScript + Tailwind + shadcn/ui + Supabase"}`,
      },
    ],
  });

  const text = response.content[0].type === "text" ? response.content[0].text : "";

  // Extract JSON from response
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("Failed to parse triage response");
  }

  return JSON.parse(jsonMatch[0]) as TriageResult;
}

/**
 * Generate a code fix using Claude Sonnet (powerful and accurate).
 * Takes the fix description and relevant source files, returns file changes.
 */
export async function generateFix(
  description: string,
  triageResult: TriageResult,
  sourceFiles: { path: string; content: string }[]
): Promise<FixResult> {
  const fileContext = sourceFiles
    .map((f) => `--- ${f.path} ---\n${f.content}`)
    .join("\n\n");

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 8192,
    system: `You are an expert web developer fixing code for a React + TypeScript project.
You receive a fix request, triage information, and the relevant source files.
Your job is to generate the exact code changes needed.

Rules:
1. Only modify files that need changes
2. Preserve the existing code style, formatting, and patterns
3. Make minimal changes — don't refactor unrelated code
4. If adding new functionality, follow existing patterns in the codebase
5. Ensure TypeScript types are correct
6. Test your logic mentally before outputting

Respond in JSON only with this exact schema:
{
  "success": true,
  "changes": [
    {
      "filePath": "src/path/to/file.tsx",
      "action": "modify",
      "newContent": "complete new file content here",
      "description": "what was changed and why"
    }
  ],
  "explanation": "summary of all changes made",
  "testSuggestions": ["suggestion 1", "suggestion 2"]
}

If you cannot make the fix, respond with:
{
  "success": false,
  "changes": [],
  "explanation": "why the fix cannot be made",
  "testSuggestions": [],
  "error": "specific error reason"
}`,
    messages: [
      {
        role: "user",
        content: `Fix request: "${description}"

Triage: ${JSON.stringify(triageResult)}

Source files:
${fileContext}`,
      },
    ],
  });

  const text = response.content[0].type === "text" ? response.content[0].text : "";

  // Extract JSON from response
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    return {
      success: false,
      changes: [],
      explanation: "Failed to parse AI response",
      testSuggestions: [],
      error: "AI response was not valid JSON",
    };
  }

  try {
    return JSON.parse(jsonMatch[0]) as FixResult;
  } catch {
    return {
      success: false,
      changes: [],
      explanation: "Failed to parse AI response JSON",
      testSuggestions: [],
      error: text.slice(0, 500),
    };
  }
}
