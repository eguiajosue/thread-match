#!/bin/bash
# Shared helpers. Values are data files, never sourced as shell code.
save_preferences() {
 local out="$1" version domain value kind
 mkdir -p "$out"
 for version in 11 12; do
  domain="com.adobe.CSXS.$version"
  if value=$(defaults read "$domain" PlayerDebugMode 2>/dev/null); then
   printf '%s' "$value" > "$out/$version.value"
   kind=$(defaults read-type "$domain" PlayerDebugMode 2>/dev/null || true)
   printf '%s' "$kind" > "$out/$version.type"
  else
   printf 'absent' > "$out/$version.type"
  fi
 done
}
restore_preferences() {
 local from="$1" guard="$2" version domain kind value current
 for version in 11 12; do
  domain="com.adobe.CSXS.$version"
  [ -f "$from/$version.type" ] || continue
  if [ "$guard" = yes ]; then
   current=$(defaults read "$domain" PlayerDebugMode 2>/dev/null || true)
   [ "$current" = 1 ] || continue
  fi
  kind=$(cat "$from/$version.type")
  if [ "$kind" = absent ]; then
   defaults delete "$domain" PlayerDebugMode 2>/dev/null || true
  else
   value=$(cat "$from/$version.value")
   case "$kind" in
    *integer*) defaults write "$domain" PlayerDebugMode -int "$value" ;;
    *boolean*) defaults write "$domain" PlayerDebugMode -bool "$value" ;;
    *) defaults write "$domain" PlayerDebugMode -string "$value" ;;
   esac
  fi
 done
}
