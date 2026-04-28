const fs = require('fs');
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
if (!pkg.pnpm) pkg.pnpm = {};
if (!pkg.pnpm.overrides) pkg.pnpm.overrides = {};
pkg.pnpm.overrides['@scure/base'] = '^1.1.9';
pkg.pnpm.overrides['@scure/bip32'] = '^1.4.0';
pkg.pnpm.overrides['@scure/bip39'] = '^1.3.0';
pkg.pnpm.overrides['@noble/ciphers'] = '^0.5.3';
fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2));
