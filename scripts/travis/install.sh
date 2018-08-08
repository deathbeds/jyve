#!/usr/bin/env bash
set -e

conda env update -n jyve-dev --file ${TRAVIS_BUILD_DIR}/environment.yml

source activate jyve-dev

cd ${TRAVIS_BUILD_DIR}

set -x
bash postBuild
