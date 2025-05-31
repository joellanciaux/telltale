export interface ComponentInfo {
  filePath: string;
  tailwindClasses: Set<string>;
  cssProperties: Set<string>;
  cssVariables: Set<string>;
  importedComponents: Set<string>;
  contextualClasses: Map<string, Set<string>>; // component name -> classes that influence it
  exportedName?: string;
}

export interface StyleHierarchy {
  component: string;
  classes: string[];
  contextualClasses: string[]; // Only classes that influence children
  children: StyleHierarchy[];
  depth: number;
  hasCircularReference?: boolean;
  circularComponents?: string[];
}

export interface StyleConflict {
  child: string;
  parent: string;
}

export interface ComponentHierarchyInfo {
  component: string;
  directClasses: string[];
  contextualClasses: string[]; // Classes that influence child components
  directCSSProperties: string[];
  directCSSVariables: string[];
  allChildClasses: string[];
  allChildCSSProperties: string[];
  allChildCSSVariables: string[];
  hasCircularReference: boolean;
  circularComponents: string[];
  children: ComponentHierarchyInfo[];
}

export interface ContextualAnalysisResult {
  allClasses: Set<string>;
  contextualMapping: Map<string, Set<string>>;
}

export interface CSSAnalysisResult {
  properties: Set<string>;
  variables: Set<string>;
} 