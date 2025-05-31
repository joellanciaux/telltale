export const isTailwindClass = (className: string): boolean => {
  // Skip empty strings and non-string values
  if (!className || typeof className !== 'string') {
    return false;
  }

  // Clean the className (remove extra whitespace)
  className = className.trim();
  if (!className) return false;

  // Arbitrary value patterns like bg-[#123456], w-[100px], etc.
  if (/^[a-zA-Z-]+\[.+\]$/.test(className)) {
    return true;
  }

  // Common Tailwind utility patterns
  const tailwindPatterns = [
    // Layout & Display
    /^(block|inline-block|inline|flex|inline-flex|table|inline-table|table-caption|table-cell|table-column|table-column-group|table-footer-group|table-header-group|table-row-group|table-row|flow-root|grid|inline-grid|contents|list-item|hidden)$/,
    
    // Positioning
    /^(static|fixed|absolute|relative|sticky)$/,
    
    // Top, right, bottom, left
    /^(top|right|bottom|left|inset)-.+$/,
    /^(top|right|bottom|left|inset)$/,
    
    // Z-index
    /^z-.+$/,
    
    // Flexbox & Grid
    /^(flex|grid)-.+$/,
    /^(justify|items|content|self)-.+$/,
    /^(order)-.+$/,
    /^(col|row)-.+$/,
    /^gap-.+$/,
    
    // Spacing (padding & margin)
    /^[pm][xytblr]?-.+$/,
    
    // Sizing
    /^(w|h|min-w|min-h|max-w|max-h)-.+$/,
    
    // Typography
    /^(font)-.+$/,
    /^(text)-.+$/,
    /^(leading)-.+$/,
    /^(tracking)-.+$/,
    /^(break)-.+$/,
    /^(whitespace)-.+$/,
    /^(list)-.+$/,
    
    // Backgrounds
    /^(bg)-.+$/,
    
    // Borders
    /^(border)-.+$/,
    /^(divide)-.+$/,
    /^(outline)-.+$/,
    /^(ring)-.+$/,
    
    // Effects
    /^(shadow)-.+$/,
    /^(opacity)-.+$/,
    /^(mix-blend)-.+$/,
    /^(bg-blend)-.+$/,
    
    // Filters
    /^(blur|brightness|contrast|drop-shadow|grayscale|hue-rotate|invert|saturate|sepia|backdrop-blur|backdrop-brightness|backdrop-contrast|backdrop-grayscale|backdrop-hue-rotate|backdrop-invert|backdrop-opacity|backdrop-saturate|backdrop-sepia)-.+$/,
    
    // Tables
    /^(border-collapse|border-separate|table-auto|table-fixed)$/,
    
    // Transforms & Animation
    /^(transform|transform-gpu|transform-none)$/,
    /^(origin)-.+$/,
    /^(scale|rotate|translate|skew)-.+$/,
    /^(animate)-.+$/,
    /^(transition)-.+$/,
    /^(ease)-.+$/,
    /^(duration)-.+$/,
    /^(delay)-.+$/,
    
    // Interactivity
    /^(appearance)-.+$/,
    /^(cursor)-.+$/,
    /^(outline)-.+$/,
    /^(pointer-events)-.+$/,
    /^(resize)-.+$/,
    /^(select)-.+$/,
    /^(user-select)-.+$/,
    
    // SVG
    /^(fill|stroke)-.+$/,
    
    // Accessibility
    /^(sr-only|not-sr-only)$/,
    
    // State variants (hover, focus, etc.)
    /^(hover|focus|focus-within|focus-visible|active|visited|target|first|last|odd|even|disabled|checked|indeterminate|default|required|valid|invalid|in-range|out-of-range|placeholder-shown|autofill|read-only):.+$/,
    
    // Responsive variants
    /^(sm|md|lg|xl|2xl):.+$/,
    
    // Dark mode
    /^dark:.+$/,
    
    // Print
    /^print:.+$/,
    
    // Motion preferences
    /^(motion-safe|motion-reduce):.+$/,
    
    // Container
    /^container$/,
    
    // Screen reader
    /^(sr-only|not-sr-only)$/,
    
    // Custom properties and CSS variables
    /^[a-zA-Z][a-zA-Z0-9-]*$/,
    
    // Field sizing (newer Tailwind)
    /^field-sizing-.+$/,
    
    // Arbitrary properties like [color:red]
    /^\[.+:.+\]$/,
    
    // Data attributes
    /^data-\[.+\]:.+$/,
    
    // Aria attributes  
    /^aria-.+:.+$/,
    
    // Group and peer utilities
    /^(group|peer)-.+$/,
    /^(group|peer)\/\w+$/,
    
    // Before and after pseudo-elements
    /^(before|after):.+$/,
    
    // First-line and first-letter
    /^(first-line|first-letter):.+$/,
    
    // Selection
    /^selection:.+$/,
    
    // Backdrop
    /^backdrop-.+$/,
    
    // Placeholder
    /^placeholder-.+$/,
    
    // File input
    /^file:.+$/,
    
    // Marker (for lists)
    /^marker:.+$/,
  ];

  return tailwindPatterns.some(pattern => pattern.test(className));
};

// Classes that create context or influence child components
export const isContextualClass = (className: string): boolean => {
  if (!className || typeof className !== 'string') return false;
  
  const contextualPatterns = [
    // Layout containers that affect children
    /^flex($|-.+)/,
    /^grid($|-.+)/,
    /^container$/,
    
    // Background colors (provide visual context)
    /^bg-.+/,
    
    // Text properties that inherit
    /^text-(inherit|current|transparent|black|white|slate-|gray-|zinc-|neutral-|stone-|red-|orange-|amber-|yellow-|lime-|green-|emerald-|teal-|cyan-|sky-|blue-|indigo-|violet-|purple-|fuchsia-|pink-|rose-)/,
    /^font-.+/,
    /^leading-.+/,
    /^tracking-.+/,
    /^text-(left|center|right|justify)$/,
    
    // Color scheme
    /^dark$/,
    
    // Position contexts
    /^relative$/,
    /^absolute$/,
    /^fixed$/,
    /^sticky$/,
    
    // Overflow (affects child visibility)
    /^overflow-.+/,
    
    // Z-index context
    /^z-.+/,
    
    // Transform context
    /^transform$/,
    /^transform-gpu$/,
    
    // Opacity (affects all children)
    /^opacity-.+/,
    
    // Filters that affect children
    /^backdrop-.+/,
    
    // Gap for flex/grid children
    /^gap-.+/,
    
    // Justify/align for children positioning
    /^justify-.+/,
    /^items-.+/,
    /^content-.+/,
    
    // Responsive and state modifiers on contextual classes
    /^(sm|md|lg|xl|2xl):(.+)/,
    /^dark:(.+)/,
    /^hover:(.+)/,
    /^focus:(.+)/,
    /^group-.+/,
    /^peer-.+/,
  ];
  
  return contextualPatterns.some(pattern => {
    const match = pattern.exec(className);
    if (match) {
      // For responsive/state modifiers, check if the base class is contextual
      if (match[2]) {
        return isContextualClass(match[2]);
      }
      return true;
    }
    return false;
  });
}; 