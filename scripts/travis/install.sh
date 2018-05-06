#!/usr/bin/env bash
set -ex

conda env update -n jyve-dev --file ${TRAVIS_BUILD_DIR}/environment.yml

# TODO: get geckodriver from conda-forge
tar -xaf ${HOME}/.cache/stuff/${GECKODRIVER_DIST} \
  -C ${CONDA_DIR}/envs/jyve-dev/bin

source activate jyve-dev
geckodriver --version

cd ${TRAVIS_BUILD_DIR}

bash postBuild
