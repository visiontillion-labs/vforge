#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import { runInteractivePrompts } from './prompts.js';
import { generateProject } from './generator.js';
import { getPreset, presetNames } from './presets.js';

const program = new Command();

program
  .name('create-vforge-app')
  .description('Generate production-ready Next.js boilerplate projects')
  .version('1.0.0')
  .argument('[project-name]', 'Name of the project')
  .option(
    '--preset <name>',
    `Use a preset template (${presetNames.join(', ')})`,
  )
  .option('--router <type>', 'Router type: app or pages')
  .option('--javascript', 'Use JavaScript instead of TypeScript')
  .option(
    '--auth <provider>',
    'Auth provider (authjs, clerk, supabase, firebase, better-auth)',
  )
  .option(
    '--database <orm>',
    'Database ORM (prisma, drizzle, mongoose, firebase)',
  )
  .option('-y, --yes', 'Skip prompts and use defaults')
  .action(async (projectName: string | undefined, options) => {
    console.log('');
    console.log(chalk.bold.cyan('  VForge'));
    console.log(chalk.dim('  Next.js generator by Visiontillion Labs'));
    console.log('');

    try {
      let config;

      if (options.yes) {
        // Use defaults with any provided flags
        config = {
          projectName: projectName || 'my-next-app',
          router: options.router || 'app',
          language: options.javascript ? 'js' : 'ts',
          linter: 'eslint',
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
          auth: options.auth || 'none',
          database: options.database || 'none',
          api: 'none',
          state: 'none',
          payment: 'none',
          ai: 'none',
          monitoring: 'none',
          i18n: 'none',
          seo: false,
          testing: false,
          theme: {
            radius: 0.5,
            baseColor: 'neutral',
            primaryColor: 'default',
            font: 'geist',
            components: ['button', 'card', 'input', 'form', 'dialog'],
          },
        };
      } else if (options.preset) {
        const preset = getPreset(options.preset);
        if (!preset) {
          console.error(
            chalk.red(
              `Unknown preset: ${options.preset}. Available: ${presetNames.join(', ')}`,
            ),
          );
          process.exit(1);
        }
        config = {
          ...preset.values,
          projectName: projectName || preset.values.projectName,
        };
      } else {
        config = await runInteractivePrompts(projectName);
      }

      await generateProject(config);
    } catch (error) {
      if ((error as { name?: string }).name === 'ExitPromptError') {
        console.log(chalk.dim('\n  Cancelled.'));
        process.exit(0);
      }
      console.error(chalk.red('Error:'), error);
      process.exit(1);
    }
  });

program.parse();
