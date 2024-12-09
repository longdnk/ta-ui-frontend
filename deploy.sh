#!/bin/bash
rm -rf deploy/application/*
npm run build
cp -r build deploy/application/
cd deploy
docker compose up -d --build
docker ps -a