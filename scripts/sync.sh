#!/bin/bash
. ./scripts/env.sh

# Really would be easier if the names were the same
rsync -aqz --del $API/_core/ $DEATHBEDS/jyve/
rsync -aqz --del $EXT/_core/ $DEATHBEDS/jyve-extension/

rsync -aqz --del $API/js/ $DEATHBEDS/jyve-js-unsafe/
rsync -aqz --del $EXT/js/ $DEATHBEDS/jyve-js-unsafe-extension/

rsync -aqz --del $API/coffee/ $DEATHBEDS/jyve-coffee-unsafe/
rsync -aqz --del $EXT/coffee/ $DEATHBEDS/jyve-coffee-unsafe-extension/

rsync -aqz --del $API/brython/ $DEATHBEDS/jyve-brython-unsafe/
rsync -aqz --del $EXT/brython/ $DEATHBEDS/jyve-brython-unsafe-extension/

rsync -aqz --del $API/typescript/ $DEATHBEDS/jyve-typescript-unsafe/
rsync -aqz --del $EXT/typescript/ $DEATHBEDS/jyve-typescript-unsafe-extension/

rsync -aqz --del $LYB/phosphor/ $DEATHBEDS/jyve-lyb-phosphor/
rsync -aqz --del $LYB/d3/ $DEATHBEDS/jyve-lyb-d3/

rm -rf $DEATHBEDS/*/node_modules/@deathbeds
