#!/usr/bin/env bash
set -ex

conda env update -n jyve-dev --file ${TRAVIS_BUILD_DIR}/environment.yml

source activate jyve-dev

cd ${TRAVIS_BUILD_DIR}

bash postBuild
