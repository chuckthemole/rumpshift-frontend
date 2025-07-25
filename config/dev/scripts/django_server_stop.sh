#! /bin/bash

cd ../pycommon
lsof -t -i tcp:8000 | xargs kill -9
fuser -k 8000/tcp
kill $(sudo lsof -t -i:8000)
echo 1