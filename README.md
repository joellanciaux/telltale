# telltale (beta)

<div align="center">
  <img src="https://raw.githubusercontent.com/joellanciaux/telltale/master/media/logo.png" alt="Telltale" width="auto" height="200" />
  <p align="center">
    <b>Pack your tailwind + css usage into AI-friendly formats</b>
  </p>
</div>

## Usage

```typescript
// vite.config.ts
import { telltalePlugin } from '@joellanciaux/telltale'

export default defineConfig({
  plugins: [
    // Your other plugins
    telltalePlugin()
  ],
})
```

## Configuration

The plugin accepts an optional configuration object:

```typescript
// vite.config.ts
import { telltalePlugin } from '@joellanciaux/telltale'

export default defineConfig({
  plugins: [
    telltalePlugin({
      outputPath: 'custom/path/analysis.md' // Optional: customize output file path
    })
  ],
})
```

### Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `outputPath` | `string` | `gen/tailwind-component-analysis.gen.md` | Path where the analysis report will be generated |

## Why
The general thought is to compact your projects' class heirachy into an unminified / compiled format for better use with LLMs. 

## Does it work?
I'm still figuring that out.

## File Structure

### Core Modules

- **`types.ts`** - TypeScript interfaces and type definitions
- **`file-utils.ts`** - File system operations and path utilities
- **`tailwind-detector.ts`** - Tailwind class validation and contextual class detection
- **`ast-parser.ts`** - AST parsing, JSX traversal, and class extraction from expressions
- **`css-extractor.ts`** - CSS properties, variables, and styled-components extraction
- **`component-analyzer.ts`** - Component hierarchy and dependency graph analysis
- **`report-generator.ts`** - Markdown report generation and formatting
- **`plugin.ts`** - Main plugin entry point and orchestration

### Module Responsibilities

#### `types.ts`
Defines all TypeScript interfaces used across the plugin:
- `ComponentInfo` - Component metadata structure
- `StyleHierarchy` - Component hierarchy representation
- `ContextualAnalysisResult` - AST analysis results
- `CSSAnalysisResult` - CSS extraction results

#### `file-utils.ts`
File system utilities:
- `findComponentFiles()` - Recursively find React component files
- `getComponentDisplayName()` - Extract display names from file paths

#### `tailwind-detector.ts`
Tailwind class identification:
- `isTailwindClass()` - Validate if a string is a Tailwind utility class
- `isContextualClass()` - Identify classes that influence child components (layout, positioning, inheritance)

#### `ast-parser.ts`
AST parsing and traversal:
- `extractContextualClasses()` - Parse JSX and map contextual influences to specific child components
- `extractTailwindClasses()` - Extract all Tailwind classes from JSX and expressions
- `extractComponentImports()` - Track component dependencies
- `extractClassesFromExpression()` - Handle dynamic class expressions (ternary, conditionals, utility functions)

#### `css-extractor.ts`
CSS-in-JS and style analysis:
- `extractCSSProperties()` - Extract CSS properties and custom variables
- Support for styled-components, emotion, style attributes
- CSS variable tracking (both `--custom-properties` and `var()` usage)

#### `component-analyzer.ts`
Component relationship analysis:
- `buildStyleHierarchy()` - Build component dependency trees
- `getAllChildClasses()` - Recursively collect all child component classes
- `getAllChildCSS()` - Aggregate CSS properties across component hierarchies
- Circular dependency detection

#### `report-generator.ts`
Output generation:
- `analyzeStyleImpact()` - Generate comprehensive markdown analysis
- Grouped influence reporting
- Component sorting by style complexity
- Metadata and usage guidelines

#### `plugin.ts`
Main orchestration:
- Vite plugin interface implementation
- File discovery and analysis coordination
- Component map and dependency graph management

## Benefits of This Structure

1. **Separation of Concerns** - Each module has a single, well-defined responsibility
2. **Testability** - Individual functions can be unit tested in isolation
3. **Maintainability** - Easier to locate and modify specific functionality
4. **Reusability** - Modules can be imported independently for other tools
5. **Type Safety** - Centralized type definitions prevent inconsistencies
6. **Performance** - Can optimize specific parsing/analysis phases independently

## Usage

The plugin can be used with default settings or customized:

```typescript
// Default usage - outputs to gen/tailwind-component-analysis.gen.md
import { telltalePlugin } from './index';

export default defineConfig({
  plugins: [telltalePlugin()],
});
```

```typescript
// Custom output path
import { telltalePlugin } from './index';

export default defineConfig({
  plugins: [
    telltalePlugin({
      outputPath: 'docs/styling-analysis.md'
    })
  ],
});
```

The modular structure is completely internal and doesn't change the public API. 