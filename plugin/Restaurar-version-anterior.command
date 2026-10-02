#!/bin/bash
set -euo pipefail
if pgrep -f 'Adobe Illustrator.*\.app/Contents/MacOS' >/dev/null; then echo 'Cierra Illustrator antes de restaurar.' >&2; exit 1; fi
state_root="$HOME/Library/Application Support/ThreadMatch"
previous="$state_root/previous-extension"
target="$HOME/Library/Application Support/Adobe/CEP/extensions/com.threadmatch.illustrator"
stage="$state_root/restore-$$"
[ -f "$previous/CSXS/manifest.xml" ] || { echo 'No hay versión anterior guardada.' >&2; exit 1; }
cleanup(){ local rc=$?; trap - EXIT; if [ ! -d "$target" ] && [ -d "$stage" ]; then mv "$stage" "$target"; fi; exit "$rc"; }
trap cleanup EXIT
if [ -d "$target" ]; then mv "$target" "$stage"; fi
mv "$previous" "$target"
if [ -d "$stage" ]; then mv "$stage" "$previous"; fi
printf '%s\n' 'Versión anterior restaurada. Tus favoritos y opciones se conservan.'
