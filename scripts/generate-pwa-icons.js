import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// SVG básico para o ícone
const iconSVG = `
<svg width="512" height="512" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" fill="#2563eb"/>
  <text x="50%" y="50%" font-size="256" fill="white" text-anchor="middle" dominant-baseline="central" font-family="Arial, sans-serif" font-weight="bold">M</text>
</svg>
`;

const publicDir = path.join(__dirname, '../public');

// Criar arquivo SVG temporário
fs.writeFileSync(path.join(publicDir, 'icon.svg'), iconSVG.trim());

console.log('✅ Ícone SVG criado!');
console.log('📝 Para produção, use ferramentas como:');
console.log('   - https://realfavicongenerator.net/');
console.log('   - https://www.pwabuilder.com/imageGenerator');
console.log('');
console.log('📋 Gere os seguintes tamanhos:');
console.log('   - icon-192.png (192x192)');
console.log('   - icon-512.png (512x512)');
