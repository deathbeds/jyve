#!/usr/bin/env bash
set -ex
wget --no-verbose --continue ${MINICONDA_SOURCE}/${MINICONDA_DIST}
bash ${MINICONDA_DIST} -fbp ${CONDA_DIR}
