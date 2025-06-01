import { parse } from '@babel/parser';
import traverse from '@babel/traverse';
import * as t from '@babel/types';
import * as path from 'path';
import { isTailwindClass, isContextualClass } from './tailwind-detector';
import type { ContextualAnalysisResult } from './types';

// Handle both CommonJS and ES module exports for @babel/traverse
const babelTraverse = (traverse as any).default || traverse;

export const extractContextualClasses = (code: string, filePath: string): ContextualAnalysisResult => {
  const allClasses = new Set<string>();
  const contextualMapping = new Map<string, Set<string>>();
  
  try {
    const ast = parse(code, {
      sourceType: 'module',
      plugins: ['jsx', 'typescript', 'decorators-legacy'],
    });

    // First pass: collect imported component names and their import paths
    const importedComponentNames = new Map<string, string>(); // name -> import path
    
    babelTraverse(ast, {
      ImportDeclaration(path: any) {
        const source = path.node.source.value;
        if (source.startsWith('./') || source.startsWith('../') || source.startsWith('@/components/')) {
          path.node.specifiers.forEach((spec: any) => {
            if (t.isImportDefaultSpecifier(spec) || t.isImportSpecifier(spec)) {
              importedComponentNames.set(spec.local.name, source);
            }
          });
        }
      },
    });

    // Second pass: analyze JSX structure and map contextual classes to specific components
    babelTraverse(ast, {
      JSXElement(path: any) {
        const elementClasses = extractClassesFromJSXElement(path.node);
        elementClasses.forEach(cls => allClasses.add(cls));
        
        // Check if this element contains imported components as children
        const contextualClasses = elementClasses.filter(isContextualClass);
        
        if (contextualClasses.length > 0) {
          // Find specific child components in this element and map classes to them
          const componentInfluences = findComponentInfluences(path.node, importedComponentNames);
          
          for (const [componentName, importPath] of componentInfluences) {
            const contextualKey = `${componentName}:::${importPath}`;
            if (!contextualMapping.has(contextualKey)) {
              contextualMapping.set(contextualKey, new Set());
            }
            contextualClasses.forEach(cls => 
              contextualMapping.get(contextualKey)!.add(cls)
            );
          }
        }
      },
    });

  } catch (error) {
    console.warn(`Failed to parse contextual classes for ${filePath}: ${error}`);
  }

  return { allClasses, contextualMapping };
};

export const findComponentInfluences = (element: any, importedComponentNames: Map<string, string>): Map<string, string> => {
  const componentInfluences = new Map<string, string>();
  
  const traverse = (node: any) => {
    if (t.isJSXElement(node)) {
      const elementName = getJSXElementName(node);
      if (elementName && importedComponentNames.has(elementName)) {
        componentInfluences.set(elementName, importedComponentNames.get(elementName)!);
      }
      
      // Recurse into children
      if (node.children) {
        node.children.forEach(traverse);
      }
    } else if (t.isJSXFragment(node)) {
      if (node.children) {
        node.children.forEach(traverse);
      }
    } else if (t.isJSXExpressionContainer(node)) {
      // Handle conditional rendering and other expressions
      traverseExpression(node.expression);
    }
  };
  
  const traverseExpression = (expression: any) => {
    if (t.isConditionalExpression(expression)) {
      // Handle ternary: condition ? <Component /> : <Other />
      traverseExpression(expression.consequent);
      traverseExpression(expression.alternate);
    } else if (t.isLogicalExpression(expression)) {
      // Handle logical: condition && <Component />
      if (expression.operator === '&&') {
        traverseExpression(expression.right);
      } else {
        traverseExpression(expression.left);
        traverseExpression(expression.right);
      }
    } else if (t.isJSXElement(expression)) {
      // Direct JSX element in expression
      traverse(expression);
    } else if (t.isJSXFragment(expression)) {
      // JSX fragment in expression
      traverse(expression);
    } else if (t.isCallExpression(expression)) {
      // Handle function calls that might return JSX
      expression.arguments.forEach((arg: any) => {
        if (t.isJSXElement(arg) || t.isJSXFragment(arg)) {
          traverse(arg);
        } else if (t.isArrowFunctionExpression(arg) || t.isFunctionExpression(arg)) {
          if (t.isJSXElement(arg.body) || t.isJSXFragment(arg.body)) {
            traverse(arg.body);
          } else if (t.isBlockStatement(arg.body)) {
            // Handle function body with return statements
            arg.body.body.forEach((stmt: any) => {
              if (t.isReturnStatement(stmt) && (t.isJSXElement(stmt.argument) || t.isJSXFragment(stmt.argument))) {
                traverse(stmt.argument);
              }
            });
          }
        }
      });
    } else if (t.isArrayExpression(expression)) {
      // Handle arrays of JSX elements
      expression.elements.forEach((element: any) => {
        if (element && (t.isJSXElement(element) || t.isJSXFragment(element))) {
          traverse(element);
        }
      });
    }
  };
  
  if (element.children) {
    element.children.forEach(traverse);
  }
  
  return componentInfluences;
};

