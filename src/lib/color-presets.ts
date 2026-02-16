// ── Radius presets ──────────────────────────────────────────────────
export const radiusOptions = [0, 0.3, 0.5, 0.75, 1.0] as const;
export type RadiusValue = (typeof radiusOptions)[number];

// ── Font presets ────────────────────────────────────────────────────
export const fontOptions = [
  { id: 'inter', label: 'Inter', googleName: 'Inter', variable: '--font-sans' },
  { id: 'geist', label: 'Geist', googleName: 'Geist', variable: '--font-sans' },
  { id: 'plus-jakarta-sans', label: 'Plus Jakarta Sans', googleName: 'Plus_Jakarta_Sans', variable: '--font-sans' },
  { id: 'manrope', label: 'Manrope', googleName: 'Manrope', variable: '--font-sans' },
  { id: 'outfit', label: 'Outfit', googleName: 'Outfit', variable: '--font-sans' },
  { id: 'raleway', label: 'Raleway', googleName: 'Raleway', variable: '--font-sans' },
] as const;
export type FontId = (typeof fontOptions)[number]['id'];

// ── Base color presets (neutral tones for backgrounds, borders, etc.) ──
export type BaseColorId = 'neutral' | 'slate' | 'zinc' | 'gray' | 'stone';

export interface ColorVariables {
  '--background': string;
  '--foreground': string;
  '--card': string;
  '--card-foreground': string;
  '--popover': string;
  '--popover-foreground': string;
  '--primary': string;
  '--primary-foreground': string;
  '--secondary': string;
  '--secondary-foreground': string;
  '--muted': string;
  '--muted-foreground': string;
  '--accent': string;
  '--accent-foreground': string;
  '--destructive': string;
  '--border': string;
  '--input': string;
  '--ring': string;
}

export interface BaseColorPreset {
  id: BaseColorId;
  label: string;
  light: ColorVariables;
  dark: ColorVariables;
}

