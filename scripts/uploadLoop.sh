#!/bin/bash
# Uploads files to Google Drive in small batches (10 files each).
# Each batch is a separate node process to avoid memory issues.
# Safe to re-run - picks up where it left off.
#
# Usage: bash scripts/uploadLoop.sh
# Or background: bash scripts/uploadLoop.sh &
cd /home/runner/workspace
LOG="docs/Data_feedback_Sem12526/process.log"

echo "$(date -Iseconds) - [UPLOAD LOOP] Started (PID $$)" >> "$LOG"

for i in $(seq 1 200); do
  OUTPUT=$(node scripts/uploadSmallBatch.cjs 2>&1)
  
  if echo "$OUTPUT" | grep -q "^DONE:"; then
    echo "$(date -Iseconds) - [UPLOAD LOOP] Complete! All files uploaded." >> "$LOG"
    exit 0
  fi

  if ! echo "$OUTPUT" | grep -q "^OK:"; then
    echo "$(date -Iseconds) - [UPLOAD LOOP] Error on iteration $i: $OUTPUT" >> "$LOG"
    sleep 5
  fi
  
  sleep 1
done

echo "$(date -Iseconds) - [UPLOAD LOOP] Reached max iterations" >> "$LOG"
