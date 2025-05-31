import * as path from 'path';
import type { ComponentInfo, StyleHierarchy, ComponentHierarchyInfo } from './types';

export const buildStyleHierarchy = (
  componentPath: string, 
  componentMap: Map<string, ComponentInfo>,
  dependencyGraph: Map<string, Set<string>>,
  visited = new Set<string>(), 
  depth = 0, 
  pathStack: string[] = []
): StyleHierarchy | null => {
  if (depth > 10) { // Prevent infinite recursion
    return null;
  }

  // Check for circular reference
  const hasCircularReference = pathStack.includes(componentPath);
  const circularComponents = hasCircularReference ? [...pathStack, componentPath] : [];

  if (visited.has(componentPath) && !hasCircularReference) {
    return null;
  }

  visited.add(componentPath);
  
  const component = componentMap.get(componentPath);
  if (!component) return null;

  const children: StyleHierarchy[] = [];
  const dependencies = dependencyGraph.get(componentPath) || new Set();

  // Only traverse children if we haven't hit a circular reference
  if (!hasCircularReference) {
    for (const depPath of dependencies) {
      const childHierarchy = buildStyleHierarchy(depPath, componentMap, dependencyGraph, new Set(visited), depth + 1, [...pathStack, componentPath]);
      if (childHierarchy) {
        children.push(childHierarchy);
      }
    }
  }

  // Get all contextual classes (flattened)
  const contextualClasses: string[] = [];
  for (const classSet of component.contextualClasses.values()) {
    contextualClasses.push(...Array.from(classSet));
  }

  return {
    component: path.relative(process.cwd(), componentPath),
    classes: Array.from(component.tailwindClasses),
    contextualClasses: contextualClasses,
    children,
    depth,
    hasCircularReference,
    circularComponents: circularComponents.map(p => path.relative(process.cwd(), p)),
  };
};

export const getAllChildClasses = (hierarchy: StyleHierarchy, visited = new Set<string>()): string[] => {
  const componentKey = hierarchy.component;
  if (visited.has(componentKey)) {
    return [];
  }
  visited.add(componentKey);

  const allClasses = new Set<string>();
  
  for (const child of hierarchy.children) {
    // Add direct child classes
    child.classes.forEach(cls => allClasses.add(cls));
    
    // Recursively get grandchild classes
    const grandChildClasses = getAllChildClasses(child, visited);
    grandChildClasses.forEach(cls => allClasses.add(cls));
  }
  
  return Array.from(allClasses);
};

export const getAllChildCSS = (
  componentPath: string, 
  componentMap: Map<string, ComponentInfo>,
  dependencyGraph: Map<string, Set<string>>,
  visited = new Set<string>()
): { properties: string[], variables: string[] } => {
  if (visited.has(componentPath)) {
    return { properties: [], variables: [] };
  }
  visited.add(componentPath);

  const allProperties = new Set<string>();
  const allVariables = new Set<string>();
  
  const dependencies = dependencyGraph.get(componentPath) || new Set();
  
  for (const depPath of dependencies) {
    const component = componentMap.get(depPath);
    if (component) {
      // Add direct child CSS
      component.cssProperties.forEach(prop => allProperties.add(prop));
      component.cssVariables.forEach(variable => allVariables.add(variable));
      
      // Recursively get grandchild CSS
      const grandChildCSS = getAllChildCSS(depPath, componentMap, dependencyGraph, visited);
      grandChildCSS.properties.forEach(prop => allProperties.add(prop));
      grandChildCSS.variables.forEach(variable => allVariables.add(variable));
    }
  }
  
  return { 
    properties: Array.from(allProperties), 
    variables: Array.from(allVariables) 
  };
};

export const buildComponentHierarchyInfo = (
  hierarchy: StyleHierarchy,
  componentMap: Map<string, ComponentInfo>,
  dependencyGraph: Map<string, Set<string>>
): ComponentHierarchyInfo => {
  const allChildClasses = getAllChildClasses(hierarchy);
  
  // Get the component path from the hierarchy
  const componentPath = Array.from(componentMap.keys()).find(fullPath => 
    path.relative(process.cwd(), fullPath) === hierarchy.component
  );
  
  const allChildCSS = componentPath ? getAllChildCSS(componentPath, componentMap, dependencyGraph) : { properties: [], variables: [] };
  
  const component = componentPath ? componentMap.get(componentPath) : null;
  
  return {
    component: hierarchy.component,
    directClasses: hierarchy.classes,
    contextualClasses: hierarchy.contextualClasses,
    directCSSProperties: component ? Array.from(component.cssProperties) : [],
    directCSSVariables: component ? Array.from(component.cssVariables) : [],
    allChildClasses,
    allChildCSSProperties: allChildCSS.properties,
    allChildCSSVariables: allChildCSS.variables,
    hasCircularReference: hierarchy.hasCircularReference || false,
    circularComponents: hierarchy.circularComponents || [],
    children: hierarchy.children.map(child => buildComponentHierarchyInfo(child, componentMap, dependencyGraph)),
  };
}; 