import { track } from '@vercel/analytics/server';
import type { NextRequest } from 'next/server';

type GenerationEventName =
  | 'boilerplate_generation_requested'
  | 'boilerplate_generation_succeeded'
  | 'boilerplate_generation_failed';

type GenerationAnalyticsProperties = Record<string, string | number | boolean>;

function getRequestSource(req: NextRequest) {
  return req.headers.get('x-vforge-source') === 'cli' ? 'cli' : 'web';
}

export function getGenerationAnalyticsProperties(
  body: Record<string, unknown>,
  req: NextRequest,
): GenerationAnalyticsProperties {
  const features = (body.features ?? {}) as Record<string, unknown>;
  const theme = (body.theme ?? {}) as Record<string, unknown>;
  const languagesRaw = typeof body.languages === 'string' ? body.languages : 'en';
  const locales = languagesRaw
    .split(',')
    .map((locale) => locale.trim())
    .filter(Boolean);

  return {
    source: getRequestSource(req),
    router: String(body.router || 'unknown'),
    language: String(body.language || 'unknown'),
    linter: String(body.linter || 'unknown'),
    auth: String(body.auth || 'none'),
    database: String(body.database || 'none'),
    api: String(body.api || 'none'),
    state: String(body.state || 'none'),
    payment: String(body.payment || 'none'),
    ai: String(body.ai || 'none'),
    monitoring: String(body.monitoring || 'none'),
    i18n: String(body.i18n || 'none'),
    i18nRouting: String(body.i18nRouting || 'none'),
    srcDir: Boolean(body.srcDir),
    seo: Boolean(body.seo),
    testing: Boolean(body.testing),
    tailwind: Boolean(features.tailwind),
    shadcn: Boolean(features.shadcn),
    docker: Boolean(features.docker),
    storybook: Boolean(features.storybook),
    git: Boolean(features.git),
    localeCount: locales.length || 1,
    themeRadius: Number(theme.radius ?? 0.5),
    themeBaseColor: String(theme.baseColor || 'neutral'),
    themePrimaryColor: String(theme.primaryColor || 'default'),
    themeFont: String(theme.font || 'default'),
  };
}

export async function trackGenerationEvent(
  _req: NextRequest,
  event: GenerationEventName,
  properties: GenerationAnalyticsProperties,
) {
  try {
    await track(event, properties);
  } catch {
    // Analytics failures should never break generation.
  }
}
