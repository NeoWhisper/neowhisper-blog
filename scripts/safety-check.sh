#!/bin/bash
#
# AI Agent Safety Check Script
# Prevents accidental pushes to protected branches
#
# Usage: ./scripts/safety-check.sh [branch-name]
# If no branch provided, checks current branch

set -euo pipefail

# Configuration
PROTECTED_BRANCHES=("main" "master" "production")
ALLOWED_BRANCHES=("contents" "codex/*")

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "🔒 AI Agent Safety Check"
echo "========================"

# Get target branch
TARGET_BRANCH="${1:-$(git branch --show-current)}"
echo "Target branch: $TARGET_BRANCH"

# Check if trying to push to protected branch
for protected in "${PROTECTED_BRANCHES[@]}"; do
    if [[ "$TARGET_BRANCH" == "$protected" ]]; then
        echo -e "${RED}❌ BLOCKED: Attempting to push to protected branch '$TARGET_BRANCH'${NC}"
        echo -e "${RED}   AI agents are NEVER allowed to push to main.${NC}"
        echo ""
        echo "✅ Correct workflow:"
        echo "   1. Create a feature branch: git checkout -b codex/daily-YYYY-MM-DD"
        echo "   2. Make your changes"
        echo "   3. Push to your fork: git push origin codex/daily-YYYY-MM-DD"
        echo "   4. Create PR to 'contents' branch via GitHub"
        exit 1
    fi
done

# Check if branch is allowed
if [[ "$TARGET_BRANCH" == contents ]]; then
    echo -e "${YELLOW}⚠️  WARNING: Pushing to 'contents' branch${NC}"
    echo "   Only the AI agent fork should do this automatically."
    echo "   If you're doing this manually, ensure you have approval."
    exit 0
fi

if [[ "$TARGET_BRANCH" == codex/* ]]; then
    echo -e "${GREEN}✅ OK: Branch '$TARGET_BRANCH' follows naming convention${NC}"
    echo "   This is the correct branch for AI agent content generation."
    exit 0
fi

# Unknown branch
echo -e "${YELLOW}⚠️  WARNING: Unknown branch pattern '$TARGET_BRANCH'${NC}"
echo "   Expected patterns: contents, codex/*"
exit 0
