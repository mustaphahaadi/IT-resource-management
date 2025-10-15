#!/bin/bash
pip install -r backend/requirements.txt
python backend/manage.py collectstatic --noinput
