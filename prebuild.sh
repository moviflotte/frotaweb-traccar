#!/bin/bash
GIT_TRACE=1 git clone --depth 1 https://github.com/traccar/traccar-web || true
curl https://raw.githubusercontent.com/entrack-plataforma/frotaweb/refs/heads/main/src/theme/palette.js > traccar-web/src/common/theme/palette.js

perl -pi -e "s|'text-field': '▲',|'text-field': '▲','text-size': 15,|g" traccar-web/src/map/MapRoutePoints.js
perl -pi -e "s|'text-color':\s*\[\s*'get'\s*,\s*'color'\s*\],| 'text-color': ['get', 'color'],'text-halo-width': 1,'text-halo-color': '#2d5f99',|" traccar-web/src/map/MapRoutePoints.js
perl -pi -e "s|'line-width': 2,|'line-width': 6,|g" traccar-web/src/map/MapRoutePath.js

node prebuild.js

cp -vr src/* traccar-web/src

if [ -n "${LOGO_URL}" ]; then
  curl "${LOGO_URL}" > traccar-web/public/logo.svg
fi
if [ -n "${LOGO_LARGE_URL}" ]; then
  curl "${LOGO_LARGE_URL}" > traccar-web/src/resources/images/logo.svg
fi

FILES=("vite.config.js" "traccar-web/vite.config.js" "traccar-web/index.html")
for FILE in "${FILES[@]}"; do
    echo "changing title to $TITLE in $FILE"
    sed -i "s|\${title}|$TITLE|g" "$FILE" || true
    sed -i "s|\${name}|$NAME|g" "$FILE" || true
    sed -i "s|\${description}|$DESCRIPTION|g" "$FILE" || true
done
