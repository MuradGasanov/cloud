#!/bin/bash
echo $0: Creating virtual environment
virtualenv --prompt="<cloud_env>" ../cloud_env

mkdir ../cloud_logs
mkdir ../cloud_pids
mkdir ../cloud_static/static
mkdir ../cloud_static/media

echo $0: Installing dependencies
source ../cloud_env/bin/activate
export PIP_REQUIRE_VIRTUALENV=true
../cloud_env/bin/pip install --requirement=./requirements.conf --log=../cloud_logs/build_pip_packages.log

echo $0: Making virtual environment relocatable
virtualenv --relocatable ../cloud_env

echo $0: Creating virtual environment finished.