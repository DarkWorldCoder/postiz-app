const fs = require('fs');
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
pkg.dependencies['isomorphic-dompurify'] = '^2.15.0';
// Or we can add an override for these pesky node modules
if (!pkg.pnpm) pkg.pnpm = {};
if (!pkg.pnpm.overrides) pkg.pnpm.overrides = {};
pkg.pnpm.overrides['isomorphic-dompurify'] = '^2.15.0';
pkg.pnpm.overrides['@noble/curves'] = '^1.2.0';
pkg.pnpm.overrides['@noble/hashes'] = '^1.3.2';
fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2));
