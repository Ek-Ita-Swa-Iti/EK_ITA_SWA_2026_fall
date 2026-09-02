#!/usr/bin/env bash
#
# Tiny log summariser — the kind of small script you'll containerise for the
# assignment. It reuses the Session 3 pipeline moves: cut / grep -c / sort / uniq.
#
#   ./report.sh                 # summarises sample.log
#   ./report.sh other.log       # summarises another file

set -euo pipefail

log="${1:-sample.log}"

if [[ ! -s "$log" ]]; then
  echo "report.sh: '$log' is missing or empty" >&2
  exit 1
fi

echo "== Report for $log =="
echo "Total requests  : $(wc -l < "$log" | tr -d ' ')"
echo "Errors (4xx/5xx): $(grep -Ec ' (4|5)[0-9][0-9]$' "$log" || true)"
echo
echo "Top 5 client IPs:"
cut -d' ' -f1 "$log" | sort | uniq -c | sort -rn | head -5
