import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { renderStatic } from '../src/scripts/render-static';

describe('renderStatic (e2e)', () => {
  const outDir = path.join(os.tmpdir(), `render-static-test-${Date.now()}`);

  afterAll(() => {
    fs.rmSync(outDir, { recursive: true, force: true });
  });

  it('writes the single-page static site and copied assets', async () => {
    await renderStatic(outDir);

    expect(fs.existsSync(path.join(outDir, 'index.html'))).toBe(true);
    expect(fs.existsSync(path.join(outDir, 'css', 'style.css'))).toBe(true);
    expect(fs.existsSync(path.join(outDir, 'js', 'scrollspy.js'))).toBe(true);
    expect(fs.existsSync(path.join(outDir, '.nojekyll'))).toBe(true);

    const homeHtml = fs.readFileSync(path.join(outDir, 'index.html'), 'utf-8');
    expect(homeHtml).toContain('3D Engineering Consultancy');
    expect(homeHtml).toContain('href="/three-d-consultancy/css/style.css"');
    expect(homeHtml).toContain('id="about"');
    expect(homeHtml).toContain('What We Stand For');
    expect(homeHtml).toContain('id="services"');
    expect(homeHtml).toContain('id="portfolio"');
    expect(homeHtml).toContain('id="contact"');
  });
});
