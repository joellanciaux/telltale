import * as path from 'path';
import fs from 'fs/promises';

export const findComponentFiles = async (dir: string): Promise<string[]> => {
  const files: string[] = [];
  const entries = await fs.readdir(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    
    if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
      files.push(...await findComponentFiles(fullPath));
    } else if (entry.isFile() && /\.(tsx|ts|jsx|js)$/.test(entry.name) && 
               !entry.name.includes('.test.') && !entry.name.includes('.spec.')) {
      files.push(fullPath);
    }
  }
  
  return files;
};

export const getComponentDisplayName = (componentPath: string): string => {
  const relativePath = path.relative(process.cwd(), componentPath);
  const fileName = path.basename(relativePath, path.extname(relativePath));
  
  // Handle index files
  if (fileName === 'index') {
    const dirName = path.basename(path.dirname(relativePath));
    return dirName;
  }
  
  return fileName;
}; 