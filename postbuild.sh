#!/bin/bash
echo "/*$npm_package_version*/" >> traccar-web/build/sw.js
echo "tail traccar-web/build/sw.js:"
tail traccar-web/build/sw.js
mkdir -p deploy
mv -v traccar-web/build deploy
mv -v deploy/build deploy/traccar
cp -v deploy/traccar/index.html deploy/traccar/404.html
