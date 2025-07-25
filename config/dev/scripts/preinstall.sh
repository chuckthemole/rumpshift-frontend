#!/bin/bash

# I shouldn't have to do this anymore since we are publishing to npm - chuck 2025/5/16
# rm -f ./src/main/js/common/*

# make venv, activate, and install requirements
# TODO: look again at these commands and leave comments on each. Also, this is being executed during the build. Let's comment on this, giving good reasons why we're doing this. Same with postinstall.sh
# mkdir -p ./../rumpusenv
# python3 -m venv ./../rumpusenv
# source ./../rumpusenv/bin/activate
# pip install -r ./config/dev/requirements.txt