const fs = require('fs');

// Simple 1x1 transparent PNG base64
const pngBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAC0lEQVQIHWNgAAIAAAUAAY27m/MAAAAASUVORK5CYII=';

// Create basic PNG files (they will be replaced by proper icons later)
const png192 = Buffer.from(pngBase64, 'base64');
const png512 = Buffer.from(pngBase64, 'base64');

fs.writeFileSync('pwa-192x192.png', png192);
fs.writeFileSync('pwa-512x512.png', png512);
fs.writeFileSync('apple-touch-icon.png', png192);

console.log('Basic PNG icons created');
