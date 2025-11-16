const fs = require('fs-extra');
const glob = require('glob');
const { minify } = require('html-minifier');
const JavaScriptObfuscator = require('javascript-obfuscator');

const srcDir = './src';
const distDir = './dist';

async function build() {
  await fs.emptyDir(distDir); // dist 폴더 초기화

  // 1️ HTML 파일 압축 + CSS/JS 내장 압축
  const htmlFiles = glob.sync(`${srcDir}/**/*.html`);
  for (const file of htmlFiles) {
    const content = await fs.readFile(file, 'utf-8');
    const minified = minify(content, {
      collapseWhitespace: true,
      removeComments: true,
      minifyCSS: true,
      minifyJS: true
    });
    const outPath = file.replace(srcDir, distDir);
    await fs.ensureDir(fs.dirname(outPath));
    await fs.writeFile(outPath, minified);
  }

  // 2️ JS 파일 난독화
  const jsFiles = glob.sync(`${srcDir}/**/*.js`);
  for (const file of jsFiles) {
    const content = await fs.readFile(file, 'utf-8');
    const obfuscated = JavaScriptObfuscator.obfuscate(content, {
      compact: true,
      controlFlowFlattening: true
    }).getObfuscatedCode();
    const outPath = file.replace(srcDir, distDir);
    await fs.ensureDir(fs.dirname(outPath));
    await fs.writeFile(outPath, obfuscated);
  }

  // 3️ CSS 파일도 dist로 복사 (필요하면 minify 가능)
  const cssFiles = glob.sync(`${srcDir}/**/*.css`);
  for (const file of cssFiles) {
    const content = await fs.readFile(file, 'utf-8');
    const outPath = file.replace(srcDir, distDir);
    await fs.ensureDir(fs.dirname(outPath));
    await fs.writeFile(outPath, content);
  }

  console.log(' 빌드 완료: dist/ 폴더에 압축+난독화 파일 생성');
}

build();
