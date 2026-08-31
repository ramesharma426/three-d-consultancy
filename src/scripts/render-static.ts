import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as fs from 'fs';
import * as path from 'path';
import { AppModule } from '../app.module';
import { configureApp } from '../app.config';
import { company } from '../config/company';

const ROUTES = ['/'];

function routeToOutputPath(route: string, outDir: string): string {
  if (route === '/') {
    return path.join(outDir, 'index.html');
  }
  return path.join(outDir, route.replace(/^\//, ''), 'index.html');
}

export async function renderStatic(outDir: string): Promise<void> {
  fs.rmSync(outDir, { recursive: true, force: true });
  fs.mkdirSync(outDir, { recursive: true });

  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: false,
  });
  configureApp(app);
  await app.listen(0);

  const address = app.getHttpServer().address();
  const port = typeof address === 'string' || address === null ? 0 : address.port;
  const baseUrl = `http://127.0.0.1:${port}`;

  try {
    for (const route of ROUTES) {
      const response = await fetch(`${baseUrl}${route}`);
      if (!response.ok) {
        throw new Error(`Failed to render ${route}: HTTP ${response.status}`);
      }
      const rawHtml = await response.text();
      const html = rawHtml.replace(/href="\//g, `href="${company.basePath}/`);
      const outputPath = routeToOutputPath(route, outDir);
      fs.mkdirSync(path.dirname(outputPath), { recursive: true });
      fs.writeFileSync(outputPath, html);
    }
  } finally {
    await app.close();
  }

  fs.cpSync(path.join(__dirname, '..', '..', 'public'), outDir, {
    recursive: true,
  });
  fs.writeFileSync(path.join(outDir, '.nojekyll'), '');
}

if (require.main === module) {
  const outDir = path.join(process.cwd(), 'dist-static');
  renderStatic(outDir)
    .then(() => {
      console.log(`Static site written to ${outDir}`);
    })
    .catch((err) => {
      console.error(err);
      process.exitCode = 1;
    });
}