export const extractClassesFromJSXElement = (element: any): string[] => {
  const classes: string[] = [];
  
  if (element.openingElement && element.openingElement.attributes) {
    for (const attr of element.openingElement.attributes) {
      if (t.isJSXAttribute(attr) && t.isJSXIdentifier(attr.name, { name: 'className' })) {
        if (t.isStringLiteral(attr.value)) {
          const classList = attr.value.value.split(/\s+/).filter(Boolean);
          classList.forEach((cls: string) => {
            if (isTailwindClass(cls)) {
              classes.push(cls);
            }
          });
        } else if (t.isJSXExpressionContainer(attr.value)) {
          // Handle dynamic class expressions
          const extractedClasses = extractClassesFromExpression(attr.value.expression);
          classes.push(...extractedClasses);
        }
      }
    }
  }
  
  return classes;
};

export const extractClassesFromExpression = (expression: any): string[] => {
  const classes: string[] = [];
  
  if (t.isStringLiteral(expression)) {
    const classList = expression.value.split(/\s+/).filter(Boolean);
    classList.forEach((cls: string) => {
      if (isTailwindClass(cls)) {
        classes.push(cls);
      }
    });
  } else if (t.isTemplateLiteral(expression)) {
    // Handle template literals with embedded expressions
    expression.quasis.forEach((quasi: any) => {
      const classList = quasi.value.raw.split(/\s+/).filter(Boolean);
      classList.forEach((cls: string) => {
        if (isTailwindClass(cls)) {
          classes.push(cls);
        }
      });
    });
    
    // Also extract classes from expressions within the template literal
    expression.expressions.forEach((expr: any) => {
      const exprClasses = extractClassesFromExpression(expr);
      classes.push(...exprClasses);
    });
  } else if (t.isCallExpression(expression)) {
    // Handle utility functions like cn(), clsx(), etc.
    const callee = expression.callee;
    const isClassUtility = 
      (t.isIdentifier(callee) && ['cn', 'clsx', 'classNames', 'cx', 'twMerge', 'cva'].includes(callee.name));
    
    if (isClassUtility) {
      expression.arguments.forEach((arg: any) => {
        const argClasses = extractClassesFromExpression(arg);
        classes.push(...argClasses);
      });
    }
  } else if (t.isConditionalExpression(expression)) {
    // Handle ternary expressions like condition ? 'class1' : 'class2'
    const consequentClasses = extractClassesFromExpression(expression.consequent);
    const alternateClasses = extractClassesFromExpression(expression.alternate);
    classes.push(...consequentClasses, ...alternateClasses);
  } else if (t.isLogicalExpression(expression)) {
    // Handle logical expressions like condition && 'class1'
    if (expression.operator === '&&') {
      // For &&, only the right side contains classes
      const rightClasses = extractClassesFromExpression(expression.right);
      classes.push(...rightClasses);
    } else {
      // For ||, both sides could contain classes
      const leftClasses = extractClassesFromExpression(expression.left);
      const rightClasses = extractClassesFromExpression(expression.right);
      classes.push(...leftClasses, ...rightClasses);
    }
  } else if (t.isArrayExpression(expression)) {
    // Handle arrays of classes
    expression.elements.forEach((element: any) => {
      if (element) {
        const elementClasses = extractClassesFromExpression(element);
        classes.push(...elementClasses);
      }
    });
  } else if (t.isObjectExpression(expression)) {
    // Handle objects like { 'class1': condition, 'class2': true }
    expression.properties.forEach((prop: any) => {
      if (t.isObjectProperty(prop) && (t.isStringLiteral(prop.key) || t.isIdentifier(prop.key))) {
        const key = t.isStringLiteral(prop.key) ? prop.key.value : prop.key.name;
        const classList = key.split(/\s+/).filter(Boolean);
        classList.forEach((cls: string) => {
          if (isTailwindClass(cls)) {
            classes.push(cls);
          }
        });
      }
    });
  }
  
  return classes;
};