export const baseColorPresets: BaseColorPreset[] = [
  {
    id: 'neutral',
    label: 'Neutral',
    light: {
      '--background': 'oklch(1 0 0)',
      '--foreground': 'oklch(0.145 0 0)',
      '--card': 'oklch(1 0 0)',
      '--card-foreground': 'oklch(0.145 0 0)',
      '--popover': 'oklch(1 0 0)',
      '--popover-foreground': 'oklch(0.145 0 0)',
      '--primary': 'oklch(0.205 0 0)',
      '--primary-foreground': 'oklch(0.985 0 0)',
      '--secondary': 'oklch(0.97 0 0)',
      '--secondary-foreground': 'oklch(0.205 0 0)',
      '--muted': 'oklch(0.97 0 0)',
      '--muted-foreground': 'oklch(0.556 0 0)',
      '--accent': 'oklch(0.97 0 0)',
      '--accent-foreground': 'oklch(0.205 0 0)',
      '--destructive': 'oklch(0.577 0.245 27.325)',
      '--border': 'oklch(0.922 0 0)',
      '--input': 'oklch(0.922 0 0)',
      '--ring': 'oklch(0.708 0 0)',
    },
    dark: {
      '--background': 'oklch(0.145 0 0)',
      '--foreground': 'oklch(0.985 0 0)',
      '--card': 'oklch(0.205 0 0)',
      '--card-foreground': 'oklch(0.985 0 0)',
      '--popover': 'oklch(0.205 0 0)',
      '--popover-foreground': 'oklch(0.985 0 0)',
      '--primary': 'oklch(0.922 0 0)',
      '--primary-foreground': 'oklch(0.205 0 0)',
      '--secondary': 'oklch(0.269 0 0)',
      '--secondary-foreground': 'oklch(0.985 0 0)',
      '--muted': 'oklch(0.269 0 0)',
      '--muted-foreground': 'oklch(0.708 0 0)',
      '--accent': 'oklch(0.269 0 0)',
      '--accent-foreground': 'oklch(0.985 0 0)',
      '--destructive': 'oklch(0.704 0.191 22.216)',
      '--border': 'oklch(1 0 0 / 10%)',
      '--input': 'oklch(1 0 0 / 15%)',
      '--ring': 'oklch(0.556 0 0)',
    },
  },
  {
    id: 'slate',
    label: 'Slate',
    light: {
      '--background': 'oklch(1 0 0)',
      '--foreground': 'oklch(0.129 0.042 264.695)',
      '--card': 'oklch(1 0 0)',
      '--card-foreground': 'oklch(0.129 0.042 264.695)',
      '--popover': 'oklch(1 0 0)',
      '--popover-foreground': 'oklch(0.129 0.042 264.695)',
      '--primary': 'oklch(0.208 0.042 265.755)',
      '--primary-foreground': 'oklch(0.984 0.003 247.858)',
      '--secondary': 'oklch(0.968 0.007 264.536)',
      '--secondary-foreground': 'oklch(0.208 0.042 265.755)',
      '--muted': 'oklch(0.968 0.007 264.536)',
      '--muted-foreground': 'oklch(0.554 0.046 257.417)',
      '--accent': 'oklch(0.968 0.007 264.536)',
      '--accent-foreground': 'oklch(0.208 0.042 265.755)',
      '--destructive': 'oklch(0.577 0.245 27.325)',
      '--border': 'oklch(0.929 0.013 255.508)',
      '--input': 'oklch(0.929 0.013 255.508)',
      '--ring': 'oklch(0.704 0.04 256.788)',
    },
    dark: {
      '--background': 'oklch(0.129 0.042 264.695)',
      '--foreground': 'oklch(0.984 0.003 247.858)',
      '--card': 'oklch(0.208 0.042 265.755)',
      '--card-foreground': 'oklch(0.984 0.003 247.858)',
      '--popover': 'oklch(0.208 0.042 265.755)',
      '--popover-foreground': 'oklch(0.984 0.003 247.858)',
      '--primary': 'oklch(0.929 0.013 255.508)',
      '--primary-foreground': 'oklch(0.208 0.042 265.755)',
      '--secondary': 'oklch(0.279 0.041 260.031)',
      '--secondary-foreground': 'oklch(0.984 0.003 247.858)',
      '--muted': 'oklch(0.279 0.041 260.031)',
      '--muted-foreground': 'oklch(0.704 0.04 256.788)',
      '--accent': 'oklch(0.279 0.041 260.031)',
      '--accent-foreground': 'oklch(0.984 0.003 247.858)',
      '--destructive': 'oklch(0.704 0.191 22.216)',
      '--border': 'oklch(1 0 0 / 10%)',
      '--input': 'oklch(1 0 0 / 15%)',
      '--ring': 'oklch(0.554 0.046 257.417)',
    },
  },
  {
    id: 'zinc',
    label: 'Zinc',
    light: {
      '--background': 'oklch(1 0 0)',
      '--foreground': 'oklch(0.141 0.005 285.823)',
      '--card': 'oklch(1 0 0)',
      '--card-foreground': 'oklch(0.141 0.005 285.823)',
      '--popover': 'oklch(1 0 0)',
      '--popover-foreground': 'oklch(0.141 0.005 285.823)',
      '--primary': 'oklch(0.21 0.006 285.885)',
      '--primary-foreground': 'oklch(0.985 0.002 247.839)',
      '--secondary': 'oklch(0.967 0.003 264.542)',
      '--secondary-foreground': 'oklch(0.21 0.006 285.885)',
      '--muted': 'oklch(0.967 0.003 264.542)',
      '--muted-foreground': 'oklch(0.553 0.013 272.788)',
      '--accent': 'oklch(0.967 0.003 264.542)',
      '--accent-foreground': 'oklch(0.21 0.006 285.885)',
      '--destructive': 'oklch(0.577 0.245 27.325)',
      '--border': 'oklch(0.92 0.004 264.532)',
      '--input': 'oklch(0.92 0.004 264.532)',
      '--ring': 'oklch(0.705 0.015 286.067)',
    },
    dark: {
      '--background': 'oklch(0.141 0.005 285.823)',
      '--foreground': 'oklch(0.985 0.002 247.839)',
      '--card': 'oklch(0.21 0.006 285.885)',
      '--card-foreground': 'oklch(0.985 0.002 247.839)',
      '--popover': 'oklch(0.21 0.006 285.885)',
      '--popover-foreground': 'oklch(0.985 0.002 247.839)',
      '--primary': 'oklch(0.92 0.004 264.532)',
      '--primary-foreground': 'oklch(0.21 0.006 285.885)',
      '--secondary': 'oklch(0.274 0.006 286.033)',
      '--secondary-foreground': 'oklch(0.985 0.002 247.839)',
      '--muted': 'oklch(0.274 0.006 286.033)',
      '--muted-foreground': 'oklch(0.705 0.015 286.067)',
      '--accent': 'oklch(0.274 0.006 286.033)',
      '--accent-foreground': 'oklch(0.985 0.002 247.839)',
      '--destructive': 'oklch(0.704 0.191 22.216)',
      '--border': 'oklch(1 0 0 / 10%)',
      '--input': 'oklch(1 0 0 / 15%)',
      '--ring': 'oklch(0.553 0.013 272.788)',
    },
  },
  {
    id: 'gray',
    label: 'Gray',
    light: {
      '--background': 'oklch(1 0 0)',
      '--foreground': 'oklch(0.13 0.028 261.692)',
      '--card': 'oklch(1 0 0)',
      '--card-foreground': 'oklch(0.13 0.028 261.692)',
      '--popover': 'oklch(1 0 0)',
      '--popover-foreground': 'oklch(0.13 0.028 261.692)',
      '--primary': 'oklch(0.21 0.034 264.665)',
      '--primary-foreground': 'oklch(0.985 0.002 247.839)',
      '--secondary': 'oklch(0.968 0.007 264.536)',
      '--secondary-foreground': 'oklch(0.21 0.034 264.665)',
      '--muted': 'oklch(0.968 0.007 264.536)',
      '--muted-foreground': 'oklch(0.553 0.032 257.184)',
      '--accent': 'oklch(0.968 0.007 264.536)',
      '--accent-foreground': 'oklch(0.21 0.034 264.665)',
      '--destructive': 'oklch(0.577 0.245 27.325)',
      '--border': 'oklch(0.928 0.006 264.531)',
      '--input': 'oklch(0.928 0.006 264.531)',
      '--ring': 'oklch(0.707 0.022 261.325)',
    },
    dark: {
      '--background': 'oklch(0.13 0.028 261.692)',
      '--foreground': 'oklch(0.985 0.002 247.839)',
      '--card': 'oklch(0.21 0.034 264.665)',
      '--card-foreground': 'oklch(0.985 0.002 247.839)',
      '--popover': 'oklch(0.21 0.034 264.665)',
      '--popover-foreground': 'oklch(0.985 0.002 247.839)',
      '--primary': 'oklch(0.928 0.006 264.531)',
      '--primary-foreground': 'oklch(0.21 0.034 264.665)',
      '--secondary': 'oklch(0.278 0.033 256.848)',
      '--secondary-foreground': 'oklch(0.985 0.002 247.839)',
      '--muted': 'oklch(0.278 0.033 256.848)',
      '--muted-foreground': 'oklch(0.707 0.022 261.325)',
      '--accent': 'oklch(0.278 0.033 256.848)',
      '--accent-foreground': 'oklch(0.985 0.002 247.839)',
      '--destructive': 'oklch(0.704 0.191 22.216)',
      '--border': 'oklch(1 0 0 / 10%)',
      '--input': 'oklch(1 0 0 / 15%)',
      '--ring': 'oklch(0.553 0.032 257.184)',
    },
  },
  {
    id: 'stone',
    label: 'Stone',
    light: {
      '--background': 'oklch(1 0 0)',
      '--foreground': 'oklch(0.147 0.004 49.25)',
      '--card': 'oklch(1 0 0)',
      '--card-foreground': 'oklch(0.147 0.004 49.25)',
      '--popover': 'oklch(1 0 0)',
      '--popover-foreground': 'oklch(0.147 0.004 49.25)',
      '--primary': 'oklch(0.216 0.006 56.043)',
      '--primary-foreground': 'oklch(0.985 0.001 106.423)',
      '--secondary': 'oklch(0.97 0.001 106.424)',
      '--secondary-foreground': 'oklch(0.216 0.006 56.043)',
      '--muted': 'oklch(0.97 0.001 106.424)',
      '--muted-foreground': 'oklch(0.553 0.013 58.071)',
      '--accent': 'oklch(0.97 0.001 106.424)',
      '--accent-foreground': 'oklch(0.216 0.006 56.043)',
      '--destructive': 'oklch(0.577 0.245 27.325)',
      '--border': 'oklch(0.923 0.003 48.717)',
      '--input': 'oklch(0.923 0.003 48.717)',
      '--ring': 'oklch(0.709 0.01 56.259)',
    },
    dark: {
      '--background': 'oklch(0.147 0.004 49.25)',
      '--foreground': 'oklch(0.985 0.001 106.423)',
      '--card': 'oklch(0.216 0.006 56.043)',
      '--card-foreground': 'oklch(0.985 0.001 106.423)',
      '--popover': 'oklch(0.216 0.006 56.043)',
      '--popover-foreground': 'oklch(0.985 0.001 106.423)',
      '--primary': 'oklch(0.923 0.003 48.717)',
      '--primary-foreground': 'oklch(0.216 0.006 56.043)',
      '--secondary': 'oklch(0.268 0.007 34.298)',
      '--secondary-foreground': 'oklch(0.985 0.001 106.423)',
      '--muted': 'oklch(0.268 0.007 34.298)',
      '--muted-foreground': 'oklch(0.709 0.01 56.259)',
      '--accent': 'oklch(0.268 0.007 34.298)',
      '--accent-foreground': 'oklch(0.985 0.001 106.423)',
      '--destructive': 'oklch(0.704 0.191 22.216)',
      '--border': 'oklch(1 0 0 / 10%)',
      '--input': 'oklch(1 0 0 / 15%)',
      '--ring': 'oklch(0.553 0.013 58.071)',
    },
  },
];

