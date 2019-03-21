#!/bin/bash


rm -rf .serverless_plugins
mkdir -p .serverless_plugins/serverless-plugin-ignitor

cp ../index.js .serverless_plugins/serverless-plugin-ignitor/index.js
cp -r ../libs .serverless_plugins/serverless-plugin-ignitor/libs