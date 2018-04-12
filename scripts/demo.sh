#!/bin/bash
set -ex
jupyter nbconvert --to jyve --JyveExporter.extra_contents="['notebooks/*.ipynb']" index.ipynb 
rm -rf demo/*
rm index.html
mv index_files/* demo/
rm -rf index_files
pushd demo
du -ch --exclude=.git .
