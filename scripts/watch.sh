#!/usr/bin/env bash
. ./scripts/env.sh
echo "Performing initial sync..."
. ./scripts/sync.sh
echo "Watching jyve files..."
while inotifywait -q -r -e modify,create,delete $PACKAGES/*/{lib,style}; do
  . ./scripts/sync.sh
done
