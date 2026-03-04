/**
 * Encode / decode the generator form configuration into a compact,
 * URL-safe string so users can share their setups via a link.
 *
 * Strategy:
 *  1. Diff the current values against the defaults — only store changes.
 *  2. JSON-stringify the diff object.
 *  3. Base64-encode it (URL-safe variant: + → -, / → _, strip padding =).
 *
 * The result is appended to the URL as a query-parameter:
 *   ?config=eyJhIjoiY2x…
 *
 * On page load the param is read, decoded, and merged back on top of defaults.
 */

// ── helpers ──────────────────────────────────────────────────────────

function toBase64Url(str: string): string {
  if (typeof window !== 'undefined') {
    return btoa(unescape(encodeURIComponent(str)))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  }
  return Buffer.from(str, 'utf-8')
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

function fromBase64Url(b64: string): string {
  let s = b64.replace(/-/g, '+').replace(/_/g, '/');
  // re-add padding
  while (s.length % 4) s += '=';
  if (typeof window !== 'undefined') {
    return decodeURIComponent(escape(atob(s)));
  }
  return Buffer.from(s, 'base64').toString('utf-8');
}

// ── Short-key mapping ───────────────────────────────────────────────
// Maps full config keys to 1-2 char abbreviations to shrink the URL.

const KEY_MAP: Record<string, string> = {
  projectName: 'pn',
  router: 'ro',
  language: 'la',
  linter: 'li',
  version: 'vr',
  srcDir: 'sd',
  importAlias: 'ia',
  features: 'f',
  auth: 'au',
  database: 'db',
  api: 'ap',
  state: 'st',
  payment: 'py',
  email: 'em',
  ai: 'ai',
  monitoring: 'mo',
  i18n: 'i1',
  i18nRouting: 'ir',
  languages: 'lg',
  seo: 'se',
  testing: 'te',
};

// Feature sub-keys
const FEATURE_KEY_MAP: Record<string, string> = {
  tailwind: 'tw',
  shadcn: 'sh',
  reactCompiler: 'rc',
  docker: 'dk',
  git: 'gi',
  storybook: 'sb',
};

const REVERSE_KEY_MAP = Object.fromEntries(
  Object.entries(KEY_MAP).map(([k, v]) => [v, k]),
);
const REVERSE_FEATURE_KEY_MAP = Object.fromEntries(
  Object.entries(FEATURE_KEY_MAP).map(([k, v]) => [v, k]),
);

// ── Default values (must mirror generator-form.tsx) ─────────────────

export const DEFAULT_VALUES = {
  projectName: 'my-next-app',
  router: 'app',
  language: 'ts',
  linter: 'eslint',
  version: 'latest',
  srcDir: true,
  importAlias: '@/*',
  features: {
    tailwind: true,
    shadcn: false,
    reactCompiler: false,
    docker: false,
    git: true,
    storybook: false,
  },
  auth: 'none',
  database: 'none',
  api: 'none',
  state: 'none',
  payment: 'none',
  email: 'none',
  ai: 'none',
  monitoring: 'none',
  i18n: 'none',
  i18nRouting: 'prefix',
  languages: 'en',
  seo: false,
  testing: false,
} as const;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyFormValues = Record<string, any>;

// ── Encode ───────────────────────────────────────────────────────────

/**
 * Encode a form configuration into a compact URL-safe string.
 * Only stores values that differ from defaults.
 */
export function encodeConfig(values: AnyFormValues): string {
  const diff: AnyFormValues = {};

  for (const [key, shortKey] of Object.entries(KEY_MAP)) {
    if (key === 'features') {
      // Handle nested features object
      const featureDiff: AnyFormValues = {};
      const currentFeatures = values.features || {};
      const defaultFeatures = DEFAULT_VALUES.features;

      for (const [fKey, fShortKey] of Object.entries(FEATURE_KEY_MAP)) {
        if (
          currentFeatures[fKey] !==
          defaultFeatures[fKey as keyof typeof defaultFeatures]
        ) {
          featureDiff[fShortKey] = currentFeatures[fKey];
        }
      }

      if (Object.keys(featureDiff).length > 0) {
        diff[shortKey] = featureDiff;
      }
    } else {
      const defaultVal = DEFAULT_VALUES[key as keyof typeof DEFAULT_VALUES];
      if (values[key] !== defaultVal) {
        diff[shortKey] = values[key];
      }
    }
  }

  // If nothing changed, return empty string
  if (Object.keys(diff).length === 0) return '';

  return toBase64Url(JSON.stringify(diff));
}

// ── Decode ───────────────────────────────────────────────────────────

/**
 * Decode a config string back into a full form values object
 * by merging the diff on top of the defaults.
 */
export function decodeConfig(encoded: string): AnyFormValues | null {
  if (!encoded) return null;

  try {
    const json = fromBase64Url(encoded);
    const diff: AnyFormValues = JSON.parse(json);

    // Start with a deep clone of defaults
    const result: AnyFormValues = {
      ...DEFAULT_VALUES,
      features: { ...DEFAULT_VALUES.features },
    };

    for (const [shortKey, value] of Object.entries(diff)) {
      const fullKey = REVERSE_KEY_MAP[shortKey];
      if (!fullKey) continue;

      if (fullKey === 'features' && typeof value === 'object') {
        for (const [fShortKey, fValue] of Object.entries(
          value as AnyFormValues,
        )) {
          const fFullKey = REVERSE_FEATURE_KEY_MAP[fShortKey];
          if (fFullKey) {
            result.features[fFullKey] = fValue;
          }
        }
      } else {
        result[fullKey] = value;
      }
    }

    return result;
  } catch (e) {
    console.error('Failed to decode config from URL:', e);
    return null;
  }
}

/**
 * Build a full shareable URL from the current form values.
 */
export function buildShareUrl(values: AnyFormValues): string {
  const encoded = encodeConfig(values);
  if (!encoded) {
    // No changes from default — share the base URL
    return typeof window !== 'undefined'
      ? window.location.origin + window.location.pathname
      : '/';
  }
  const base =
    typeof window !== 'undefined'
      ? window.location.origin + window.location.pathname
      : '/';
  return `${base}?config=${encoded}`;
}

/**
 * Read the config param from the current URL (if any).
 */
export function getConfigFromUrl(): AnyFormValues | null {
  if (typeof window === 'undefined') return null;
  const params = new URLSearchParams(window.location.search);
  const encoded = params.get('config');
  if (!encoded) return null;
  return decodeConfig(encoded);
}
