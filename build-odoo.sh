#!/bin/bash
rm -rf traccar-web
rm src/reports/RouteReportPage.jsx
./prebuild.sh

perl -pi -e 's|\{window.location.origin\}|\{window.location.origin}/fleet_traccar/static/traccar|g' traccar-web/src/settings/SharePage.jsx
perl -pi -e 's|<BrowserRouter>|<BrowserRouter basename="/fleet_traccar/static/traccar">|g' traccar-web/src/index.jsx

cp -vr odoo/* traccar-web

{
    echo "(() => {
            const originalFetch = window.fetch;
            window.fetch = async (input, init) => {
              if (typeof input === 'string' && input.startsWith('/')) {
                input = '/fleet_traccar' + input;
              }
              return originalFetch(input, init);
            };
          })();"
    cat traccar-web/src/index.jsx
} > temp && mv temp traccar-web/src/index.jsx

cd traccar-web || exit
echo "npm install @sentry/vite-plugin @sentry/react maplibregl-mapbox-request-transformer"
npm install @sentry/vite-plugin @sentry/react maplibregl-mapbox-request-transformer
echo "building with version $npm_package_version"
export VITE_APP_VERSION=$npm_package_version && npm run build
