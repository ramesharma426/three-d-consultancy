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

  it('GET / renders the home page', async () => {
    const response = await request(app.getHttpServer()).get('/');
    expect(response.status).toBe(200);
    expect(response.text).toContain('3D Engineering Consultancy');
    expect(response.text).toContain(
      'Precision Engineering &amp; Design Consultancy',
    );
  });

  it('GET /about renders the about page', async () => {
    const response = await request(app.getHttpServer()).get('/about');
    expect(response.status).toBe(200);
    expect(response.text).toContain('What We Stand For');
    expect(response.text).toContain('Hetauda');
  });

  it('GET /services renders the services page', async () => {
    const response = await request(app.getHttpServer()).get('/services');
    expect(response.status).toBe(200);
    expect(response.text).toContain('3D Modeling &amp; CAD Design');
    expect(response.text).toContain('General Engineering Consultancy');
  });

  it('GET /portfolio renders the portfolio page', async () => {
    const response = await request(app.getHttpServer()).get('/portfolio');
    expect(response.status).toBe(200);
    expect(response.text).toContain('Sample projects');
    expect(response.text).toContain('Sample Residential Structural Design');
  });

  it('GET /contact renders the contact page', async () => {
    const response = await request(app.getHttpServer()).get('/contact');
    expect(response.status).toBe(200);
    expect(response.text).toContain(
      'action="https://formspree.io/f/PLACEHOLDER_ID"',
    );
    expect(response.text).toContain('maps?q=27.4328334,85.0400641');
  });
});