// ── Primary/Accent color presets ────────────────────────────────────
export type PrimaryColorId =
  | 'default'
  | 'red'
  | 'orange'
  | 'amber'
  | 'yellow'
  | 'green'
  | 'emerald'
  | 'blue'
  | 'violet'
  | 'purple'
  | 'pink'
  | 'rose';

export interface PrimaryColorPreset {
  id: PrimaryColorId;
  label: string;
  swatch: string; // CSS color for the UI swatch
  light: {
    '--primary': string;
    '--primary-foreground': string;
    '--ring': string;
  };
  dark: {
    '--primary': string;
    '--primary-foreground': string;
    '--ring': string;
  };
}

export const primaryColorPresets: PrimaryColorPreset[] = [
  {
    id: 'default',
    label: 'Default',
    swatch: '#171717',
    light: {
      '--primary': 'oklch(0.205 0 0)',
      '--primary-foreground': 'oklch(0.985 0 0)',
      '--ring': 'oklch(0.708 0 0)',
    },
    dark: {
      '--primary': 'oklch(0.922 0 0)',
      '--primary-foreground': 'oklch(0.205 0 0)',
      '--ring': 'oklch(0.556 0 0)',
    },
  },
  {
    id: 'red',
    label: 'Red',
    swatch: '#ef4444',
    light: {
      '--primary': 'oklch(0.577 0.245 27.325)',
      '--primary-foreground': 'oklch(0.985 0 0)',
      '--ring': 'oklch(0.577 0.245 27.325)',
    },
    dark: {
      '--primary': 'oklch(0.704 0.191 22.216)',
      '--primary-foreground': 'oklch(0.985 0 0)',
      '--ring': 'oklch(0.704 0.191 22.216)',
    },
  },
  {
    id: 'orange',
    label: 'Orange',
    swatch: '#f97316',
    light: {
      '--primary': 'oklch(0.705 0.213 47.604)',
      '--primary-foreground': 'oklch(0.985 0 0)',
      '--ring': 'oklch(0.705 0.213 47.604)',
    },
    dark: {
      '--primary': 'oklch(0.705 0.213 47.604)',
      '--primary-foreground': 'oklch(0.985 0 0)',
      '--ring': 'oklch(0.705 0.213 47.604)',
    },
  },
  {
    id: 'amber',
    label: 'Amber',
    swatch: '#f59e0b',
    light: {
      '--primary': 'oklch(0.769 0.188 70.08)',
      '--primary-foreground': 'oklch(0.205 0 0)',
      '--ring': 'oklch(0.769 0.188 70.08)',
    },
    dark: {
      '--primary': 'oklch(0.769 0.188 70.08)',
      '--primary-foreground': 'oklch(0.205 0 0)',
      '--ring': 'oklch(0.769 0.188 70.08)',
    },
  },
  {
    id: 'yellow',
    label: 'Yellow',
    swatch: '#eab308',
    light: {
      '--primary': 'oklch(0.828 0.189 84.429)',
      '--primary-foreground': 'oklch(0.205 0 0)',
      '--ring': 'oklch(0.828 0.189 84.429)',
    },
    dark: {
      '--primary': 'oklch(0.828 0.189 84.429)',
      '--primary-foreground': 'oklch(0.205 0 0)',
      '--ring': 'oklch(0.828 0.189 84.429)',
    },
  },
  {
    id: 'green',
    label: 'Green',
    swatch: '#22c55e',
    light: {
      '--primary': 'oklch(0.723 0.219 149.579)',
      '--primary-foreground': 'oklch(0.985 0 0)',
      '--ring': 'oklch(0.723 0.219 149.579)',
    },
    dark: {
      '--primary': 'oklch(0.723 0.219 149.579)',
      '--primary-foreground': 'oklch(0.985 0 0)',
      '--ring': 'oklch(0.723 0.219 149.579)',
    },
  },
  {
    id: 'emerald',
    label: 'Emerald',
    swatch: '#10b981',
    light: {
      '--primary': 'oklch(0.696 0.17 162.48)',
      '--primary-foreground': 'oklch(0.985 0 0)',
      '--ring': 'oklch(0.696 0.17 162.48)',
    },
    dark: {
      '--primary': 'oklch(0.696 0.17 162.48)',
      '--primary-foreground': 'oklch(0.985 0 0)',
      '--ring': 'oklch(0.696 0.17 162.48)',
    },
  },
  {
    id: 'blue',
    label: 'Blue',
    swatch: '#3b82f6',
    light: {
      '--primary': 'oklch(0.623 0.214 259.815)',
      '--primary-foreground': 'oklch(0.985 0 0)',
      '--ring': 'oklch(0.623 0.214 259.815)',
    },
    dark: {
      '--primary': 'oklch(0.623 0.214 259.815)',
      '--primary-foreground': 'oklch(0.985 0 0)',
      '--ring': 'oklch(0.623 0.214 259.815)',
    },
  },
  {
    id: 'violet',
    label: 'Violet',
    swatch: '#8b5cf6',
    light: {
      '--primary': 'oklch(0.606 0.25 292.717)',
      '--primary-foreground': 'oklch(0.985 0 0)',
      '--ring': 'oklch(0.606 0.25 292.717)',
    },
    dark: {
      '--primary': 'oklch(0.606 0.25 292.717)',
      '--primary-foreground': 'oklch(0.985 0 0)',
      '--ring': 'oklch(0.606 0.25 292.717)',
    },
  },
  {
    id: 'purple',
    label: 'Purple',
    swatch: '#a855f7',
    light: {
      '--primary': 'oklch(0.627 0.265 303.9)',
      '--primary-foreground': 'oklch(0.985 0 0)',
      '--ring': 'oklch(0.627 0.265 303.9)',
    },
    dark: {
      '--primary': 'oklch(0.627 0.265 303.9)',
      '--primary-foreground': 'oklch(0.985 0 0)',
      '--ring': 'oklch(0.627 0.265 303.9)',
    },
  },
  {
    id: 'pink',
    label: 'Pink',
    swatch: '#ec4899',
    light: {
      '--primary': 'oklch(0.656 0.241 354.308)',
      '--primary-foreground': 'oklch(0.985 0 0)',
      '--ring': 'oklch(0.656 0.241 354.308)',
    },
    dark: {
      '--primary': 'oklch(0.656 0.241 354.308)',
      '--primary-foreground': 'oklch(0.985 0 0)',
      '--ring': 'oklch(0.656 0.241 354.308)',
    },
  },
  {
    id: 'rose',
    label: 'Rose',
    swatch: '#f43f5e',
    light: {
      '--primary': 'oklch(0.645 0.246 16.439)',
      '--primary-foreground': 'oklch(0.985 0 0)',
      '--ring': 'oklch(0.645 0.246 16.439)',
    },
    dark: {
      '--primary': 'oklch(0.645 0.246 16.439)',
      '--primary-foreground': 'oklch(0.985 0 0)',
      '--ring': 'oklch(0.645 0.246 16.439)',
    },
  },
];

