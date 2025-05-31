const { writeFile } = require('fs/promises');
const { join } = require('path');

async function createEsmPackage() {
  const esmPackageJson = {
    "type": "module"
  };

  await writeFile(
    join('dist', 'esm', 'package.json'), 
    JSON.stringify(esmPackageJson, null, 2)
  );

  console.log('✅ Created ESM package.json');
}

createEsmPackage().catch(console.error); 