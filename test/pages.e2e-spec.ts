import { Test } from '@nestjs/testing';
import { NestExpressApplication } from '@nestjs/platform-express';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { configureApp } from '../src/app.config';

describe('Pages (e2e)', () => {
  let app: NestExpressApplication;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication<NestExpressApplication>();
    configureApp(app);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET / renders the single-page site with the sidebar and footer', async () => {
    const response = await request(app.getHttpServer()).get('/');
    expect(response.status).toBe(200);
    expect(response.text).toContain('class="sidebar-nav"');
    expect(response.text).toContain('class="site-footer"');
    expect(response.text).toContain('3D Engineering Consultancy');
    expect(response.text).toContain(
      'Precision Engineering &amp; Design Consultancy',
    );
  });

  it('GET / includes the About section', async () => {
    const response = await request(app.getHttpServer()).get('/');
    expect(response.text).toContain('id="about"');
    expect(response.text).toContain('What We Stand For');
    expect(response.text).toContain('Hetauda');
  });

  it('GET / includes the Services section', async () => {
    const response = await request(app.getHttpServer()).get('/');
    expect(response.text).toContain('id="services"');
    expect(response.text).toContain('3D Modeling &amp; CAD Design');
    expect(response.text).toContain('General Engineering Consultancy');
  });

  it('GET / includes the Portfolio section', async () => {
    const response = await request(app.getHttpServer()).get('/');
    expect(response.text).toContain('id="portfolio"');
    expect(response.text).toContain('Sample projects');
    expect(response.text).toContain('Sample Residential Structural Design');
  });

  it('GET / includes the Contact section', async () => {
    const response = await request(app.getHttpServer()).get('/');
    expect(response.text).toContain('id="contact"');
    expect(response.text).toContain('maps?q=27.4328334,85.0400641');
  });
});
