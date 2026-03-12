#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const MIN_NODE_MAJOR = 22;
const isWindows = process.platform === 'win32';

const checks = [];

const addCheck = (status, label, details, hint = '') => {
  checks.push({ status, label, details, hint });
};

const firstExistingPath = (candidates) => {
  for (const candidate of candidates) {
    if (candidate && fs.existsSync(candidate)) {
      return candidate;
    }
  }

  return null;
};

const nodeMajor = Number(process.versions.node.split('.')[0]);
if (nodeMajor >= MIN_NODE_MAJOR) {
  addCheck('ok', 'Node.js', `v${process.versions.node}`);
} else {
  addCheck(
    'fail',
    'Node.js',
    `v${process.versions.node}`,
    'Use Node 22+ para manter `npm run test` e `npm run verify` funcionando.',
  );
}

if (fs.existsSync(path.join(ROOT, 'node_modules'))) {
  addCheck('ok', 'Dependencias', '`node_modules` presente');
} else {
  addCheck('fail', 'Dependencias', '`node_modules` ausente', 'Execute `npm install`.');
}

if (fs.existsSync(path.join(ROOT, 'android'))) {
  addCheck('ok', 'Projeto Android', 'pasta `android/` encontrada');
} else {
  addCheck('warn', 'Projeto Android', 'pasta `android/` nao encontrada');
}

const gradleWrapper = path.join(ROOT, 'android', isWindows ? 'gradlew.bat' : 'gradlew');
if (fs.existsSync(gradleWrapper)) {
  addCheck('ok', 'Gradle wrapper', path.relative(ROOT, gradleWrapper));
} else {
  addCheck('warn', 'Gradle wrapper', 'wrapper local nao encontrado');
}

const envAndroidSdk = process.env.ANDROID_HOME || process.env.ANDROID_SDK_ROOT;
const defaultAndroidSdk = process.env.LOCALAPPDATA
  ? path.join(process.env.LOCALAPPDATA, 'Android', 'Sdk')
  : null;
const androidSdk = firstExistingPath([envAndroidSdk, defaultAndroidSdk]);
if (androidSdk) {
  addCheck('ok', 'Android SDK', androidSdk);
} else {
  addCheck(
    'warn',
    'Android SDK',
    'SDK nao localizado por variavel de ambiente nem no caminho padrao',
    'Defina `ANDROID_HOME` ou `ANDROID_SDK_ROOT`.',
  );
}

const adbBinary = firstExistingPath([
  process.env.ADB_PATH,
  androidSdk ? path.join(androidSdk, 'platform-tools', isWindows ? 'adb.exe' : 'adb') : null,
]);
if (adbBinary) {
  addCheck('ok', 'ADB', adbBinary);
} else {
  addCheck('warn', 'ADB', 'adb nao localizado', 'Instale `platform-tools` ou exponha `ADB_PATH`.');
}

const javaBinary = firstExistingPath([
  process.env.JAVA_HOME
    ? path.join(process.env.JAVA_HOME, 'bin', isWindows ? 'java.exe' : 'java')
    : null,
  isWindows ? 'C:/Program Files/Android/Android Studio/jbr/bin/java.exe' : null,
]);
if (javaBinary) {
  addCheck('ok', 'Java', javaBinary);
} else {
  addCheck(
    'warn',
    'Java',
    'java nao localizado',
    'Configure `JAVA_HOME` ou use o JBR do Android Studio.',
  );
}

const expoCli = firstExistingPath([
  path.join(ROOT, 'node_modules', 'expo', 'bin', 'cli'),
  path.join(ROOT, 'node_modules', 'expo', 'bin', 'cli.js'),
]);
if (expoCli) {
  addCheck('ok', 'Expo CLI', path.relative(ROOT, expoCli));
} else {
  addCheck('warn', 'Expo CLI', 'CLI local do Expo nao encontrada');
}

console.log('Hidrate-se doctor');
console.log('');

for (const check of checks) {
  const prefix = check.status === 'ok' ? '[ok]' : check.status === 'warn' ? '[warn]' : '[fail]';
  console.log(`${prefix} ${check.label}: ${check.details}`);
  if (check.hint) {
    console.log(`       ${check.hint}`);
  }
}

console.log('');
console.log('Fluxos recomendados:');
console.log('- Primeiro build Android ou mudanca nativa: npm run android:run');
console.log('- Desenvolvimento diario no Android: npm run dev:android');
console.log('- Metro com cache limpo: npm run dev:clear');
console.log('- Testes unitarios: npm run test');
console.log('- Verificacao completa: npm run verify');

const hasFailure = checks.some((check) => check.status === 'fail');
process.exit(hasFailure ? 1 : 0);
