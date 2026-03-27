#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "${REPO_ROOT}"

TARGET_BRANCH="${TARGET_BRANCH:-main}"
REMOTE_NAME="${REMOTE_NAME:-origin}"

REMOTE_REF="refs/remotes/${REMOTE_NAME}/${TARGET_BRANCH}"
LOCAL_REF="refs/heads/${TARGET_BRANCH}"

echo "[sync-main] Fetching ${REMOTE_NAME}/${TARGET_BRANCH}..."
git fetch --prune "${REMOTE_NAME}" "${TARGET_BRANCH}"

if ! git show-ref --verify --quiet "${REMOTE_REF}"; then
  echo "[sync-main] Remote ref ${REMOTE_REF} not found."
  exit 1
fi

REMOTE_SHA="$(git rev-parse "${REMOTE_REF}")"

if ! git show-ref --verify --quiet "${LOCAL_REF}"; then
  git branch --track "${TARGET_BRANCH}" "${REMOTE_NAME}/${TARGET_BRANCH}" >/dev/null
  echo "[sync-main] Created local ${TARGET_BRANCH} from ${REMOTE_NAME}/${TARGET_BRANCH}."
  exit 0
fi

LOCAL_SHA="$(git rev-parse "${LOCAL_REF}")"
if [[ "${LOCAL_SHA}" == "${REMOTE_SHA}" ]]; then
  echo "[sync-main] ${TARGET_BRANCH} is already up to date."
  exit 0
fi

if git merge-base --is-ancestor "${LOCAL_SHA}" "${REMOTE_SHA}"; then
  git update-ref "${LOCAL_REF}" "${REMOTE_SHA}" "${LOCAL_SHA}"
  echo "[sync-main] Fast-forwarded local ${TARGET_BRANCH} to ${REMOTE_NAME}/${TARGET_BRANCH}."
  exit 0
fi

echo "[sync-main] Local ${TARGET_BRANCH} has commits not on ${REMOTE_NAME}/${TARGET_BRANCH}; skipping auto-sync."
echo "[sync-main] Resolve manually if needed: git checkout ${TARGET_BRANCH} && git pull --rebase ${REMOTE_NAME} ${TARGET_BRANCH}"
