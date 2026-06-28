#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const PKG_ROOT = path.resolve(__dirname, '..');
const TEMPLATE_DIR = path.join(PKG_ROOT, 'template');
const INTEGRATIONS_DIR = path.join(PKG_ROOT, 'integrations');
const SUPPORTED_AIS = ['claude'];

function log(msg) { process.stdout.write(msg + '\n'); }
function fail(msg) { process.stderr.write('✖ ' + msg + '\n'); process.exit(1); }

function printHelp() {
  log(`MiniSpec — a lightweight specification standard for AI-assisted development.

Usage:
  npx minispec init [dir] [options]

Options:
  --here            Initialize in the current directory.
  --ai <name>       Target AI tool integration (default: claude). One of: ${SUPPORTED_AIS.join(', ')}.
  -h, --help        Show this help.

Examples:
  npx minispec init --here
  npx minispec init my-project --ai claude
`);
}

function parseArgs(argv) {
  const opts = { here: false, ai: 'claude', dir: null };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--here') opts.here = true;
    else if (a === '--ai') opts.ai = argv[++i];
    else if (a === '-h' || a === '--help') opts.help = true;
    else if (!a.startsWith('-')) opts.dir = a;
    else fail(`Unknown option: ${a}`);
  }
  return opts;
}

function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, entry.name);
    const d = path.join(dest, entry.name);
    if (entry.isDirectory()) copyDir(s, d);
    else fs.copyFileSync(s, d);
  }
}

function installContextPointer(target, ai) {
  const snippetPath = path.join(INTEGRATIONS_DIR, ai, 'context-pointer.md');
  if (!fs.existsSync(snippetPath)) return;
  const snippet = fs.readFileSync(snippetPath, 'utf8').trim();
  const marker = '## MiniSpec (read first)';
  // Claude reads CLAUDE.md; other tools may differ, but v1 targets claude.
  const contextFile = path.join(target, 'CLAUDE.md');
  let content = '';
  if (fs.existsSync(contextFile)) content = fs.readFileSync(contextFile, 'utf8');
  if (content.includes(marker)) {
    log('• Context pointer already present in CLAUDE.md — skipped.');
    return;
  }
  const next = content
    ? content.replace(/\n*$/, '\n\n') + snippet + '\n'
    : `# CLAUDE.md\n\n${snippet}\n`;
  fs.writeFileSync(contextFile, next);
  log('• Added MiniSpec pointer to CLAUDE.md');
}

function init(opts) {
  if (!SUPPORTED_AIS.includes(opts.ai)) {
    fail(`Unsupported --ai "${opts.ai}". Supported: ${SUPPORTED_AIS.join(', ')}.`);
  }
  const target = opts.here
    ? process.cwd()
    : path.resolve(process.cwd(), opts.dir || 'minispec-project');

  fs.mkdirSync(target, { recursive: true });

  // 1) Scaffold .minispec/
  const minispecDest = path.join(target, '.minispec');
  if (fs.existsSync(minispecDest)) {
    fail(`.minispec already exists in ${target}. Aborting to avoid overwriting.`);
  }
  copyDir(path.join(TEMPLATE_DIR, '.minispec'), minispecDest);
  log('• Created .minispec/');

  // 2) Install the AI integration (skills, rules, ...)
  const skillsSrc = path.join(INTEGRATIONS_DIR, opts.ai, 'skills');
  if (fs.existsSync(skillsSrc)) {
    copyDir(skillsSrc, path.join(target, '.claude', 'skills'));
    log(`• Installed ${opts.ai} skills into .claude/skills/`);
  }

  // 3) Add the "read first" pointer to the AI context file
  installContextPointer(target, opts.ai);

  log(`\n✓ MiniSpec initialized in ${target}`);
  log(`  Next: fill .minispec/core/ (start with project.md, conventions.md, principles.md).`);
}

function main() {
  const argv = process.argv.slice(2);
  const cmd = argv[0];
  if (!cmd || cmd === 'help' || cmd === '-h' || cmd === '--help') {
    printHelp();
    process.exit(cmd ? 0 : 1);
  }
  const opts = parseArgs(argv.slice(1));
  if (opts.help) { printHelp(); process.exit(0); }
  if (cmd === 'init') return init(opts);
  fail(`Unknown command: ${cmd}. Run "minispec --help".`);
}

main();
