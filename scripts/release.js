#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = process.cwd();
const BUMP = process.argv[2];
const VALID_BUMPS = new Set(['patch', 'minor', 'major']);

if (!VALID_BUMPS.has(BUMP)) {
  console.error('Usage: node scripts/release.js <patch|minor|major>');
  process.exit(1);
}

const run = (command) => {
  return execSync(command, { cwd: ROOT, encoding: 'utf8' }).trim();
};

const semverRegex = /^(\d+)\.(\d+)\.(\d+)$/;

const bumpVersion = (version, bumpType) => {
  const match = version.match(semverRegex);
  if (!match) {
    throw new Error(`Invalid semver version: ${version}`);
  }

  let major = Number(match[1]);
  let minor = Number(match[2]);
  let patch = Number(match[3]);

  if (bumpType === 'major') {
    major += 1;
    minor = 0;
    patch = 0;
  } else if (bumpType === 'minor') {
    minor += 1;
    patch = 0;
  } else {
    patch += 1;
  }

  return `${major}.${minor}.${patch}`;
};

const parseConventionalCommit = (subject) => {
  const match = subject.match(/^([a-z]+)(\(.+\))?(!)?:\s(.+)$/i);
  if (!match) {
    return { type: 'other', description: subject };
  }

  return {
    type: match[1].toLowerCase(),
    description: match[4],
  };
};

const buildChangelogSection = (newVersion, commits) => {
  const today = new Date().toISOString().slice(0, 10);
  const buckets = {
    Features: [],
    Fixes: [],
    Refactors: [],
    Docs: [],
    Tests: [],
    Maintenance: [],
    Other: [],
  };

  for (const commit of commits) {
    const parsed = parseConventionalCommit(commit.subject);
    const entry = `- ${parsed.description} (${commit.hash})`;
    if (parsed.type === 'feat') buckets.Features.push(entry);
    else if (parsed.type === 'fix') buckets.Fixes.push(entry);
    else if (parsed.type === 'refactor') buckets.Refactors.push(entry);
    else if (parsed.type === 'docs') buckets.Docs.push(entry);
    else if (parsed.type === 'test') buckets.Tests.push(entry);
    else if (['chore', 'build', 'ci', 'style', 'perf'].includes(parsed.type)) buckets.Maintenance.push(entry);
    else buckets.Other.push(entry);
  }

  const lines = [`## v${newVersion} - ${today}`, ''];
  const orderedSections = ['Features', 'Fixes', 'Refactors', 'Docs', 'Tests', 'Maintenance', 'Other'];

  let hasAny = false;
  for (const sectionName of orderedSections) {
    const sectionItems = buckets[sectionName];
    if (sectionItems.length === 0) continue;
    hasAny = true;
    lines.push(`### ${sectionName}`);
    lines.push(...sectionItems);
    lines.push('');
  }

  if (!hasAny) {
    lines.push('### Maintenance');
    lines.push('- Release metadata update');
    lines.push('');
  }

  return lines.join('\n');
};

const updateJsonFile = (filePath, mutator) => {
  const absolute = path.join(ROOT, filePath);
  const json = JSON.parse(fs.readFileSync(absolute, 'utf8'));
  mutator(json);
  fs.writeFileSync(absolute, `${JSON.stringify(json, null, 2)}\n`, 'utf8');
};

try {
  const status = run('git status --porcelain');
  if (status) {
    console.error('Working tree is not clean. Commit or stash changes before running release script.');
    process.exit(1);
  }

  const packageJsonPath = path.join(ROOT, 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  const currentVersion = packageJson.version;
  const newVersion = bumpVersion(currentVersion, BUMP);

  const tagsOutput = run('git tag --list "v*" --sort=-v:refname');
  const lastTag = tagsOutput
    .split(/\r?\n/)
    .map((tag) => tag.trim())
    .find((tag) => /^v\d+\.\d+\.\d+$/.test(tag));

  const range = lastTag ? `${lastTag}..HEAD` : 'HEAD';
  const logOutput = run(`git log ${range} --pretty=format:%h%x09%s`);
  const commits = logOutput
    ? logOutput.split(/\r?\n/).map((line) => {
        const [hash, subject] = line.split('\t');
        return { hash, subject };
      })
    : [];

  const changelogPath = path.join(ROOT, 'CHANGELOG.md');
  const header = '# Changelog\n\nAll notable changes to this project will be documented in this file.\n\n';
  const currentChangelog = fs.existsSync(changelogPath) ? fs.readFileSync(changelogPath, 'utf8') : header;
  const normalizedChangelog = currentChangelog.startsWith('# Changelog') ? currentChangelog : `${header}${currentChangelog}`;
  const section = buildChangelogSection(newVersion, commits);
  const updatedChangelog = `${header}${section}\n${normalizedChangelog.replace(header, '')}`;
  fs.writeFileSync(changelogPath, updatedChangelog, 'utf8');

  updateJsonFile('package.json', (json) => {
    json.version = newVersion;
  });

  const packageLockPath = path.join(ROOT, 'package-lock.json');
  if (fs.existsSync(packageLockPath)) {
    updateJsonFile('package-lock.json', (json) => {
      json.version = newVersion;
      if (json.packages && json.packages['']) {
        json.packages[''].version = newVersion;
      }
    });
  }

  const appJsonPath = path.join(ROOT, 'app.json');
  if (fs.existsSync(appJsonPath)) {
    updateJsonFile('app.json', (json) => {
      if (json.expo && typeof json.expo === 'object') {
        json.expo.version = newVersion;
      }
    });
  }

  console.log(`Prepared release v${newVersion}`);
  if (lastTag) {
    console.log(`Based on commits since ${lastTag}`);
  } else {
    console.log('No previous semver tag found; changelog includes current history scope.');
  }

  console.log('\nNext steps:');
  console.log('1) git add CHANGELOG.md package.json package-lock.json app.json');
  console.log(`2) git commit -m "chore(release): v${newVersion}"`);
  console.log(`3) git tag v${newVersion}`);
  console.log('4) git push origin main --follow-tags');
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
}
