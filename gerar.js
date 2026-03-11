import fs from 'fs';
import path from 'path';

const outputFile = 'codigo_completo.txt';
const targetDir = './src';
const rootFile = './App.tsx';
const extensions = ['.ts', '.tsx', '.js', '.jsx'];
const ignoreDirs = ['node_modules', '.expo', '.git', 'assets'];

let output = '';

function readDir(dir) {
    if (!fs.existsSync(dir)) return;
    const files = fs.readdirSync(dir);

    files.forEach(file => {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            if (!ignoreDirs.includes(file)) {
                readDir(fullPath);
            }
        } else {
            if (extensions.includes(path.extname(fullPath))) {
                addFileToOutput(fullPath);
            }
        }
    });
}

function addFileToOutput(filePath) {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        output += `\n\n========================================\n`;
        output += `=== ARQUIVO: ${filePath} ===\n`;
        output += `========================================\n\n`;
        output += content;
        console.log(`Lido: ${filePath}`);
    } catch (e) {
        console.error(`Erro ao ler ${filePath}:`, e.message);
    }
}

console.log('Gerando arquivo da base refatorada...');
if (fs.existsSync(rootFile)) addFileToOutput(rootFile);
readDir(targetDir);
fs.writeFileSync(outputFile, output);
console.log(`\nSucesso! Arquivo criado: ${outputFile}`);
