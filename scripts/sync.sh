#!/usr/bin/env bash
. ./scripts/env.sh

rsync -aqz --del $PACKAGES/ $DEATHBEDS/

# yeah, and whatever
rm -rf $DEATHBEDS/*/node_modules/@deathbeds
