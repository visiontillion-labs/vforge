import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';
import ora from 'ora';
import { type ProjectConfig } from './presets.js';

const API_URL =
  process.env.VFORGE_API_URL ||
  process.env.FORGE_API_URL ||
  'https://vforge.vercel.app';

export async function generateProject(config: ProjectConfig): Promise<void> {
  const targetDir = path.resolve(process.cwd(), config.projectName);

  // Check if directory already exists
  if (fs.existsSync(targetDir)) {
    const files = fs.readdirSync(targetDir);
    if (files.length > 0) {
      console.error(
        chalk.red(
          `\n  Directory "${config.projectName}" already exists and is not empty.`,
        ),
      );
      process.exit(1);
    }
  }

  const spinner = ora({
    text: 'Generating your Next.js project...',
    color: 'cyan',
  }).start();

  try {
    // Try to use the API first
    const response = await fetch(`${API_URL}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config),
    });

    if (!response.ok) {
      throw new Error(`API responded with status ${response.status}`);
    }

    spinner.text = 'Extracting project files...';

    // Get the ZIP as a buffer
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Write the ZIP temporarily
    const zipPath = path.join(process.cwd(), `${config.projectName}.zip`);
    fs.writeFileSync(zipPath, buffer);

    // Extract using built-in unzip or a simple extraction
    // Since we don't want heavy deps, write the ZIP and let the user know
    // Actually, let's use a simple approach: save and extract
    await extractZip(zipPath, targetDir);

    // Clean up temp zip
    fs.removeSync(zipPath);

    spinner.succeed(chalk.green('Project generated successfully!'));

    // Print next steps
    console.log('');
    console.log(chalk.bold('  Next steps:'));
    console.log('');
    console.log(chalk.cyan(`    cd ${config.projectName}`));
    console.log(chalk.cyan('    npm install'));
    console.log(chalk.cyan('    npm run dev'));
    console.log('');

    if (config.database === 'prisma') {
      console.log(chalk.dim("  Don't forget to run:"));
      console.log(chalk.cyan('    npx prisma generate'));
      console.log('');
    }

    if (
      config.auth !== 'none' ||
      config.database !== 'none' ||
      config.payment !== 'none'
    ) {
      console.log(
        chalk.dim('  Set up your environment variables in .env.local'),
      );
      console.log(chalk.dim('  (see .env.example for required variables)'));
      console.log('');
    }

    console.log(chalk.dim(`  Project created at: ${chalk.bold(targetDir)}`));
    console.log('');
  } catch (error) {
    spinner.fail(chalk.red('Failed to generate project'));

    if (error instanceof TypeError && error.message.includes('fetch')) {
      console.error(
        chalk.yellow(
          '\n  Could not connect to the API. Make sure you have internet access.',
        ),
      );
      console.error(
        chalk.yellow(
          '  Alternatively, use the VForge web app at https://vforge.vercel.app',
        ),
      );
    } else {
      console.error(chalk.red(`\n  ${(error as Error).message}`));
    }

    process.exit(1);
  }
}

async function extractZip(zipPath: string, targetDir: string): Promise<void> {
  // Ensure target directory exists
  fs.ensureDirSync(targetDir);

  // Use child_process to extract (cross-platform)
  const { exec } = await import('child_process');
  const { promisify } = await import('util');
  const execAsync = promisify(exec);

  const platform = process.platform;

  try {
    if (platform === 'win32') {
      // Windows: use PowerShell
      await execAsync(
        `powershell -command "Expand-Archive -Path '${zipPath}' -DestinationPath '${targetDir}' -Force"`,
      );
    } else {
      // macOS/Linux: use unzip
      await execAsync(`unzip -o "${zipPath}" -d "${targetDir}"`);
    }
  } catch {
    // Fallback: try tar
    try {
      await execAsync(`tar -xf "${zipPath}" -C "${targetDir}"`);
    } catch {
      throw new Error(
        'Could not extract ZIP file. Please install unzip or use the web app instead.',
      );
    }
  }
}
