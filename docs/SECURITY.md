# Security Policy

HandNotesAI stores people's handwritten notes and turns them into study material, so their notes and accounts must stay private. This document explains how to report a vulnerability, how the code is screened, and the rules contributors follow.

## Supported versions

The project is in early development. Only the latest code on `main` is supported and receives security fixes.

## Reporting a vulnerability

**Please do not open a public issue for security problems.**

Report privately through GitHub: go to the repository's **Security** tab, then **Report a vulnerability**. Include:

- what the issue is and where it is (file, route or feature)
- steps to reproduce, or a proof of concept
- the impact you expect (for example, reading another user's notes)

We will acknowledge the report, keep you updated while we work on a fix, and credit you when it ships if you'd like. Please give us a reasonable chance to fix the issue before you disclose it publicly.

## Automated security review

Every pull request is reviewed by the [Claude Code Security Review](https://github.com/anthropics/claude-code-security-review) GitHub Action ([`.github/workflows/security-review.yml`](../.github/workflows/security-review.yml)). It reads the PR's changes and posts any findings as comments on the PR.

**What it checks**

- The action's built-in categories: injection, authentication and authorization flaws, data exposure, cryptography, unsafe deserialization, XSS and more.
- Project-specific risks in [`.github/security/custom-security-scan-instructions.txt`](../.github/security/custom-security-scan-instructions.txt):
  - Clerk authentication on every data access, and ownership checks on notes
  - cross-user leaks through `'use cache'`
  - secrets in `NEXT_PUBLIC_*` variables
  - upload validation
  - prompt injection and XSS in the AI features

**Limits**

- It is a second pair of eyes, not a replacement for human review. A clean run does not mean a change is safe.
- The action is not hardened against prompt injection, so it only runs on PRs from branches in this repository and skips draft PRs. Maintainers review fork PRs manually.
- It reviews the diff, not the whole codebase. Run a full review before major releases.

**Run it locally.** Claude Code has the same review built in: run `/security-review` in Claude Code to check your pending changes before you open a PR.

### Maintainer setup (one-time)

1. Add a repository secret named `CLAUDE_API_KEY` (**Settings → Secrets and variables → Actions**). The key must be enabled for both the Claude API and Claude Code.
2. Under **Settings → Actions → General → Fork pull request workflows**, select **Require approval for all external contributors**.
3. Under **Settings → Code security**, turn on **Private vulnerability reporting** so the "Report a vulnerability" button works.
4. Optional: make **Security Review** a required status check in the branch protection rules for `main`.
5. The action is pinned to a commit SHA. Update it on purpose. The command is in a comment in the workflow file.

## Secrets and configuration

- **Never commit secrets.** `.env*` files are git-ignored. Local Clerk development keys live in `.env.local`; pull them with `npx clerk@latest env pull`.
- **Only public values get the `NEXT_PUBLIC_` prefix.** The Clerk publishable key is public by design. `CLERK_SECRET_KEY`, AI provider keys and database or storage credentials must only be read on the server and never imported into a `'use client'` file.
- **If a secret leaks**, rotate it right away in the provider's dashboard (Clerk, Anthropic and so on), then remove it from the code and git history.
- **Remote images** are allowed only from `covers.openlibrary.org` (`images.remotePatterns` in `next.config.ts`). Don't add wildcard hosts.

## Security rules for contributors

- Check auth where the data is read: call `await auth()` in Server Components, Route Handlers and Server Actions. `proxy.ts` alone is not enough.
- Load and change notes only by `id` **and** the signed-in `userId`. Never trust an owner ID sent from the client.
- Keep per-user data out of `'use cache'` unless the user is part of the cache key.
- Validate uploads on the server (type, size, page count). Never serve user-uploaded SVG or HTML inline.
- Treat note text and AI output as untrusted. Don't render it with `dangerouslySetInnerHTML` without sanitizing it, and don't let it control tools or actions.
