#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
AGENT_ID="net.neowhisper.sync-main"
PLIST_PATH="${HOME}/Library/LaunchAgents/${AGENT_ID}.plist"
LOG_DIR="${REPO_ROOT}/.logs"

RUN_HOUR="${RUN_HOUR:-9}"
RUN_MINUTE="${RUN_MINUTE:-0}"
TARGET_BRANCH="${TARGET_BRANCH:-main}"
REMOTE_NAME="${REMOTE_NAME:-origin}"

AGENT_PATH="/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin"

mkdir -p "${HOME}/Library/LaunchAgents"
mkdir -p "${LOG_DIR}"

cat > "${PLIST_PATH}" <<EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key>
  <string>${AGENT_ID}</string>

  <key>ProgramArguments</key>
  <array>
    <string>/bin/bash</string>
    <string>${REPO_ROOT}/scripts/sync-local-main.sh</string>
  </array>

  <key>WorkingDirectory</key>
  <string>${REPO_ROOT}</string>

  <key>EnvironmentVariables</key>
  <dict>
    <key>PATH</key>
    <string>${AGENT_PATH}</string>
    <key>HOME</key>
    <string>${HOME}</string>
    <key>TARGET_BRANCH</key>
    <string>${TARGET_BRANCH}</string>
    <key>REMOTE_NAME</key>
    <string>${REMOTE_NAME}</string>
  </dict>

  <key>StartCalendarInterval</key>
  <dict>
    <key>Hour</key>
    <integer>${RUN_HOUR}</integer>
    <key>Minute</key>
    <integer>${RUN_MINUTE}</integer>
  </dict>

  <key>RunAtLoad</key>
  <false/>

  <key>StandardOutPath</key>
  <string>${LOG_DIR}/sync-main.log</string>
  <key>StandardErrorPath</key>
  <string>${LOG_DIR}/sync-main.log</string>
</dict>
</plist>
EOF

launchctl bootout "gui/$(id -u)" "${PLIST_PATH}" >/dev/null 2>&1 || true
launchctl bootstrap "gui/$(id -u)" "${PLIST_PATH}"

echo "Installed launch agent: ${AGENT_ID}"
echo "Schedule: daily at ${RUN_HOUR}:$(printf '%02d' "${RUN_MINUTE}")"
echo "Target branch: ${TARGET_BRANCH}"
echo "Remote: ${REMOTE_NAME}"
echo "Plist: ${PLIST_PATH}"
echo "Log: ${LOG_DIR}/sync-main.log"
echo "To test now: launchctl kickstart -k gui/$(id -u)/${AGENT_ID}"
