import { useEffect } from 'react';
import { map } from './core/MapView';
import { useTranslation } from '../common/components/LocalizationProvider';

class ExportControl {
  constructor(options) {
    this.options = options;
    this.t = options.t || ((key) => key);
  }

  onAdd(mapInstance) {
    this.map = mapInstance;
    this.container = document.createElement('div');
    this.container.className = 'maplibregl-ctrl maplibregl-ctrl-group';

    // Create print button
    const printButton = document.createElement('button');
    printButton.type = 'button';
    printButton.className = 'maplibregl-ctrl-icon';
    printButton.title = this.t('sharedPrint');
    printButton.style.cssText = `
      display: flex;
      align-items: center;
      justify-content: center;
    `;
    printButton.innerHTML = `
      <svg viewBox="0 0 24 24" width="20" height="20" style="display: block;">
        <path fill="currentColor" d="M18,3H6V7H18M19,12A1,1 0 0,1 18,11A1,1 0 0,1 19,10A1,1 0 0,1 20,11A1,1 0 0,1 19,12M16,19H8V14H16M19,8H5A3,3 0 0,0 2,11V17H6V21H18V17H22V11A3,3 0 0,0 19,8Z" />
      </svg>
    `;

    printButton.onclick = () => {
      this.printMap();
    };

    this.container.appendChild(printButton);

    return this.container;
  }

  onRemove() {
    this.container.parentNode.removeChild(this.container);
    this.map = undefined;
  }

  printMap() {
    // Wait for map to finish rendering
    this.map.once('idle', () => {
      const canvas = this.map.getCanvas();
      const dataUrl = canvas.toDataURL('image/png');

      // Get device and date info
      const { deviceName, from, to, positions } = this.options || {};
      const logoUrl = `https://docs.frotaweb.com/${window.location.hostname}/logo_large.svg`;

      // Get first and last position details
      const firstPosition = positions && positions.length > 0 ? positions[0] : null;
      const lastPosition = positions && positions.length > 0 ? positions[positions.length - 1] : null;

      const printWindow = window.open('', '_blank');
      printWindow.document.write(`
        <!DOCTYPE html>
        <html lang="en">
          <head>
            <title>Map Print</title>
            <style>
              body {
                margin: 0;
                padding: 20px;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              }
              .header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 20px;
                padding-bottom: 10px;
                border-bottom: 2px solid #ddd;
              }
              .logo {
                height: 60px;
              }
              .title {
                font-size: 24px;
                font-weight: bold;
                margin: 0;
              }
              .details {
                margin-top: 10px;
                margin-bottom: 20px;
                font-size: 14px;
                color: #555;
              }
              .details div {
                margin-bottom: 5px;
              }
              .details strong {
                color: #000;
              }
              .positions-section {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 20px;
                margin-bottom: 20px;
                font-size: 13px;
              }
              .position-box {
                border: 1px solid #ddd;
                border-radius: 4px;
                padding: 15px;
                background-color: #f9f9f9;
              }
              .position-box h3 {
                margin: 0 0 10px 0;
                font-size: 16px;
                color: #333;
                border-bottom: 1px solid #ddd;
                padding-bottom: 5px;
              }
              .position-box div {
                margin-bottom: 5px;
                color: #555;
              }
              .position-box strong {
                color: #000;
              }
              .map-image {
                max-width: 100%;
                height: auto;
                border: 1px solid #ddd;
              }
              @media print {
                body {
                  padding: 10px;
                }
                .map-image {
                  max-width: 100%;
                  page-break-inside: avoid;
                }
              }
            </style>
            <script>
              window.onload = function() {
                window.print();
                window.onafterprint = function() {
                  window.close();
                };
              };
            </script>
          </head>
          <body>
            <div class="header">
              <img src="${logoUrl}" alt="Company Logo" class="logo" />
              <h1 class="title">${this.t('reportReplay')}</h1>
            </div>
            ${deviceName || from || to ? `
            <div class="details">
              ${deviceName ? `<div><strong>${this.t('sharedDevice')}:</strong> ${deviceName}</div>` : ''}
              ${from ? `<div><strong>${this.t('reportFrom')}:</strong> ${new Date(from).toLocaleString()}</div>` : ''}
              ${to ? `<div><strong>${this.t('reportTo')}:</strong> ${new Date(to).toLocaleString()}</div>` : ''}
            </div>
            ` : ''}
            ${firstPosition && lastPosition ? `
            <div class="positions-section">
              <div class="position-box">
                <h3>${this.t('reportStartTime')}</h3>
                <div><strong>${this.t('positionFixTime')}:</strong> ${new Date(firstPosition.fixTime).toLocaleString()}</div>
                <div><strong>${this.t('positionSpeed')}:</strong> ${Math.round(firstPosition.speed * 1.852)} km/h</div>
                ${firstPosition.address ? `<div><strong>${this.t('positionAddress')}:</strong> ${firstPosition.address}</div>` : ''}
                <div><strong>${this.t('positionLatitude')}:</strong> ${firstPosition.latitude.toFixed(6)}</div>
                <div><strong>${this.t('positionLongitude')}:</strong> ${firstPosition.longitude.toFixed(6)}</div>
              </div>
              <div class="position-box">
                <h3>${this.t('reportEndTime')}</h3>
                <div><strong>${this.t('positionFixTime')}:</strong> ${new Date(lastPosition.fixTime).toLocaleString()}</div>
                <div><strong>${this.t('positionSpeed')}:</strong> ${Math.round(lastPosition.speed * 1.852)} km/h</div>
                ${lastPosition.address ? `<div><strong>${this.t('positionAddress')}:</strong> ${lastPosition.address}</div>` : ''}
                <div><strong>${this.t('positionLatitude')}:</strong> ${lastPosition.latitude.toFixed(6)}</div>
                <div><strong>${this.t('positionLongitude')}:</strong> ${lastPosition.longitude.toFixed(6)}</div>
              </div>
            </div>
            ` : ''}
            <img src="${dataUrl}" alt="Map" class="map-image" />
          </body>
        </html>
      `);
      printWindow.document.close();
    });
  }
}

const MapExport = ({ deviceName, from, to, positions }) => {
  const t = useTranslation();

  useEffect(() => {
    const control = new ExportControl({ deviceName, from, to, positions, t });
    map.addControl(control, 'top-right');
    return () => map.removeControl(control);
  }, [deviceName, from, to, positions, t]);

  return null;
};

export default MapExport;
