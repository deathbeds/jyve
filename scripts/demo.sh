#!/bin/bash
set -ex
jupyter nbconvert --to jyve index.ipynb
rm -rf demo/*
rm index.html
mv index_files/* demo/
rm -rf index_files
pushd demo
du -ch --exclude=.git .
