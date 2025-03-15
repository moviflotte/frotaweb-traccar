#!/bin/bash
GIT_TRACE=1 git clone --depth 1 https://github.com/jcardus/traccar-web || true
curl https://raw.githubusercontent.com/entrack-plataforma/frotaweb/refs/heads/main/src/theme/palette.js > traccar-web/src/common/theme/palette.js

perl -pi -e "s|'text-field': '▲',|'text-field': '▲','text-size': 20,|g" traccar-web/src/map/MapRoutePoints.js
#perl -pi -e "s|'text-color':\s*\[\s*'get'\s*,\s*'color'\s*\],| 'text-color': 'white', 'text-opacity': 0.9, 'text-halo-width': 1,'text-halo-color': 'black',|" traccar-web/src/map/MapRoutePoints.js
#perl -pi -e "s|'text-allow-overlap': true|'text-allow-overlap': false|" traccar-web/src/map/MapRoutePoints.js
perl -pi -e "s|'line-width': 2,|'line-width': 3,|g" traccar-web/src/map/MapRoutePath.js
perl -pi -e "s|<ArrowBackIcon />||g" traccar-web/src/common/components/PageLayout.jsx
perl -pi -e 's|"start": "vite"|"start": "vite --host"|g' traccar-web/package.json
perl -pi -e 's|itemSize={72|itemSize={60|' traccar-web/src/main/DeviceList.jsx

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
    # shellcheck disable=SC2154
    echo "changing title to $TITLE $npm_package_version in $FILE"
    echo "changing description to $DESCRIPTION in $FILE"
    sed -i "s|\${title}|$TITLE $npm_package_version|g" "$FILE" || true
    sed -i "s|\${name}|$NAME|g" "$FILE" || true
    sed -i "s|\${description}|$DESCRIPTION|g" "$FILE" || true
done

{
    echo "import './instrument.js';"
    cat traccar-web/src/index.jsx
} > temp && mv temp traccar-web/src/index.jsx
