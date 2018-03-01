#!/bin/bash
. ./scripts/env.sh

echo "Watching jyve files..."
while inotifywait -q -r -e modify,create,delete $PACKAGES/*/{lib,style}; do
  . ./scripts/sync.sh
done
