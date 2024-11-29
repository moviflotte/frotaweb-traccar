#!/bin/bash
GIT_TRACE=1 git clone --depth 1 https://github.com/traccar/traccar-web || true
curl https://raw.githubusercontent.com/entrack-plataforma/frotaweb/refs/heads/main/src/theme/palette.js > traccar-web/src/common/theme/palette.js

{
  echo "import './sentry.js';"
  cat traccar-web/src/index.jsx
} > temp && mv temp traccar-web/src/index.jsx

node prebuild.js

cp -vr src/* traccar-web/src

if [ -n "${LOGO_URL}" ]; then
  curl "${LOGO_URL}" > traccar-web/public/logo.svg
fi
if [ -n "${LOGO_LARGE_URL}" ]; then
  curl "${LOGO_LARGE_URL}" > traccar-web/src/resources/images/logo.svg
fi

FILES=("vite.config.js traccar-web/vite.config.js" "traccar-web/index.html")
for FILE in "${FILES[@]}"; do
    sed -i "s|\${title}|$TITLE|g" "$FILE" || true
    sed -i "s|\${description}|$DESCRIPTION|g" "$FILE" || true
    sed -i "s|\${colorPrimary}|$COLOR_PRIMARY|g" "$FILE" || true
done