export const extractTailwindClasses = (code: string): Set<string> => {
  const classes = new Set<string>();
  
  try {
    const ast = parse(code, {
      sourceType: 'module',
      plugins: ['jsx', 'typescript', 'decorators-legacy'],
    });

    babelTraverse(ast, {
      // Handle static className="..."
      JSXAttribute(path: any) {
        if (
          t.isJSXIdentifier(path.node.name, { name: 'className' }) &&
          t.isStringLiteral(path.node.value)
        ) {
          const classList = path.node.value.value.split(/\s+/).filter(Boolean);
          classList.forEach((cls: string) => {
            if (isTailwindClass(cls)) {
              classes.add(cls);
            }
          });
        }
      },

      // Handle template literals like className={`bg-red-500 ${condition ? 'text-white' : ''}`}
      JSXExpressionContainer(path: any) {
        if (
          path.parent &&
          t.isJSXAttribute(path.parent) &&
          t.isJSXIdentifier(path.parent.name, { name: 'className' })
        ) {
          if (t.isTemplateLiteral(path.node.expression)) {
            path.node.expression.quasis.forEach((quasi: any) => {
              const classList = quasi.value.raw.split(/\s+/).filter(Boolean);
              classList.forEach((cls: string) => {
                if (isTailwindClass(cls)) {
                  classes.add(cls);
                }
              });
            });
          }
        }
      },

      // Handle utility functions like cn(), clsx(), classNames(), etc.
      CallExpression(path: any) {
        const callee = path.node.callee;
        
        // Check if it's a call to a class utility function
        const isClassUtilityFunction = 
          (t.isIdentifier(callee) && ['cn', 'clsx', 'classNames', 'cx', 'twMerge', 'cva'].includes(callee.name)) ||
          (t.isMemberExpression(callee) && t.isIdentifier(callee.property) && ['cn', 'clsx', 'classNames', 'cx', 'twMerge'].includes(callee.property.name));
        
        // Also check if this call expression is inside a className attribute
        const isInClassNameContext = isInClassNameContextCheck(path);
        
        if (isClassUtilityFunction || isInClassNameContext) {
          // Extract classes from all string arguments
          path.node.arguments.forEach((arg: any) => {
            extractClassesFromNode(arg, classes);
          });
        }
      },

      // Handle string literals in template expressions and other contexts
      StringLiteral(path: any) {
        if (isInClassNameContextCheck(path)) {
          const classList = path.node.value.split(/\s+/).filter(Boolean);
          classList.forEach((cls: string) => {
            if (isTailwindClass(cls)) {
              classes.add(cls);
            }
          });
        }
      },

      // Handle template literals more thoroughly
      TemplateLiteral(path: any) {
        if (isInClassNameContextCheck(path)) {
          path.node.quasis.forEach((quasi: any) => {
            const classList = quasi.value.raw.split(/\s+/).filter(Boolean);
            classList.forEach((cls: string) => {
              if (isTailwindClass(cls)) {
                classes.add(cls);
              }
            });
          });
        }
      },
    });
  } catch (error) {
    console.warn(`Failed to parse file for Tailwind classes: ${error}`);
  }

  return classes;
};

