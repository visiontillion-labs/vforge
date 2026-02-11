import { NextRequest, NextResponse } from 'next/server';
import archiver from 'archiver';
import fs from 'fs';
import path from 'path';
import { PassThrough } from 'stream';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      projectName,
      router,
      language,
      linter,
      version,
      srcDir,
      importAlias,
      orm,
      features,
    } = body;

    const stream = new PassThrough();
    const archive = archiver('zip', { zlib: { level: 9 } });
    archive.pipe(stream);

    const templatesDir = path.join(process.cwd(), 'src', 'templates');
    const langDir = path.join(templatesDir, language);
    const commonDir = path.join(langDir, 'common');
    const routerDir = path.join(langDir, router === 'app' ? 'app' : 'pages');
    const extrasDir = path.join(templatesDir, 'extras');

    const addDirectory = (source: string, destinationPrefix: string = '') => {
      if (!fs.existsSync(source)) return;

      const walk = (
        dir: string,
        fileList: string[] = [],
        baseDir: string = dir,
      ) => {
        const files = fs.readdirSync(dir);
        files.forEach((file) => {
          const filePath = path.join(dir, file);
          const stat = fs.statSync(filePath);
          if (stat.isDirectory()) {
            walk(filePath, fileList, baseDir);
          } else {
            fileList.push(path.relative(baseDir, filePath));
          }
        });
        return fileList;
      };

      const allFiles = walk(source);

      allFiles.forEach((file) => {
        const fullPath = path.join(source, file);
        let content = fs.readFileSync(fullPath);
        let archivePath = path.join(destinationPrefix, file);

        // Skip package.json
        if (file === 'package.json') return;

        // Handle Linter Configs
        if (
          linter !== 'eslint' &&
          (file.includes('.eslintrc') || file.includes('eslint.config'))
        )
          return;
        if (linter !== 'biome' && file === 'biome.json') return;

        // Handle React Compiler -> Intercept next.config.mjs
        if (file === 'next.config.mjs' && features.reactCompiler) {
          let configContent = content.toString('utf-8');
          if (configContent.includes('const nextConfig = {};')) {
            configContent = configContent.replace(
              'const nextConfig = {};',
              'const nextConfig = { experimental: { reactCompiler: true } };',
            );
          }
          content = Buffer.from(configContent);
        }

        // Handle Src Directory
        const normalizedPath = archivePath.split(path.sep).join('/');
        if (srcDir === false) {
          if (normalizedPath.startsWith('src/')) {
            archivePath = normalizedPath.substring(4);
          }
        }

        // Handle Import Alias
        if (importAlias !== '@/*') {
          const aliasPrefix = importAlias.replace('/*', '').replace('/', '');
          const ext = path.extname(file);

          if (['.ts', '.tsx', '.js', '.jsx', '.json', '.css'].includes(ext)) {
            const contentStr = content.toString('utf-8');
            let newContent = contentStr.replaceAll('@/', `${aliasPrefix}/`);

            if (file.endsWith('config.json')) {
              const aliasKey = importAlias.endsWith('/*')
                ? importAlias
                : `${importAlias}/*`;
              newContent = newContent.replace('"@/*"', `"${aliasKey}"`);
              if (srcDir === false) {
                newContent = newContent.replace('["./src/*"]', '["./*"]');
              }
            }
            content = Buffer.from(newContent);
          }
        } else if (srcDir === false && file.endsWith('config.json')) {
          const contentStr = content.toString('utf-8');
          const newContent = contentStr.replace('["./src/*"]', '["./*"]');
          content = Buffer.from(newContent);
        }

        archive.append(content, { name: archivePath });
      });
    };

    addDirectory(commonDir);
    addDirectory(routerDir);

    // Add Biome
    if (linter === 'biome') {
      const biomePath = path.join(extrasDir, 'biome.json');
      if (fs.existsSync(biomePath)) {
        archive.file(biomePath, { name: 'biome.json' });
      }
    }

    // Add Docker
    if (features.docker) {
      const dockerPath = path.join(extrasDir, 'docker', 'Dockerfile');
      if (fs.existsSync(dockerPath)) {
        archive.file(dockerPath, { name: 'Dockerfile' });
      }
    }

    // --- Process package.json ---
    const packageJsonPath = path.join(commonDir, 'package.json');
    if (fs.existsSync(packageJsonPath)) {
      const packageJsonContent = fs.readFileSync(packageJsonPath, 'utf-8');
      const packageJson = JSON.parse(packageJsonContent);

      packageJson.name = projectName;

      if (version === '14') {
        packageJson.dependencies.next = '^14.2.0';
        // ... (simplified)
      }

      // Linter
      if (linter === 'biome') {
        delete packageJson.devDependencies['eslint'];
        delete packageJson.devDependencies['eslint-config-next'];
        packageJson.devDependencies['@biomejs/biome'] = '1.5.3';
        packageJson.scripts['lint'] = 'biome lint .';
        packageJson.scripts['format'] = 'biome format . --write';
      } else if (linter === 'none') {
        delete packageJson.devDependencies['eslint'];
        delete packageJson.devDependencies['eslint-config-next'];
        delete packageJson.scripts['lint'];
      }

      // ORM Logic
      if (orm === 'prisma') {
        packageJson.devDependencies['prisma'] = '^5.10.0';
        packageJson.dependencies['@prisma/client'] = '^5.10.0';
        const schema = `datasource db { provider = "postgresql" url = env("DATABASE_URL") }\ngenerator client { provider = "prisma-client-js" }\nmodel User { id Int @id @default(autoincrement()) }`;
        archive.append(schema, { name: 'prisma/schema.prisma' });
        const dbContent =
          language === 'ts'
            ? `import { PrismaClient } from '@prisma/client'\nexport const prisma = new PrismaClient()`
            : `import { PrismaClient } from '@prisma/client'\nexport const prisma = new PrismaClient()`;
        const libPath = srcDir ? 'src/lib/db' : 'lib/db';
        archive.append(dbContent, { name: `${libPath}.${language}` });
      } else if (orm === 'drizzle') {
        packageJson.dependencies['drizzle-orm'] = '^0.29.3';
        packageJson.dependencies['postgres'] = '^3.4.3';
        packageJson.devDependencies['drizzle-kit'] = '^0.20.14';
        packageJson.devDependencies['dotenv'] = '^16.4.5';
        packageJson.devDependencies['pg'] = '^8.11.3';
        packageJson.devDependencies['@types/pg'] = '^8.11.0';

        packageJson.scripts['db:generate'] = 'drizzle-kit generate:pg';
        packageJson.scripts['db:push'] = 'drizzle-kit push:pg';

        const drizzleDir = path.join(extrasDir, 'drizzle');
        if (fs.existsSync(drizzleDir)) {
          if (fs.existsSync(path.join(drizzleDir, 'drizzle.config.ts'))) {
            archive.file(path.join(drizzleDir, 'drizzle.config.ts'), {
              name: 'drizzle.config.ts',
            });
          }
          // Add other drizzle files to src/lib/db
          const dbDest = srcDir ? 'src/lib/db' : 'lib/db';
          if (fs.existsSync(path.join(drizzleDir, 'db.ts'))) {
            const content = fs.readFileSync(path.join(drizzleDir, 'db.ts'));
            archive.append(content, { name: `${dbDest}/index.${language}` }); // index.ts/js
          }
          if (fs.existsSync(path.join(drizzleDir, 'schema.ts'))) {
            const content = fs.readFileSync(path.join(drizzleDir, 'schema.ts'));
            archive.append(content, { name: `${dbDest}/schema.${language}` });
          }
        }
      }

      // Features
      if (features.shadcn) {
        packageJson.devDependencies['shadcn'] = '^2.0.0';
        packageJson.dependencies['class-variance-authority'] = '^0.7.0';
        packageJson.dependencies['clsx'] = '^2.1.0';
        packageJson.dependencies['tailwind-merge'] = '^2.2.0';
        packageJson.dependencies['lucide-react'] = '^0.300.0';
      }

      if (features.auth) {
        packageJson.dependencies['next-auth'] = '5.0.0-beta.19';
        // ... auth logic
      }

      if (features.reactCompiler) {
        // ... dependencies if needed
      }

      archive.append(JSON.stringify(packageJson, null, 2), {
        name: 'package.json',
      });
    }

    archive.finalize();

    return new NextResponse(stream as any, {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="${projectName}.zip"`,
      },
    });
  } catch (error) {
    console.error('Generator error:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
