const fs = require('fs');
const path = require('path');

// JSON files to update
const files = [
    path.join(__dirname, 'traccar-web/src/resources/l10n/pt.json'),
    path.join(__dirname, 'traccar-web/src/resources/l10n/pt_BR.json'),
];

// Function to update JSON files
files.forEach((file) => {
    if (fs.existsSync(file)) {
        const data = JSON.parse(fs.readFileSync(file, 'utf8'));
        data.mapOpenFreeMap = 'OpenFreeMap'; // Add new key-value pair
        fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf8');
        console.log(`Updated ${file}`);
    } else {
        console.error(`File not found: ${file}`);
    }
});
