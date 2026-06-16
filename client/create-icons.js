const sharp = require('sharp');

const svgBuffer = Buffer.from(`
<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512">
  <rect width="512" height="512" rx="80" fill="#4f46e5"/>
  <path d="M256 120 C198 120 152 166 152 224 C152 282 256 392 256 392 C256 392 360 282 360 224 C360 166 314 120 256 120Z" fill="white"/>
  <circle cx="256" cy="220" r="52" fill="#4f46e5"/>
</svg>
`);

async function createIcons() {
  await sharp(svgBuffer).resize(512, 512).png().toFile('./public/icon-512.png');
  console.log('icon-512.png done!');
  await sharp(svgBuffer).resize(192, 192).png().toFile('./public/icon-192.png');
  console.log('icon-192.png done!');
  await sharp(svgBuffer).resize(180, 180).png().toFile('./public/apple-touch-icon.png');
  console.log('apple-touch-icon.png done!');
}

createIcons().catch(console.error);
