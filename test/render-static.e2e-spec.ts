import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { renderStatic } from '../src/scripts/render-static';

describe('renderStatic (e2e)', () => {
  const outDir = path.join(os.tmpdir(), `render-static-test-${Date.now()}`);

  afterAll(() => {
    fs.rmSync(outDir, { recursive: true, force: true });
  });

  it('writes static HTML files and copied assets for every route', async () => {
    await renderStatic(outDir);

    expect(fs.existsSync(path.join(outDir, 'index.html'))).toBe(true);
    expect(fs.existsSync(path.join(outDir, 'about', 'index.html'))).toBe(true);
    expect(fs.existsSync(path.join(outDir, 'services', 'index.html'))).toBe(true);
    expect(fs.existsSync(path.join(outDir, 'portfolio', 'index.html'))).toBe(true);
    expect(fs.existsSync(path.join(outDir, 'contact', 'index.html'))).toBe(true);
    expect(fs.existsSync(path.join(outDir, 'css', 'style.css'))).toBe(true);
    expect(fs.existsSync(path.join(outDir, '.nojekyll'))).toBe(true);

    const homeHtml = fs.readFileSync(path.join(outDir, 'index.html'), 'utf-8');
    expect(homeHtml).toContain('3D Engineering Consultancy');
  });
});
