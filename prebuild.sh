#!/bin/bash
git clone --depth 1 https://github.com/jcardus/traccar-web || true
find traccar-web/src -type f -name "*.js" -exec sed -i ".bak" "s/'text-size': 12,/'text-size': 14,/g" {} +

# Run each sed command and then display the difference with the backup
sed -i ".bak" "s/Noto Sans Regular/Noto Sans Bold/g" traccar-web/src/map/core/mapUtil.js
echo "Diff for mapUtil.js:"
diff traccar-web/src/map/core/mapUtil.js.bak traccar-web/src/map/core/mapUtil.js

sed -i ".bak" "s|{window.location.origin}|{window.location.origin}/traccar|" traccar-web/src/settings/SharePage.jsx
echo "Diff for SharePage.jsx:"
diff traccar-web/src/settings/SharePage.jsx.bak traccar-web/src/settings/SharePage.jsx

sed -i ".bak" "s|<BrowserRouter>|<BrowserRouter basename=\"/traccar\">|" traccar-web/src/index.jsx
echo "Diff for index.jsx:"
diff traccar-web/src/index.jsx.bak traccar-web/src/index.jsx


cp -vr src/* traccar-web/src
cp -v vite.config.js traccar-web

if [ -n "${LOGO_URL}" ]; then
  curl "${LOGO_URL}" > traccar-web/public/logo.svg
fi
if [ -n "${LOGO_LARGE_URL}" ]; then
  curl "${LOGO_LARGE_URL}" > traccar-web/src/resources/images/logo.svg
fi
