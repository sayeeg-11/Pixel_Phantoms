const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Function to minify CSS files
function minifyCSS(inputPath, outputPath) {
  try {
    execSync(`cleancss -o "${outputPath}" "${inputPath}"`);
    console.log(`Minified CSS: ${inputPath} -> ${outputPath}`);
  } catch (error) {
    console.error(`Error minifying CSS ${inputPath}:`, error.message);
  }
}

// Function to minify JS files
function minifyJS(inputPath, outputPath) {
  try {
    execSync(`uglifyjs "${inputPath}" -o "${outputPath}"`);
    console.log(`Minified JS: ${inputPath} -> ${outputPath}`);
  } catch (error) {
    console.error(`Error minifying JS ${inputPath}:`, error.message);
  }
}

// Function to process all CSS files in css/ directory
function processCSSFiles() {
  const cssDir = path.join(__dirname, 'css');
  const files = fs.readdirSync(cssDir);

  files.forEach(file => {
    if (path.extname(file) === '.css') {
      const inputPath = path.join(cssDir, file);
      const outputPath = path.join(cssDir, file.replace('.css', '.min.css'));
      minifyCSS(inputPath, outputPath);
    }
  });
}

// Function to process all JS files in js/ directory
function processJSFiles() {
  const jsDir = path.join(__dirname, 'js');
  const files = fs.readdirSync(jsDir);

  files.forEach(file => {
    if (path.extname(file) === '.js') {
      const inputPath = path.join(jsDir, file);
      const outputPath = path.join(jsDir, file.replace('.js', '.min.js'));
      minifyJS(inputPath, outputPath);
    }
  });
}

// Main execution
console.log('Starting asset minification...');
processCSSFiles();
processJSFiles();
console.log('Asset minification completed!');
