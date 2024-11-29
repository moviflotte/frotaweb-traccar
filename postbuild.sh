#!/bin/bash
echo "/*$npm_package_version*/" >> traccar-web/build/sw.js
echo "tail traccar-web/build/sw.js:"
tail traccar-web/build/sw.js
mv -v traccar-web/build deploy

perl -pi -e 's|<BrowserRouter>|<BrowserRouter basename="/traccar">|g' traccar-web/src/index.jsx
grep "BrowserRouter" traccar-web/src/index.jsx
cp -v vite.config.js traccar-web
cd traccar-web || exit
export VITE_APP_VERSION=$npm_package_version
npx vite build
mv -v build ../deploy/traccar
cp -v ../deploy/traccar/index.html ../deploy/traccar/404.html



