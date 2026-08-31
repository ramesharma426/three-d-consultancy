import { NestExpressApplication } from '@nestjs/platform-express';
import { join, basename, extname } from 'path';
import * as fs from 'fs';
import hbs from 'hbs';

export function configureApp(app: NestExpressApplication): void {
  app.useStaticAssets(join(__dirname, '..', 'public'));
  app.setBaseViewsDir(join(__dirname, '..', 'views'));
  app.setViewEngine('hbs');

  const partialsDir = join(__dirname, '..', 'views', 'partials');
  for (const file of fs.readdirSync(partialsDir)) {
    const name = basename(file, extname(file));
    const content = fs.readFileSync(join(partialsDir, file), 'utf-8');
    hbs.registerPartial(name, content);
  }
}
