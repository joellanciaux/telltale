import * as path from 'path';
import { writeFile, mkdir } from 'fs/promises';
import { getComponentDisplayName } from './file-utils';
import type { ComponentInfo } from './types';

export const analyzeStyleImpact = async (
  componentMap: Map<string, ComponentInfo>,
  outputPath: string = 'gen/tailwind-component-analysis.gen.md'
): Promise<void> => {
  // Ensure the output directory exists
  const outputDir = path.dirname(outputPath);
  await mkdir(outputDir, { recursive: true });

  const markdownLines: string[] = [];
  
  markdownLines.push('# Tailwind Component Analysis');
  markdownLines.push('');
  markdownLines.push(`Generated: ${new Date().toISOString()}`);
  markdownLines.push('');
  
  // Add comprehensive metadata section
  markdownLines.push('<file_summary>');
  markdownLines.push('This file contains a comprehensive analysis of Tailwind CSS usage across React components.');
  markdownLines.push('');
  markdownLines.push('<purpose>');
  markdownLines.push('This analysis maps the relationship between React components and their Tailwind CSS classes,');
  markdownLines.push('including contextual influences where parent components affect child styling through layout,');
  markdownLines.push('positioning, or inherited properties. It enables understanding of styling dependencies,');
  markdownLines.push('potential conflicts, and component styling hierarchies for refactoring and optimization.');
  markdownLines.push('</purpose>');
  markdownLines.push('');
  markdownLines.push('<file_format>');
  markdownLines.push('Each component entry contains:');
  markdownLines.push('- Component name and file path');
  markdownLines.push('- "Influences" section: Groups child components by the contextual classes that affect them');
  markdownLines.push('- "Classes" section: All Tailwind classes directly applied to this component');
  markdownLines.push('- "CSS Props/Vars" sections: Custom CSS properties and variables (when present)');
  markdownLines.push('');
  markdownLines.push('Influence format: "contextual-classes": ComponentA, ComponentB, ComponentC');
  markdownLines.push('- Components under same influence inherit layout/styling context from parent');
  markdownLines.push('- "None" indicates components with no contextual styling influence');
  markdownLines.push('</file_format>');
  markdownLines.push('');
  markdownLines.push('<usage_guidelines>');
  markdownLines.push('- Use this for identifying styling dependencies before component refactoring');
  markdownLines.push('- Look for "Influences" to understand parent-child styling relationships');
  markdownLines.push('- Components with many influences may be tightly coupled to their parent context');
  markdownLines.push('- Large "Classes" sections may indicate components needing style extraction');
  markdownLines.push('- "None" influences suggest components that are more portable/reusable');
  markdownLines.push('</usage_guidelines>');
  markdownLines.push('');
  markdownLines.push('<notes>');
  markdownLines.push('- Only components with Tailwind classes or styling influences are included');
  markdownLines.push('- Contextual classes: layout (flex/grid), positioning, backgrounds, inherited text styles');
  markdownLines.push('- Analysis based on static code parsing - dynamic class application may not be captured');
  markdownLines.push('- File paths are relative to project root');
  markdownLines.push('- Components sorted by Tailwind class count (most styled first)');
  markdownLines.push('</notes>');
  markdownLines.push('');
  markdownLines.push('</file_summary>');
  markdownLines.push('');

  // Only show components with actual Tailwind classes or influences
  const relevantComponents = Array.from(componentMap.entries()).filter(([_, info]) => 
    info.tailwindClasses.size > 0 || 
    info.contextualClasses.size > 0 || 
    info.importedComponents.size > 0
  );

  const sortedComponents = relevantComponents.sort(([,a], [,b]) => b.tailwindClasses.size - a.tailwindClasses.size);

  for (const [componentPath, info] of sortedComponents) {
    const relPath = path.relative(process.cwd(), componentPath);
    const componentName = relPath.split('/').pop()?.replace(/\.(tsx|ts|jsx|js)$/, '') || relPath;
    
    markdownLines.push(`## ${componentName}`);
    markdownLines.push(`Path: ${relPath}`);
    
    // Compressed contextual influences
    if (info.contextualClasses.size > 0 || info.importedComponents.size > 0) {
      const influenceGroups = new Map<string, Set<string>>();
      
      // Process contextual mapping
      for (const [contextualKey, classes] of info.contextualClasses) {
        const [componentName] = contextualKey.split(':::');
        const influenceKey = classes.size > 0 ? Array.from(classes).join(' ') : 'none';
        
        if (!influenceGroups.has(influenceKey)) {
          influenceGroups.set(influenceKey, new Set());
        }
        if (componentName) {
          influenceGroups.get(influenceKey)!.add(componentName);
        }
      }
      
      // Add non-contextual imports
      for (const importPath of info.importedComponents) {
        const displayName = getComponentDisplayName(importPath);
        let foundInContextual = false;
        for (const [contextualKey] of info.contextualClasses) {
          const [name] = contextualKey.split(':::');
          if (name === displayName) {
            foundInContextual = true;
            break;
          }
        }
        
        if (!foundInContextual) {
          if (!influenceGroups.has('none')) {
            influenceGroups.set('none', new Set());
          }
          influenceGroups.get('none')!.add(displayName);
        }
      }
      
      // Output compressed influences
      if (influenceGroups.size > 0) {
        markdownLines.push('Influences:');
        for (const [influence, components] of influenceGroups) {
          const componentList = Array.from(components).sort().join(', ');
          if (influence === 'none') {
            markdownLines.push(`- None: ${componentList}`);
          } else {
            markdownLines.push(`- "${influence}": ${componentList}`);
          }
        }
      }
    }
    
    // Compressed Tailwind classes - only if they exist
    if (info.tailwindClasses.size > 0) {
      markdownLines.push(`Classes: ${Array.from(info.tailwindClasses).join(' ')}`);
    }
    
    // Compressed CSS info - only if exists
    if (info.cssProperties.size > 0) {
      markdownLines.push(`CSS Props: ${Array.from(info.cssProperties).join(', ')}`);
    }
    
    if (info.cssVariables.size > 0) {
      markdownLines.push(`CSS Vars: ${Array.from(info.cssVariables).join(', ')}`);
    }
    
    markdownLines.push('');
  }

  // Write to file
  await writeFile(outputPath, markdownLines.join('\n'));
  console.log(`✅ Compressed style analysis written to ${outputPath}`);
}; 