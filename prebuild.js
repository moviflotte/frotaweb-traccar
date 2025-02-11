const fs = require('fs');
const path = require('path');

const files = [
    path.join(__dirname, 'traccar-web/src/resources/l10n/pt.json'),
    path.join(__dirname, 'traccar-web/src/resources/l10n/pt_BR.json'),
    path.join(__dirname, 'traccar-web/src/resources/l10n/es.json'),
];

files.forEach((file) => {
    if (fs.existsSync(file)) {
        const data = JSON.parse(fs.readFileSync(file, 'utf8'));
        data.mapOpenFreeMap = 'OpenFreeMap'; // Add new key-value pair
        data.categoryShoppingbag = 'Mala'
        data.categoryTrailer = file.endsWith('es.json') ? 'Rampa Temperatura' : 'Trailer'
        data.categoryTrailer2 = file.endsWith('es.json') ? 'Rampa' : 'Caçamba'
        data.attributeForwardUrl = 'Forward URL'
        data.positionFixTime = 'Hora GPS'
        data.confirmBlockCommand = file.endsWith('es.json') ? 'Está seguro de enviar el comando de bloqueo?' : 'Tem a certeza que pretende bloquear o veículo?'
        data.confirmUnblockCommand = file.endsWith('es.json') ? 'Está seguro de enviar el comando de desbloqueo?' : 'Tem a certeza que pretende desbloquear o veículo?'
        data.mapMapboxStreetsLight = 'Mapbox Streets Light'
        data.mapGoogleTraffic = 'Google Trânsito'
        data.reportStartEngineHours = file.endsWith('es.json') ? 'Horas del motor al inicio' : 'Horas de motor no início'
        data.reportEndEngineHours = file.endsWith('es.json') ? 'Horas del motor al final' : 'Horas de motor no final'
        fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf8');
        console.log(`Updated ${file}`);
    } else {
        console.error(`File not found: ${file}`);
    }
});

const packageJsonPath = './package.json';
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
const versionParts = packageJson.version.split('.');
versionParts[1] = parseInt(versionParts[1], 10) + 1; // Increment the patch version
packageJson.version = versionParts.join('.');
fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n', 'utf8');
