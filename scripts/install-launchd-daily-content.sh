#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
AGENT_ID="net.neowhisper.daily-content"
PLIST_PATH="${HOME}/Library/LaunchAgents/${AGENT_ID}.plist"
LOG_DIR="${REPO_ROOT}/.logs"

RUN_HOUR="${RUN_HOUR:-9}"
RUN_MINUTE="${RUN_MINUTE:-30}"
OPENAI_BASE_URL="${OPENAI_BASE_URL:-http://127.0.0.1:11434/v1}"
OPENAI_MODEL="${OPENAI_MODEL:-gpt-oss:20b}"
OPENAI_API_MODE="${OPENAI_API_MODE:-chat}"
OPENAI_API_KEY="${OPENAI_API_KEY:-sk-local}"

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
    <string>${REPO_ROOT}/scripts/local-daily-content-pr.sh</string>
  </array>

  <key>WorkingDirectory</key>
  <string>${REPO_ROOT}</string>

  <key>EnvironmentVariables</key>
  <dict>
    <key>PATH</key>
    <string>/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin</string>
    <key>HOME</key>
    <string>${HOME}</string>
    <key>OPENAI_BASE_URL</key>
    <string>${OPENAI_BASE_URL}</string>
    <key>OPENAI_MODEL</key>
    <string>${OPENAI_MODEL}</string>
    <key>OPENAI_API_MODE</key>
    <string>${OPENAI_API_MODE}</string>
    <key>OPENAI_API_KEY</key>
    <string>${OPENAI_API_KEY}</string>
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
  <string>${LOG_DIR}/daily-content.log</string>
  <key>StandardErrorPath</key>
  <string>${LOG_DIR}/daily-content.log</string>
</dict>
</plist>
EOF

launchctl bootout "gui/$(id -u)" "${PLIST_PATH}" >/dev/null 2>&1 || true
launchctl bootstrap "gui/$(id -u)" "${PLIST_PATH}"

echo "Installed launch agent: ${AGENT_ID}"
echo "Schedule: daily at ${RUN_HOUR}:$(printf '%02d' "${RUN_MINUTE}")"
echo "Plist: ${PLIST_PATH}"
echo "Log: ${LOG_DIR}/daily-content.log"
echo "To test now: launchctl kickstart -k gui/$(id -u)/${AGENT_ID}"
