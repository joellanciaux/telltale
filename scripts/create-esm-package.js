import { writeFile } from 'fs/promises';
import { join } from 'path';

const esmPackageJson = {
  "type": "module"
};

await writeFile(
  join('dist', 'esm', 'package.json'), 
  JSON.stringify(esmPackageJson, null, 2)
);

console.log('✅ Created ESM package.json'); 