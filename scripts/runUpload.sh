#!/bin/bash
# Self-restarting upload script - restarts on crash until all files are uploaded
cd "$(dirname "$0")/.."
LOG="docs/Data_feedback_Sem12526/process.log"

while true; do
  REMAINING=$(node -e "
    const fs=require('fs'),p=require('path');
    const dir='docs/Data_feedback_Sem12526/reports';
    const prog='docs/Data_feedback_Sem12526/upload_progress.json';
    const all=fs.readdirSync(dir).length;
    const done=fs.existsSync(prog)?JSON.parse(fs.readFileSync(prog,'utf8')).length:0;
    console.log(all-done);
  " 2>/dev/null)

  if [ "$REMAINING" = "0" ]; then
    echo "$(date -Iseconds) - [UPLOAD] All files uploaded!" >> "$LOG"
    break
  fi

  echo "$(date -Iseconds) - [UPLOAD] $REMAINING files remaining, starting batch..." >> "$LOG"
  node scripts/uploadAllToDrive.cjs 2>&1 | tail -5
  echo "$(date -Iseconds) - [UPLOAD] Process exited, restarting in 5s..." >> "$LOG"
  sleep 5
done
