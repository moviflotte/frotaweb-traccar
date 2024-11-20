#!/bin/bash
echo "//force deploy" >> traccar-web/build/sw.js
mkdir -p deploy
mv -v traccar-web/build deploy
mv -v deploy/build deploy/traccar
cp -v deploy/traccar/index.html deploy/traccar/404.html
