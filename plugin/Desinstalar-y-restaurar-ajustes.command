#!/bin/bash
set -euo pipefail
here=$(cd "$(dirname "$0")" && pwd)
bash "$here/Desinstalar-ThreadMatch.command" --restore-debug
