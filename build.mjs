import { mkdir, copyFile, cp } from 'node:fs/promises';
await mkdir('dist', { recursive: true });
for (const file of ['index.html', 'styles.css', 'app.js', 'theme.js', 'music.js', 'favicon.svg']) await copyFile(file, `dist/${file}`);
await cp('assets', 'dist/assets', { recursive: true });
console.log('Wedding invitation built successfully → dist/');
