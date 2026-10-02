#!/bin/bash
set -euo pipefail
here=$(cd "$(dirname "$0")" && pwd)
source "$here/mac-preferences.sh"
if pgrep -f 'Adobe Illustrator.*\.app/Contents/MacOS' >/dev/null; then
 echo 'Cierra Illustrator antes de instalar ThreadMatch.' >&2; exit 1
fi
source_dir="$here/com.threadmatch.illustrator"
[ -f "$source_dir/CSXS/manifest.xml" ] || { echo 'Extrae el ZIP completo antes de instalar.' >&2; exit 1; }
extensions="$HOME/Library/Application Support/Adobe/CEP/extensions"
state_root="$HOME/Library/Application Support/ThreadMatch"
target="$extensions/com.threadmatch.illustrator"
stage="$state_root/stage-$$"
transaction="$state_root/transaction-$$"
previous="$state_root/previous-$$"
installed=no
moved=no
committed=no
cleanup() {
 local rc=$?
 trap - EXIT
 if [ "$committed" != yes ]; then
  if [ "$installed" = yes ]; then rm -rf "$target"; fi
  if [ "$moved" = yes ] && [ -d "$previous" ]; then mv "$previous" "$target"; fi
  if [ -d "$transaction" ]; then restore_preferences "$transaction" no || true; fi
 fi
 rm -rf "$stage" "$transaction"
 if [ "$committed" = yes ]; then rm -rf "$previous"; fi
 exit "$rc"
}
trap cleanup EXIT
mkdir -p "$extensions" "$state_root"
save_preferences "$transaction"
cp -R "$source_dir" "$stage"
if [ -d "$target" ]; then mv "$target" "$previous"; moved=yes; fi
mv "$stage" "$target"
installed=yes
if [ ! -d "$state_root/original-preferences" ]; then cp -R "$transaction" "$state_root/original-preferences"; fi
for version in 11 12; do defaults write "com.adobe.CSXS.$version" PlayerDebugMode -string 1; done
committed=yes
printf '%s\n' 'ThreadMatch instalado para tu usuario.' 'Abre Illustrator > Ventana > Extensiones > ThreadMatch.' 'Se habilitaron extensiones CEP locales sin firma (CEP 11 y 12).'
