#!/bin/sh
if [ -z "$husky_skip_init" ]; then
  debug() {
    [ "$HUSKY_DEBUG" = "1" ] && echo "husky (debug) -" "$@"
  }
  readonly hook_name="$(basename "$0")"
  debug "starting $hook_name..."
  if [ "$HUSKY" = "0" ]; then
    debug "HUSKY env variable is set to 0, skipping hook" >&2
    exit 0
  fi
  if [ -f ~/.huskyrc ]; then
    debug "~/.huskyrc found, sourcing..."
    . ~/.huskyrc
  fi
  export readonly husky_skip_init=1
  sh -e "$0" "$@"
  exitCode="$?"
  if [ $exitCode != 0 ]; then
    exit $exitCode
  fi
fi
