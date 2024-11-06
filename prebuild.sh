#!/bin/bash
git clone --depth 1 https://github.com/jcardus/traccar-web || true
find traccar-web/src -type f -name "*.js" -exec sed -i "s/'text-size': 12,/'text-size': 14,/g" {} +
find traccar-web/src -type f -name "*.js" -exec sed -i "s/Noto Sans Regular/Noto Sans Bold/g" {} +
cp -vr src/* traccar-web/src
cp -v vite.config.js traccar-web

if [ -n "${LOGO_URL}" ]; then
  curl "${LOGO_URL}" > traccar-web/public/logo.svg
fi
if [ -n "${LOGO_LARGE_URL}" ]; then
  curl "${LOGO_LARGE_URL}" > traccar-web/src/resources/images/logo.svg
fi
