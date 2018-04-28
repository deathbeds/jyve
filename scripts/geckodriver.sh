#!/usr/bin/env bash
wget --continue https://github.com/mozilla/geckodriver/releases/download/v0.20.0/geckodriver-v0.20.0-linux64.tar.gz
tar -xaf geckodriver-v0.20.0-linux64.tar.gz -C $CONDA_PREFIX/bin
