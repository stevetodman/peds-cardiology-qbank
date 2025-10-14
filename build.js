const fs = require('fs/promises');
const path = require('path');

function minifyJavaScript(source) {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/(^|[^:])\/\/.*$/gm, '$1')
    .replace(/\s+/g, ' ')
    .replace(/\s*([{};:,()=+\-*/<>])\s*/g, '$1')
    .trim();
}

function minifyCss(source) {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\s+/g, ' ')
    .replace(/\s*([{};:,>])\s*/g, '$1')
    .trim();
}

async function writeFile({ source, destination, transform }) {
  const inputPath = path.join(__dirname, source);
  const outputPath = path.join(__dirname, 'dist', destination);
  const raw = await fs.readFile(inputPath, 'utf8');
  const result = transform ? transform(raw) : raw;
  await fs.writeFile(outputPath, result, 'utf8');
}

async function runBuild() {
  const outDir = path.join(__dirname, 'dist');
  await fs.rm(outDir, { recursive: true, force: true });
  await fs.mkdir(outDir, { recursive: true });

  const tasks = [
    writeFile({ source: 'index.html', destination: 'index.html' }),
    writeFile({ source: 'styles.css', destination: 'styles.css', transform: minifyCss }),
    writeFile({ source: 'script.js', destination: 'script.js', transform: minifyJavaScript }),
  ];

  await Promise.all(tasks);
  console.log('Build completed successfully. Output available in dist/.');
}

runBuild().catch((error) => {
  console.error('Build failed:', error);
  process.exit(1);
});
