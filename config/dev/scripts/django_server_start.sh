#! /bin/bash

cd ../pycommon
python3 manage.py runserver localhost:8000 &> logs/run.log
echo 1