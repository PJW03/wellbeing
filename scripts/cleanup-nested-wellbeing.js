const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const nestedDir = path.join(rootDir, 'wellbeing');

function removeDirSafe(target) {
  fs.rmSync(target, { recursive: true, force: true });
}

function main() {
  if (!fs.existsSync(nestedDir)) {
    return;
  }

  const entries = fs.readdirSync(nestedDir, { withFileTypes: true });
  const names = entries.map((e) => e.name);

  // Only auto-remove clearly unintended folders: empty or containing only node_modules.
  const canRemove =
    entries.length === 0 ||
    (entries.length === 1 && entries[0].isDirectory() && entries[0].name === 'node_modules');

  if (canRemove) {
    removeDirSafe(nestedDir);
    console.log('[cleanup] Removed unintended nested folder: wellbeing');
    return;
  }

  console.warn(
    '[cleanup] Skipped removing nested "wellbeing" folder because it contains extra files:',
    names.join(', '),
  );
}

main();
