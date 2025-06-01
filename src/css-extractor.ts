import { parse } from '@babel/parser';
import traverse from '@babel/traverse';
import * as t from '@babel/types';
import type { CSSAnalysisResult } from './types';

// Handle both CommonJS and ES module exports for @babel/traverse
const babelTraverse = (traverse as any).default || traverse;

export const extractCSSProperties = (code: string): CSSAnalysisResult => {
  const properties = new Set<string>();
  const variables = new Set<string>();
  
  try {
    const ast = parse(code, {
      sourceType: 'module',
      plugins: ['jsx', 'typescript', 'decorators-legacy'],
    });

    babelTraverse(ast, {
      // Handle style attributes
      JSXAttribute(path: any) {
        if (t.isJSXIdentifier(path.node.name, { name: 'style' })) {
          extractStyleFromNode(path.node.value, properties, variables);
        }
      },

      // Handle CSS-in-JS patterns and styled components
      TaggedTemplateExpression(path: any) {
        const tag = path.node.tag;
        const isStyledComponent = 
          (t.isMemberExpression(tag) && t.isIdentifier(tag.object, { name: 'styled' })) ||
          (t.isIdentifier(tag, { name: 'css' })) ||
          (t.isCallExpression(tag) && t.isMemberExpression(tag.callee) && t.isIdentifier(tag.callee.object, { name: 'styled' }));
        
        if (isStyledComponent) {
          path.node.quasi.quasis.forEach((quasi: any) => {
            extractCSSFromString(quasi.value.raw, properties, variables);
          });
        }
      },

      // Handle template literals that might contain CSS
      TemplateLiteral(path: any) {
        if (isInStyleContext(path)) {
          path.node.quasis.forEach((quasi: any) => {
            extractCSSFromString(quasi.value.raw, properties, variables);
          });
        }
      },

      // Handle string literals in style contexts
      StringLiteral(path: any) {
        if (isInStyleContext(path)) {
          extractCSSFromString(path.node.value, properties, variables);
        }
      },

      // Handle object expressions in style attributes
      ObjectExpression(path: any) {
        if (isInStyleContext(path)) {
          path.node.properties.forEach((prop: any) => {
            if (t.isObjectProperty(prop)) {
              // Extract property name
              let propName = '';
              if (t.isIdentifier(prop.key)) {
                propName = prop.key.name;
              } else if (t.isStringLiteral(prop.key)) {
                propName = prop.key.value;
              }
              
              if (propName) {
                // Convert camelCase to kebab-case for CSS properties
                const cssProperty = propName.replace(/([A-Z])/g, '-$1').toLowerCase();
                properties.add(cssProperty);
              }
              
              // Extract CSS variables from values
              if (t.isStringLiteral(prop.value)) {
                extractCSSVariablesFromString(prop.value.value, variables);
              }
            }
          });
        }
      },
    });
  } catch (error) {
    console.warn(`Failed to parse CSS properties: ${error}`);
  }

  return { properties, variables };
};

const extractStyleFromNode = (node: any, properties: Set<string>, variables: Set<string>) => {
  if (t.isJSXExpressionContainer(node)) {
    if (t.isObjectExpression(node.expression)) {
      node.expression.properties.forEach((prop: any) => {
        if (t.isObjectProperty(prop)) {
          let propName = '';
          if (t.isIdentifier(prop.key)) {
            propName = prop.key.name;
          } else if (t.isStringLiteral(prop.key)) {
            propName = prop.key.value;
          }
          
          if (propName) {
            const cssProperty = propName.replace(/([A-Z])/g, '-$1').toLowerCase();
            properties.add(cssProperty);
          }
          
          if (t.isStringLiteral(prop.value)) {
            extractCSSVariablesFromString(prop.value.value, variables);
          }
        }
      });
    } else if (t.isStringLiteral(node.expression)) {
      extractCSSFromString(node.expression.value, properties, variables);
    }
  } else if (t.isStringLiteral(node)) {
    extractCSSFromString(node.value, properties, variables);
  }
};

const extractCSSFromString = (cssString: string, properties: Set<string>, variables: Set<string>) => {
  // Extract CSS custom properties (--variable-name)
  const customPropertyRegex = /--[a-zA-Z0-9-_]+/g;
  const customProperties = cssString.match(customPropertyRegex);
  if (customProperties) {
    customProperties.forEach(prop => variables.add(prop));
  }
  
  // Extract CSS variables (var(--variable-name))
  extractCSSVariablesFromString(cssString, variables);
  
  // Extract CSS property names from property: value pairs
  const propertyRegex = /([a-zA-Z-]+)\s*:/g;
  let match;
  while ((match = propertyRegex.exec(cssString)) !== null) {
    const property = match[1]?.trim();
    if (property && !property.startsWith('--')) {
      properties.add(property);
    }
  }
};

const extractCSSVariablesFromString = (str: string, variables: Set<string>) => {
  // Extract var() functions
  const varRegex = /var\(\s*(--[a-zA-Z0-9-_]+)/g;
  let match;
  while ((match = varRegex.exec(str)) !== null && match[1]) {
    variables.add(match[1]);
  }
  
  // Extract custom properties directly
  const customPropertyRegex = /--[a-zA-Z0-9-_]+/g;
  const customProperties = str.match(customPropertyRegex);
  if (customProperties) {
    customProperties.forEach(prop => variables.add(prop));
  }
};

const isInStyleContext = (path: any): boolean => {
  let parent = path.parent;
  let currentPath = path;
  
  while (parent && currentPath) {
    // Direct style attribute
    if (
      t.isJSXAttribute(parent) &&
      t.isJSXIdentifier(parent.name, { name: 'style' })
    ) {
      return true;
    }
    
    // Inside styled-components or CSS-in-JS
    if (t.isTaggedTemplateExpression(parent)) {
      const tag = parent.tag;
      const isStyledComponent = 
        (t.isMemberExpression(tag) && t.isIdentifier(tag.object, { name: 'styled' })) ||
        (t.isIdentifier(tag, { name: 'css' })) ||
        (t.isCallExpression(tag) && t.isMemberExpression(tag.callee) && t.isIdentifier(tag.callee.object, { name: 'styled' }));
      
      if (isStyledComponent) {
        return true;
      }
    }
    
    currentPath = currentPath.parentPath;
    parent = currentPath?.parent;
  }
  
  return false;
}; 