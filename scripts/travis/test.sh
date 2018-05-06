#!/usr/bin/env bash
set -ex

source activate jyve-dev

jlpm test
