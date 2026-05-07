#!/usr/bin/env bash
#
# E2E Test Assertion Quality Check
# Scans .spec.ts files for problematic patterns and reports test quality.
#

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
SPECS_DIR="$(cd "$SCRIPT_DIR/../specs" && pwd)"

# Thresholds
CONSOLE_LOG_THRESHOLD=10
CATCH_FALSE_THRESHOLD=10

# Counters
total_files=0
total_console_log=0
total_catch_false=0
total_test_skip=0
total_real_assertions=0

# Per-file tracking (for reporting)
declare -a file_names=()
declare -a file_console_log=()
declare -a file_catch_false=()
declare -a file_test_skip=()
declare -a file_real_assertions=()

echo "============================================"
echo "  E2E Test Assertion Quality Report"
echo "============================================"
echo ""
echo "Scanning: $SPECS_DIR"
echo "Pattern:  *.spec.ts"
echo ""

# Scan all .spec.ts files
shopt -s nullglob
spec_files=("$SPECS_DIR"/*.spec.ts)
shopt -u nullglob

if [ ${#spec_files[@]} -eq 0 ]; then
  echo "ERROR: No .spec.ts files found in $SPECS_DIR"
  exit 1
fi

count_pattern() {
  local file="$1"
  local pattern="$2"
  local result
  result=$(grep -c "$pattern" "$file" || true)
  echo "${result:-0}"
}

for spec_file in "${spec_files[@]}"; do
  filename="$(basename "$spec_file")"
  file_names+=("$filename")

  # Count console.log usage
  count_console_log=$(count_pattern "$spec_file" 'console\.log')

  # Count catch(false) patterns
  count_catch_false=$(count_pattern "$spec_file" '\.catch(false)')

  # Count test.skip() calls
  count_test_skip=$(count_pattern "$spec_file" 'test\.skip(')

  # Count real assertions: await expect(
  count_real_assertions=$(count_pattern "$spec_file" 'await expect(')

  file_console_log+=("$count_console_log")
  file_catch_false+=("$count_catch_false")
  file_test_skip+=("$count_test_skip")
  file_real_assertions+=("$count_real_assertions")

  total_files=$((total_files + 1))
  total_console_log=$((total_console_log + count_console_log))
  total_catch_false=$((total_catch_false + count_catch_false))
  total_test_skip=$((total_test_skip + count_test_skip))
  total_real_assertions=$((total_real_assertions + count_real_assertions))
done

# Print per-file details
echo "--------------------------------------------"
printf "%-45s %8s %8s %8s %8s\n" "FILE" "LOG" "CATCH(F)" "SKIP" "EXPECT"
echo "--------------------------------------------"

for i in "${!file_names[@]}"; do
  printf "%-45s %8s %8s %8s %8s\n" \
    "${file_names[$i]}" \
    "${file_console_log[$i]}" \
    "${file_catch_false[$i]}" \
    "${file_test_skip[$i]}" \
    "${file_real_assertions[$i]}"
done

echo "--------------------------------------------"
printf "%-45s %8s %8s %8s %8s\n" "TOTAL ($total_files files)" "$total_console_log" "$total_catch_false" "$total_test_skip" "$total_real_assertions"
echo "--------------------------------------------"
echo ""

# Print summary and assessment
echo "============================================"
echo "  Quality Assessment"
echo "============================================"
echo ""

# Check thresholds
exit_code=0

if [ "$total_console_log" -gt "$CONSOLE_LOG_THRESHOLD" ]; then
  echo "[FAIL] console.log usage: $total_console_log (threshold: $CONSOLE_LOG_THRESHOLD)"
  echo "       -> Console.log should not replace real assertions"
  exit_code=1
else
  echo "[PASS] console.log usage: $total_console_log (threshold: $CONSOLE_LOG_THRESHOLD)"
fi

if [ "$total_catch_false" -gt "$CATCH_FALSE_THRESHOLD" ]; then
  echo "[FAIL] .catch(false) patterns: $total_catch_false (threshold: $CATCH_FALSE_THRESHOLD)"
  echo "       -> .catch(false) suppresses errors instead of asserting"
  exit_code=1
else
  echo "[PASS] .catch(false) patterns: $total_catch_false (threshold: $CATCH_FALSE_THRESHOLD)"
fi

echo ""
echo "[INFO] test.skip() calls: $total_test_skip (review if intentional)"
echo "[INFO] Real assertions (await expect): $total_real_assertions"
echo ""

# Quality ratio
if [ "$total_real_assertions" -gt 0 ] && [ "$total_console_log" -gt 0 ]; then
  ratio=$(awk "BEGIN {printf \"%.2f\", $total_real_assertions / $total_console_log}")
  echo "[INFO] Assertion-to-Log ratio: $ratio (higher is better)"
fi

echo ""

if [ "$exit_code" -eq 0 ]; then
  echo "Overall: PASS - Assertion quality is acceptable"
else
  echo "Overall: FAIL - Assertion quality needs improvement"
  echo ""
  echo "Recommendations:"
  if [ "$total_console_log" -gt "$CONSOLE_LOG_THRESHOLD" ]; then
    echo "  - Replace console.log() calls with proper Playwright assertions (await expect)"
    echo "  - Use await expect(locator).toHaveText() instead of console.log(value)"
  fi
  if [ "$total_catch_false" -gt "$CATCH_FALSE_THRESHOLD" ]; then
    echo "  - Replace .catch(false) with .catch(error => { expect(error).toBeDefined() })"
    echo "    or use try/catch blocks with proper assertions"
  fi
fi

echo "============================================"

exit $exit_code
