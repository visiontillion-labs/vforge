'use client';

import { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Check, Paintbrush, RotateCcw } from 'lucide-react';
import {
  baseColorPresets,
  primaryColorPresets,
  radiusOptions,
  type BaseColorId,
  type PrimaryColorId,
  type RadiusValue,
} from '@/lib/color-presets';
import { analytics } from '@/lib/analytics';
import { cn } from '@/lib/utils';

interface ThemeState {
  radius: RadiusValue;
  baseColor: BaseColorId;
  primaryColor: PrimaryColorId;
}

const defaultTheme: ThemeState = {
  radius: 0.5,
  baseColor: 'neutral',
  primaryColor: 'default',
};

function applyThemeToDOM(theme: ThemeState) {
  const root = document.documentElement;

  // Apply radius
  root.style.setProperty('--radius', `${theme.radius}rem`);

  // Apply base color (light mode)
  const base = baseColorPresets.find((b) => b.id === theme.baseColor);
  if (base) {
    for (const [key, value] of Object.entries(base.light)) {
      root.style.setProperty(key, value);
    }
  }

  // Apply primary color overrides
  const primary = primaryColorPresets.find((p) => p.id === theme.primaryColor);
  if (primary && primary.id !== 'default') {
    for (const [key, value] of Object.entries(primary.light)) {
      root.style.setProperty(key, value);
    }
  } else if (primary?.id === 'default' && base) {
    // Restore base primary colors
    root.style.setProperty('--primary', base.light['--primary']);
    root.style.setProperty('--primary-foreground', base.light['--primary-foreground']);
    root.style.setProperty('--ring', base.light['--ring']);
  }
}

export function ThemeCustomizer() {
  const [theme, setTheme] = useState<ThemeState>(defaultTheme);

  useEffect(() => {
    applyThemeToDOM(theme);
  }, [theme]);

  const updateTheme = useCallback(
    (key: keyof ThemeState, value: ThemeState[keyof ThemeState]) => {
      setTheme((prev) => ({ ...prev, [key]: value }));
      analytics.trackThemeChanged(key, value as string | number);
    },
    [],
  );

  const resetTheme = useCallback(() => {
    setTheme(defaultTheme);
  }, []);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant='outline' size='sm' className='gap-2'>
          <Paintbrush className='size-4' />
          Customize
        </Button>
      </PopoverTrigger>
      <PopoverContent className='w-[340px]' align='end'>
        <div className='space-y-6'>
          <div className='flex items-center justify-between'>
            <div>
              <h4 className='font-medium leading-none'>Theme</h4>
              <p className='text-xs text-muted-foreground mt-1'>
                Customize the look and feel.
              </p>
            </div>
            <Button
              variant='ghost'
              size='icon'
              className='size-8'
              onClick={resetTheme}
            >
              <RotateCcw className='size-3.5' />
            </Button>
          </div>

          {/* Radius */}
          <div className='space-y-2'>
            <Label className='text-xs'>Radius</Label>
            <div className='flex gap-2'>
              {radiusOptions.map((r) => (
                <button
                  key={r}
                  onClick={() => updateTheme('radius', r)}
                  className={cn(
                    'flex h-10 w-10 items-center justify-center border-2 text-xs font-medium transition-colors',
                    theme.radius === r
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border bg-background hover:border-primary/50',
                  )}
                  style={{ borderRadius: `${r * 0.5}rem` }}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* Base Color */}
          <div className='space-y-2'>
            <Label className='text-xs'>Base Color</Label>
            <div className='flex gap-2'>
              {baseColorPresets.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => updateTheme('baseColor', preset.id)}
                  className={cn(
                    'flex h-8 flex-1 items-center justify-center rounded-md border text-xs font-medium transition-colors',
                    theme.baseColor === preset.id
                      ? 'border-primary ring-2 ring-primary/20'
                      : 'border-border hover:border-primary/50',
                  )}
                  style={{
                    backgroundColor: preset.light['--background'],
                    color: preset.light['--foreground'],
                  }}
                >
                  {theme.baseColor === preset.id && (
                    <Check className='size-3 mr-1' />
                  )}
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Primary Color */}
          <div className='space-y-2'>
            <Label className='text-xs'>Primary Color</Label>
            <div className='grid grid-cols-6 gap-2'>
              {primaryColorPresets.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => updateTheme('primaryColor', preset.id)}
                  className={cn(
                    'flex h-8 w-full items-center justify-center rounded-md border transition-all',
                    theme.primaryColor === preset.id
                      ? 'ring-2 ring-offset-2 ring-offset-background scale-110'
                      : 'hover:scale-105',
                  )}
                  style={{
                    backgroundColor: preset.swatch,
                    borderColor:
                      theme.primaryColor === preset.id
                        ? preset.swatch
                        : 'transparent',
                  }}
                  title={preset.label}
                >
                  {theme.primaryColor === preset.id && (
                    <Check className='size-3 text-white' />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
