const fs = require('fs');
const path = require('path');

// Configuração
const outputFile = 'codigo_completo.txt';
const targetDir = './src';
const rootFile = './App.tsx';
const extensions = ['.ts', '.tsx'];

let output = '';

// 1. Função para ler arquivos recursivamente
function readDir(dir) {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            readDir(fullPath); // Recursão
        } else {
            if (extensions.includes(path.extname(fullPath))) {
                addFileToOutput(fullPath);
            }
        }
    });
}

// 2. Adiciona conteúdo ao output
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

// Execução
console.log('Gerando arquivo...');

// Lê App.tsx
if (fs.existsSync(rootFile)) addFileToOutput(rootFile);

// Lê pasta src
if (fs.existsSync(targetDir)) readDir(targetDir);

// Salva
fs.writeFileSync(outputFile, output);
console.log(`\nSucesso! Arquivo criado: ${outputFile}`);