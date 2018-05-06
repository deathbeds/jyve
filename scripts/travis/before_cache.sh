#!/usr/bin/env bash
set -ex

rsync -av ${CONDA_DIR}/pkgs/*.tar.bz2 ${HOME}/.cache/conda/
