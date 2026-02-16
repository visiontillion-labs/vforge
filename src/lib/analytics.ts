import posthog from 'posthog-js';

type FeatureProperties = {
  router?: string;
  language?: string;
  linter?: string;
  srcDir?: boolean;
  tailwind?: boolean;
  shadcn?: boolean;
  auth?: string;
  database?: string;
  api?: string;
  state?: string;
  payment?: string;
  ai?: string;
  monitoring?: string;
  i18n?: string;
  seo?: boolean;
  testing?: boolean;
  docker?: boolean;
  storybook?: boolean;
  theme_radius?: number;
  theme_baseColor?: string;
  theme_primaryColor?: string;
  theme_font?: string;
};

export const analytics = {
  trackGeneration(properties: FeatureProperties) {
    posthog.capture('boilerplate_generated', properties);
    this._plausibleEvent('Generate', properties);
  },

  trackPresetSelected(presetId: string) {
    posthog.capture('preset_selected', { preset: presetId });
    this._plausibleEvent('Preset Selected', { preset: presetId });
  },

  trackFeatureToggled(feature: string, value: string | boolean) {
    posthog.capture('feature_toggled', { feature, value });
  },

  trackShareLinkCreated() {
    posthog.capture('share_link_created');
    this._plausibleEvent('Share');
  },

  trackCommandCopied(commandType: string) {
    posthog.capture('cli_command_copied', { command_type: commandType });
    this._plausibleEvent('Command Copied', { type: commandType });
  },

  trackThemeChanged(property: string, value: string | number) {
    posthog.capture('theme_changed', { property, value });
  },

  _plausibleEvent(name: string, props?: Record<string, unknown>) {
    if (typeof window !== 'undefined' && (window as unknown as Record<string, unknown>).plausible) {
      (window as unknown as { plausible: (name: string, options?: { props: Record<string, unknown> }) => void }).plausible(name, props ? { props } : undefined);
    }
  },
};
