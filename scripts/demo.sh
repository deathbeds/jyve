#!/bin/bash
set -ex
rm -rf demo index_files
jupyter nbconvert --to jyve --JyveExporter.extra_contents="['notebooks/*.ipynb']" index.ipynb
rm index.html
mv index_files demo
pushd demo
du -ch --exclude=.git .
