#!/bin/bash
git pull
npm start
while [ $? -eq 0 ]; do
    git pull
    npm start
done