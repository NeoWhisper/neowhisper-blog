# AI Agent Setup Guide

Complete guide for setting up the automated content generation agent using a separate GitHub account and fork.

## Overview

The AI agent runs on a **fork** of the main repository and creates Pull Requests to the upstream `contents` branch. This ensures:
- No direct access to `main` branch
- All changes go through human review
- Safe, auditable content pipeline

## Architecture

```
┌─────────────────┐      PR      ┌──────────────────┐      PR      ┌─────────┐
│  NeoWhisperBot  │ ─────────────> │  upstream/contents│ ────────────> │  main   │
│    (fork)       │                │   (your repo)    │   (merge)    │ (deploy)│
└─────────────────┘                └──────────────────┘              └─────────┘
        │                                   │
        │  cron: 9:30 JST                   │  manual review
        │  (00:30 UTC)                      │  required
        v                                   v
  ┌─────────────┐                    ┌─────────────┐
  │ Daily Post  │                    │  Human      │
  │ Generation  │                    │  Review     │
  └─────────────┘                    └─────────────┘
```

## Prerequisites

1. **GitHub Account**: NeoWhisperBot (separate from your main account)
2. **Fork**: NeoWhisperBot/neowhisper-blog forked from NeoWhisper/neowhisper-blog
3. **Secrets**: API keys configured in fork settings

## Setup Steps

### 1. Create Fork

```bash
# As NeoWhisperBot on GitHub:
# 1. Go to https://github.com/NeoWhisper/neowhisper-blog
# 2. Click "Fork" button
# 3. Fork to NeoWhisperBot/neowhisper-blog
```

### 2. Configure Upstream Remote

```bash
# Clone the fork locally (as NeoWhisperBot)
git clone https://github.com/NeoWhisperBot/neowhisper-blog.git
cd neowhisper-blog

# Add upstream remote
git remote add upstream https://github.com/NeoWhisper/neowhisper-blog.git

# Fetch upstream branches
git fetch upstream

# Create local contents branch tracking upstream
git checkout -b contents upstream/contents
```

### 3. Configure GitHub Secrets (Fork Settings)

In **NeoWhisperBot/neowhisper-blog** → Settings → Secrets → Actions:

| Secret | Value | Required |
|--------|-------|----------|
| `OPENAI_API_KEY` | Your OpenAI/API key | Yes |
| `OPENAI_BASE_URL` | API endpoint URL | Yes |
| `GH_PAT` | Personal Access Token with `repo` scope | Yes |
| `COVER_IMAGE` | Default cover image path | No |
| `AUTHOR_NAME` | Post author name | No |

### 4. Enable GitHub Actions (Fork)

In **NeoWhisperBot/neowhisper-blog** → Settings → Actions → General:
- Select: "Allow all actions and reusable workflows"
- Select: "Allow workflows created by GitHub"

### 5. Branch Protection (Your Main Repo)

In **NeoWhisper/neowhisper-blog** → Settings → Branches:

Add rule for `main`:
- ✅ Require a pull request before merging
- ✅ Require approvals (1)
- ✅ Dismiss stale PR approvals
- ✅ Include administrators (optional but recommended)

This **physically blocks** the AI agent from pushing to main.

## Workflow Process

### Daily Schedule (9:30 JST / 00:30 UTC)

1. **Cron Trigger**: Workflow runs on NeoWhisperBot fork
2. **Content Generation**: Script creates new posts
3. **Branch Creation**: `codex/daily-YYYY-MM-DD` branch pushed to fork
4. **Pull Request**: Auto-created to upstream `contents`
5. **Human Review**: You review via GitHub + Vercel preview
6. **Merge**: You merge to `contents`
7. **Auto PR**: `contents` → `main` PR created automatically
8. **Deploy**: Merge to `main` triggers Vercel deployment

### Manual Trigger

```bash
# Via GitHub UI:
# 1. Go to NeoWhisperBot/neowhisper-blog/actions
# 2. Select "Daily AI Content Generation"
# 3. Click "Run workflow"
```

## Safety Rules

The AI agent follows these strict rules (documented in `AGENTS.md`):

1. **NEVER push to `main`** - Only creates PRs to `contents`
2. **ALWAYS use PRs** - No direct commits to protected branches
3. **Human review required** - You control all merges
4. **Read-only upstream** - Fork only pulls, never pushes directly to upstream

## Troubleshooting

### Workflow Not Running

Check:
- [ ] Secrets configured correctly in fork
- [ ] GitHub Actions enabled in fork settings
- [ ] Workflow file exists at `.github/workflows/daily-ai-content.yml`

### PR Not Created

Check:
- [ ] `GH_PAT` has `repo` scope
- [ ] Fork has write access to create branches
- [ ] Upstream `contents` branch exists

### Content Not Generated

Check:
- [ ] `OPENAI_API_KEY` is valid
- [ ] `OPENAI_BASE_URL` is accessible from GitHub Actions
- [ ] API has sufficient quota

## Maintenance

### Updating Fork

```bash
# Sync fork with upstream
git fetch upstream
git checkout contents
git reset --hard upstream/contents
git push origin contents --force
```

### Rotating Secrets

1. Generate new PAT in NeoWhisperBot account settings
2. Update `GH_PAT` in fork secrets
3. Update `OPENAI_API_KEY` if needed

## Monitoring

Check these locations:
- **Actions**: https://github.com/NeoWhisperBot/neowhisper-blog/actions
- **PRs**: https://github.com/NeoWhisper/neowhisper-blog/pulls
- **Logs**: `.logs/daily-content.log` in generated branches

## Support

For issues:
1. Check workflow logs in Actions tab
2. Review `AGENTS.md` safety rules
3. Verify secret configuration
4. Check API key quota/validity

---

**Last Updated**: 2026-04-21
**Workflow Version**: v1.0