export const extractComponentImports = (code: string, filePath: string): Set<string> => {
  const imports = new Set<string>();
  
  try {
    const ast = parse(code, {
      sourceType: 'module',
      plugins: ['jsx', 'typescript', 'decorators-legacy'],
    });

    babelTraverse(ast, {
      ImportDeclaration(astPath: any) {
        const source = astPath.node.source.value;
        
        // Only track relative imports (local components) and UI components
        if (source.startsWith('./') || source.startsWith('../') || source.startsWith('@/components/')) {
          let resolvedPath = '';
          
          if (source.startsWith('@/components/')) {
            // Handle @/ alias - assume it points to src/
            resolvedPath = path.resolve(process.cwd(), 'src', source.substring(2));
          } else {
            resolvedPath = path.resolve(path.dirname(filePath), source);
          }
          
          const extensions = ['.tsx', '.ts', '.jsx', '.js'];
          
          // Try to find the actual file
          for (const ext of extensions) {
            const fullPath = resolvedPath + ext;
            imports.add(fullPath);
            break;
          }
          
          // Also try looking for index files
          for (const ext of extensions) {
            const indexPath = path.join(resolvedPath, 'index' + ext);
            imports.add(indexPath);
            break;
          }
        }
      },
    });
  } catch (error) {
    console.warn(`Failed to parse imports for ${filePath}: ${error}`);
  }

  return imports;
};

const extractClassesFromNode = (node: any, classes: Set<string>) => {
  if (t.isStringLiteral(node)) {
    const classList = node.value.split(/\s+/).filter(Boolean);
    classList.forEach((cls: string) => {
      if (isTailwindClass(cls)) {
        classes.add(cls);
      }
    });
  } else if (t.isTemplateLiteral(node)) {
    node.quasis.forEach((quasi: any) => {
      const classList = quasi.value.raw.split(/\s+/).filter(Boolean);
      classList.forEach((cls: string) => {
        if (isTailwindClass(cls)) {
          classes.add(cls);
        }
      });
    });
  } else if (t.isConditionalExpression(node)) {
    // Handle ternary expressions like condition ? 'class1' : 'class2'
    extractClassesFromNode(node.consequent, classes);
    extractClassesFromNode(node.alternate, classes);
  } else if (t.isLogicalExpression(node)) {
    // Handle logical expressions like condition && 'class1'
    extractClassesFromNode(node.left, classes);
    extractClassesFromNode(node.right, classes);
  } else if (t.isArrayExpression(node)) {
    // Handle arrays of classes
    node.elements.forEach((element: any) => {
      if (element) {
        extractClassesFromNode(element, classes);
      }
    });
  } else if (t.isObjectExpression(node)) {
    // Handle objects like { 'class1': condition, 'class2': true }
    node.properties.forEach((prop: any) => {
      if (t.isObjectProperty(prop) && (t.isStringLiteral(prop.key) || t.isIdentifier(prop.key))) {
        const key = t.isStringLiteral(prop.key) ? prop.key.value : prop.key.name;
        const classList = key.split(/\s+/).filter(Boolean);
        classList.forEach((cls: string) => {
          if (isTailwindClass(cls)) {
            classes.add(cls);
          }
        });
      }
    });
  }
};

const isInClassNameContextCheck = (path: any): boolean => {
  let parent = path.parent;
  let currentPath = path;
  
  // Traverse up the AST to find className contexts
  while (parent && currentPath) {
    // Direct className attribute
    if (
      t.isJSXAttribute(parent) &&
      t.isJSXIdentifier(parent.name, { name: 'className' })
    ) {
      return true;
    }
    
    // Inside a call expression that might be a class utility
    if (t.isCallExpression(parent)) {
      const callee = parent.callee;
      const isClassUtility = 
        (t.isIdentifier(callee) && ['cn', 'clsx', 'classNames', 'cx', 'twMerge', 'cva'].includes(callee.name)) ||
        (t.isMemberExpression(callee) && t.isIdentifier(callee.property) && ['cn', 'clsx', 'classNames', 'cx', 'twMerge'].includes(callee.property.name));
      
      if (isClassUtility) {
        return true;
      }
    }
    
    // Move up the tree
    currentPath = currentPath.parentPath;
    parent = currentPath?.parent;
  }
  
  return false;
};

const getJSXElementName = (element: any): string | null => {
  if (element.openingElement && element.openingElement.name) {
    const name = element.openingElement.name;
    if (t.isJSXIdentifier(name)) {
      return name.name;
    } else if (t.isJSXMemberExpression(name)) {
      // Handle cases like Component.SubComponent
      return getJSXMemberExpressionName(name);
    }
  }
  return null;
};

const getJSXMemberExpressionName = (memberExpr: any): string => {
  if (t.isJSXIdentifier(memberExpr.object) && t.isJSXIdentifier(memberExpr.property)) {
    return `${memberExpr.object.name}.${memberExpr.property.name}`;
  }
  return '';
}; 