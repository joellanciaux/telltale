import type { Plugin } from 'vite';
import * as path from 'path';
import { readFile } from 'fs/promises';
import { findComponentFiles } from './file-utils';
import { extractContextualClasses, extractComponentImports } from './ast-parser';
import { extractCSSProperties } from './css-extractor';
import { analyzeStyleImpact } from './report-generator';
import type { ComponentInfo } from './types';

interface TelltaleConfig {
  outputPath?: string;
}

export function telltalePlugin(config: TelltaleConfig = {}): Plugin {
  const componentMap: Map<string, ComponentInfo> = new Map();
  const dependencyGraph: Map<string, Set<string>> = new Map();
  const outputPath = config.outputPath || 'gen/tailwind-component-analysis.gen.md';

  const runAnalysis = async () => {
    console.log('🔍 Analyzing React components for Tailwind hierarchy...');
    
    // Find all React component files
    const componentFiles = await findComponentFiles('src');

    // Clear previous analysis
    componentMap.clear();
    dependencyGraph.clear();

    // Analyze each component file
    for (const filePath of componentFiles) {
      try {
        const fullPath = path.resolve(filePath);
        const code = await readFile(fullPath, 'utf-8');
        
        const { allClasses: tailwindClasses, contextualMapping } = extractContextualClasses(code, fullPath);
        const { properties: cssProperties, variables: cssVariables } = extractCSSProperties(code);
        const importedComponents = extractComponentImports(code, fullPath);
        
        componentMap.set(fullPath, {
          filePath: fullPath,
          tailwindClasses,
          cssProperties,
          cssVariables,
          importedComponents,
          contextualClasses: contextualMapping,
        });

        dependencyGraph.set(fullPath, importedComponents);
      } catch (error) {
        console.warn(`Failed to analyze ${filePath}: ${error}`);
      }
    }

    console.log(`✅ Analyzed ${componentFiles.length} components`);
    
    // Generate the report
    await analyzeStyleImpact(componentMap, outputPath);
  };

  return {
    name: 'telltale',
    
    async buildStart() {
      await runAnalysis();
    },

    closeBundle() {
      // Also run on production builds
      analyzeStyleImpact(componentMap, outputPath).catch(console.error);
    },
  };
} 