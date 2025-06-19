# telltale (beta)

<div align="center">
  <img src="https://raw.githubusercontent.com/joellanciaux/telltale/master/media/logo.png" alt="Telltale" width="auto" height="200" />
  <p align="center">
    <b>Pack your tailwind + css usage into AI-friendly formats</b>
  </p>
</div>

## Installation

```
pnpm install -D @joellanciaux/telltale
```

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

## Example Output
```
# Tailwind Component Analysis

Generated: 2025-06-19T18:22:57.028Z

<file_summary>
This file contains a comprehensive analysis of Tailwind CSS usage across React components.

<purpose>
This analysis maps the relationship between React components and their Tailwind CSS classes,
including contextual influences where parent components affect child styling through layout,
positioning, or inherited properties. It enables understanding of styling dependencies,
potential conflicts, and component styling hierarchies for refactoring and optimization.
</purpose>

<file_format>
Each component entry contains:
- Component name and file path
- "Influences" section: Groups child components by the contextual classes that affect them
- "Classes" section: All Tailwind classes directly applied to this component
- "CSS Props/Vars" sections: Custom CSS properties and variables (when present)

Influence format: "contextual-classes": ComponentA, ComponentB, ComponentC
- Components under same influence inherit layout/styling context from parent
- "None" indicates components with no contextual styling influence
</file_format>

<usage_guidelines>
- Use this for identifying styling dependencies before component refactoring
- Look for "Influences" to understand parent-child styling relationships
- Components with many influences may be tightly coupled to their parent context
- Large "Classes" sections may indicate components needing style extraction
- "None" influences suggest components that are more portable/reusable
</usage_guidelines>

<notes>
- Only components with Tailwind classes or styling influences are included
- Contextual classes: layout (flex/grid), positioning, backgrounds, inherited text styles
- Analysis based on static code parsing - dynamic class application may not be captured
- File paths are relative to project root
- Components sorted by Tailwind class count (most styled first)
</notes>

</file_summary>

## select
Path: src/components/ui/select.tsx
Classes: border-input data-[placeholder]:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 dark:hover:bg-input/50 flex w-fit items-center justify-between gap-2 rounded-md border bg-transparent px-3 py-2 text-sm whitespace-nowrap shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 data-[size=default]:h-9 data-[size=sm]:h-8 size-4 opacity-50 bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 relative z-50 max-h-(--radix-select-content-available-height) min-w-[8rem] origin-(--radix-select-content-transform-origin) overflow-x-hidden overflow-y-auto shadow-md data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1 p-1 h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)] scroll-my-1 text-muted-foreground px-2 py-1.5 text-xs focus:bg-accent focus:text-accent-foreground cursor-default rounded-sm pr-8 pl-2 outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 absolute right-2 justify-center bg-border pointer-events-none my-1 h-px py-1

## dropdown-menu
Path: src/components/ui/dropdown-menu.tsx
Classes: bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 max-h-(--radix-dropdown-menu-content-available-height) min-w-[8rem] origin-(--radix-dropdown-menu-content-transform-origin) overflow-x-hidden overflow-y-auto rounded-md border p-1 shadow-md focus:bg-accent focus:text-accent-foreground data-[variant=destructive]:text-destructive data-[variant=destructive]:focus:bg-destructive/10 dark:data-[variant=destructive]:focus:bg-destructive/20 data-[variant=destructive]:focus:text-destructive data-[variant=destructive]:*:[svg]:!text-destructive relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[inset]:pl-8 pr-2 pl-8 pointer-events-none absolute left-2 justify-center size-4 size-2 fill-current font-medium bg-border my-1 h-px text-muted-foreground ml-auto text-xs tracking-widest data-[state=open]:bg-accent data-[state=open]:text-accent-foreground overflow-hidden shadow-lg

## schedule
Path: src/routes/organization/schedule.tsx
Influences:
- "container": Card, CardContent, CardFooter, CardHeader, ScheduleReorderComponent, ScheduleTimelineView, Toaster
- "container flex flex-row justify-between items-center": CardDescription, CardTitle
- "container flex flex-row justify-between items-center justify-end": Button
- "container flex justify-between items-center grid grid-cols-2 gap-4": Label
- "container grid grid-cols-2 gap-4": Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue
- None: button, card, input, label, select, sonner
Classes: flex justify-center items-center min-h-[50vh] text-center container max-w-2xl py-10 text-2xl font-bold mb-6 mb-8 flex-row justify-between space-y-6 pt-6 text-xs text-gray-500 dark:text-gray-400 mt-0.5 mb-1.5 text-sm mt-1 mb-2 space-y-2 border rounded-md p-4 bg-gray-50 dark:bg-gray-800/30 p-2 border-b last:border-b-0 font-medium ml-2 mt-4 grid grid-cols-2 gap-4 block text-gray-700 mb-1 space-x-2 h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 font-normal text-md font-semibold space-y-1 justify-end mt-8 p-0 border-t

## tabs
Path: src/components/ui/tabs.tsx
Classes: flex flex-col gap-2 bg-muted text-muted-foreground inline-flex h-9 w-fit items-center justify-center rounded-lg p-[3px] data-[state=active]:bg-background dark:data-[state=active]:text-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:outline-ring dark:data-[state=active]:border-input dark:data-[state=active]:bg-input/30 text-foreground dark:text-muted-foreground h-[calc(100%-1px)] flex-1 gap-1.5 rounded-md border border-transparent px-2 py-1 text-sm font-medium whitespace-nowrap transition-[color,box-shadow] focus-visible:ring-[3px] focus-visible:outline-1 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:shadow-sm outline-none

## ScheduleTimelineView
Path: src/components/organization/ScheduleTimelineView.tsx
Classes: text-red-500 mt-8 border rounded-lg overflow-hidden text-lg font-semibold p-4 bg-gray-50 dark:bg-gray-800 border-b overflow-x-auto min-w-max grid grid-cols-7 bg-gray-100 dark:bg-gray-700 text-center p-2 border-r last:border-r-0 font-medium text-sm relative h-12 absolute text-white text-xs p-1 rounded shadow-sm whitespace-nowrap flex items-center justify-center truncate
CSS Props: left, width, top, bottom

## input
Path: src/components/ui/input.tsx
Classes: file:text-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive

## ScheduleReorderComponent
Path: src/components/organization/ScheduleReorderComponent.tsx
Influences:
- "flex items-center gap-2 bg-white dark:bg-gray-900 bg-gray-100 dark:bg-gray-800 z-10 overflow-y-auto justify-between": Button
- None: button
Classes: flex items-center gap-2 p-2 border rounded-md bg-white dark:bg-gray-900 bg-gray-100 dark:bg-gray-800 touch-none shadow-xl z-10 cursor-grab flex-1 pl-2 space-y-2 mt-4 pt-4 border-t text-sm font-medium mb-2 text-gray-500 max-h-40 overflow-y-auto justify-between

## config
Path: src/routes/organization/config.tsx
Influences:
- "container": Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Toaster
- None: button, card, sonner
Classes: flex justify-center items-center min-h-[50vh] text-center container max-w-2xl py-10 text-red-600 text-2xl font-bold mb-6 space-x-2 justify-between p-4 bg-green-50 dark:bg-green-900/30 rounded-md border border-green-200 dark:border-green-800 text-sm font-medium text-green-800 dark:text-green-200 text-muted-foreground mt-2

## card
Path: src/components/ui/card.tsx
Classes: bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-6 shadow-sm grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] leading-none font-semibold text-muted-foreground text-sm col-start-2 row-span-2 row-start-1 self-start justify-self-end items-center

## textarea
Path: src/components/ui/textarea.tsx
Classes: border-input focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 flex field-sizing-content min-h-16 w-full rounded-md border bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm

## __root
Path: src/routes/__root.tsx
Influences:
- "flex flex-col bg-background items-center justify-between gap-4": Button, DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuTrigger
- "flex flex-col": Toaster
- None: button, dropdown-menu, sonner
Classes: min-h-screen flex flex-col p-4 border-b bg-background items-center justify-between font-bold text-lg gap-4 text-sm text-muted-foreground ml-2 mr-2 h-4 w-4 hover:underline flex-grow border-t text-center text-xs

## index
Path: src/routes/index.tsx
Influences:
- "container": Card, CardContent, CardHeader, CardTitle, ScheduleTimelineView, Toaster
- "container flex justify-between items-center": Button
- None: button, card, sonner
Classes: text-lg text-red-600 font-semibold text-sm text-gray-500 dark:text-gray-400 container max-w-4xl py-10 flex justify-between items-center mb-6 text-2xl font-bold mt-8 mt-4 p-0

## manage
Path: src/routes/organization/manage.tsx
Influences:
- "container": Card, CardContent, CardDescription, CardHeader, CardTitle, Tabs, TabsContent, TabsList, Toaster
- "container grid grid-cols-1": TabsTrigger
- "container flex justify-center": Button
- None: button, card, sonner, tabs
Classes: container py-10 flex justify-center items-center w-full grid grid-cols-1 mb-6 p-6 text-lg font-semibold mb-2 font-medium mt-6 text-gray-500 dark:text-gray-400 mt-8

## login
Path: src/routes/login.tsx
Influences:
- "flex items-center justify-center bg-gray-100 dark:bg-gray-900": Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle, Toaster
- "flex items-center justify-center bg-gray-100 dark:bg-gray-900 grid gap-4 gap-2": Input, Label
- "flex items-center justify-center bg-gray-100 dark:bg-gray-900 flex-col gap-4": Button
- None: button, card, input, label, sonner
Classes: flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 w-full max-w-sm text-2xl grid gap-4 gap-2 text-sm text-red-600 text-center flex-col underline

## onboard
Path: src/routes/onboard.tsx
Influences:
- "container": Button, Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle, Tabs, TabsContent, TabsList, Toaster
- "container grid grid-cols-2": TabsTrigger
- "container grid gap-4": Input, Label
- None: button, card, input, label, sonner, tabs
Classes: container max-w-md py-10 text-2xl font-bold text-center mb-6 mb-8 w-full grid grid-cols-2 mt-0 p-6 gap-4

## label
Path: src/components/ui/label.tsx
Classes: flex items-center gap-2 text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50

## signup
Path: src/routes/signup.tsx
Influences:
- "flex items-center justify-center bg-gray-100 dark:bg-gray-900": Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Form, FormField, Toaster
- None: button, card, form, input, sonner
Classes: flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 w-full max-w-sm text-2xl space-y-4

## form
Path: src/components/ui/form.tsx
Influences:
- None: label
Classes: grid gap-2 data-[error=true]:text-destructive text-muted-foreground text-sm text-destructive

## skeleton
Path: src/components/ui/skeleton.tsx
Classes: bg-accent animate-pulse rounded-md

## sonner
Path: src/components/ui/sonner.tsx
Classes: toaster group
CSS Props: --normal-bg, --normal-text, --normal-border
CSS Vars: --popover, --popover-foreground, --border, --normal-bg, --normal-text, --normal-border

## about
Path: src/routes/about.tsx
Classes: p-2

## main
Path: src/main.tsx
Influences:
- None: index.css, routeTree.gen

## routeTree.gen
Path: src/routeTree.gen.ts
Influences:
- None: __root, about, config, index, login, manage, onboard, routes, schedule, signup
```

## Prior Art

This project was inspired by [Repomix](https://github.com/yamadashy/repomix)