#!/usr/bin/env bash
set -ex

source activate jyve-dev

export PATH=$(chromedriver-path):${PATH}

jlpm test