// ── shadcn component categories ─────────────────────────────────────
export interface ShadcnComponent {
  id: string;
  label: string;
  category: string;
}

export const shadcnComponentCategories = [
  'Form',
  'Layout',
  'Overlay',
  'Navigation',
  'Data Display',
  'Feedback',
] as const;

export const shadcnComponents: ShadcnComponent[] = [
  // Form
  { id: 'button', label: 'Button', category: 'Form' },
  { id: 'input', label: 'Input', category: 'Form' },
  { id: 'textarea', label: 'Textarea', category: 'Form' },
  { id: 'select', label: 'Select', category: 'Form' },
  { id: 'checkbox', label: 'Checkbox', category: 'Form' },
  { id: 'radio-group', label: 'Radio Group', category: 'Form' },
  { id: 'switch', label: 'Switch', category: 'Form' },
  { id: 'slider', label: 'Slider', category: 'Form' },
  { id: 'form', label: 'Form', category: 'Form' },
  { id: 'date-picker', label: 'Date Picker', category: 'Form' },
  { id: 'combobox', label: 'Combobox', category: 'Form' },
  { id: 'input-otp', label: 'Input OTP', category: 'Form' },
  // Layout
  { id: 'card', label: 'Card', category: 'Layout' },
  { id: 'separator', label: 'Separator', category: 'Layout' },
  { id: 'tabs', label: 'Tabs', category: 'Layout' },
  { id: 'accordion', label: 'Accordion', category: 'Layout' },
  { id: 'scroll-area', label: 'Scroll Area', category: 'Layout' },
  { id: 'resizable', label: 'Resizable', category: 'Layout' },
  { id: 'aspect-ratio', label: 'Aspect Ratio', category: 'Layout' },
  { id: 'collapsible', label: 'Collapsible', category: 'Layout' },
  // Overlay
  { id: 'dialog', label: 'Dialog', category: 'Overlay' },
  { id: 'alert-dialog', label: 'Alert Dialog', category: 'Overlay' },
  { id: 'popover', label: 'Popover', category: 'Overlay' },
  { id: 'tooltip', label: 'Tooltip', category: 'Overlay' },
  { id: 'hover-card', label: 'Hover Card', category: 'Overlay' },
  { id: 'sheet', label: 'Sheet', category: 'Overlay' },
  { id: 'drawer', label: 'Drawer', category: 'Overlay' },
  { id: 'dropdown-menu', label: 'Dropdown Menu', category: 'Overlay' },
  { id: 'context-menu', label: 'Context Menu', category: 'Overlay' },
  // Navigation
  { id: 'navigation-menu', label: 'Navigation Menu', category: 'Navigation' },
  { id: 'menubar', label: 'Menubar', category: 'Navigation' },
  { id: 'breadcrumb', label: 'Breadcrumb', category: 'Navigation' },
  { id: 'pagination', label: 'Pagination', category: 'Navigation' },
  { id: 'command', label: 'Command', category: 'Navigation' },
  // Data Display
  { id: 'table', label: 'Table', category: 'Data Display' },
  { id: 'badge', label: 'Badge', category: 'Data Display' },
  { id: 'avatar', label: 'Avatar', category: 'Data Display' },
  { id: 'skeleton', label: 'Skeleton', category: 'Data Display' },
  { id: 'carousel', label: 'Carousel', category: 'Data Display' },
  { id: 'chart', label: 'Chart', category: 'Data Display' },
  // Feedback
  { id: 'alert', label: 'Alert', category: 'Feedback' },
  { id: 'sonner', label: 'Toast (Sonner)', category: 'Feedback' },
  { id: 'progress', label: 'Progress', category: 'Feedback' },
  { id: 'toggle', label: 'Toggle', category: 'Feedback' },
  { id: 'toggle-group', label: 'Toggle Group', category: 'Feedback' },
];

// ── Helper to generate full CSS from selections ─────────────────────
export function generateThemeCSS(options: {
  radius: number;
  baseColor: BaseColorId;
  primaryColor: PrimaryColorId;
}): { light: Record<string, string>; dark: Record<string, string>; radius: string } {
  const base = baseColorPresets.find((b) => b.id === options.baseColor) ?? baseColorPresets[0];
  const primary = primaryColorPresets.find((p) => p.id === options.primaryColor);

  const light = { ...base.light };
  const dark = { ...base.dark };

  if (primary && primary.id !== 'default') {
    Object.assign(light, primary.light);
    Object.assign(dark, primary.dark);
  }

  return {
    light,
    dark,
    radius: `${options.radius}rem`,
  };
}
