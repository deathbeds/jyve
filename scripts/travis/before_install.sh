#!/usr/bin/env bash
set -ex
mkdir -p ${HOME}/.cache/stuff

cd ${HOME}/.cache/stuff

wget --no-verbose --continue ${MINICONDA_SOURCE}/${MINICONDA_DIST}

wget --no-verbose --continue \
  ${GECKODRIVER_SOURCE}/v${GECKODRIVER_VERSION}/${GECKODRIVER_DIST}

bash ${HOME}/.cache/stuff/${MINICONDA_DIST} -b -p ${CONDA_DIR}
mkdir -p ${HOME}/.cache/conda
rsync -av ${HOME}/.cache/conda/*.tar.bz2 $CONDA_DIR/pkgs/
