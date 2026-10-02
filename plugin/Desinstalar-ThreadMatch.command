#!/bin/bash
set -euo pipefail
here=$(cd "$(dirname "$0")" && pwd)
source "$here/mac-preferences.sh"
if pgrep -f 'Adobe Illustrator.*\.app/Contents/MacOS' >/dev/null; then
 echo 'Cierra Illustrator antes de desinstalar ThreadMatch.' >&2; exit 1
fi
target="$HOME/Library/Application Support/Adobe/CEP/extensions/com.threadmatch.illustrator"
state="$HOME/Library/Application Support/ThreadMatch/original-preferences"
rm -rf "$target"
if [ "${1:-}" = --restore-debug ] && [ -d "$state" ]; then
 restore_preferences "$state" yes
 rm -rf "$state"
fi
printf '%s\n' 'ThreadMatch desinstalado.'
