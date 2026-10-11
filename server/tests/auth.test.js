import { describe, test, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { setupDB, teardownDB, clearDB, registerFixture } from './helpers.js';

let app;

beforeAll(async () => {
  await setupDB();
  app = createApp();
}, 120000);

afterAll(async () => {
  await teardownDB();
});

beforeEach(async () => {
  await clearDB();
});

describe('POST /api/auth/register', () => {
  test('registers a user, returns access token, sets refresh cookie, never leaks passwordHash', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ username: 'alice', email: 'alice@example.com', password: 'password123' });
    expect(res.status).toBe(201);
    expect(res.body.accessToken).toBeDefined();
    expect(res.body.user.username).toBe('alice');
    expect(res.body.user.passwordHash).toBeUndefined();
    expect(JSON.stringify(res.body)).not.toContain('passwordHash');
    const cookies = res.headers['set-cookie'] || [];
    expect(cookies.some((c) => c.startsWith('refreshToken=') && /HttpOnly/i.test(c))).toBe(true);
  });

  test('rejects duplicate email with 409', async () => {
    await registerFixture(request, app, { username: 'bob', email: 'bob@example.com' });
    const res = await request(app)
      .post('/api/auth/register')
      .send({ username: 'bobby', email: 'bob@example.com', password: 'password123' });
    expect(res.status).toBe(409);
  });

  test('rejects invalid input with 400 and { message, errors }', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ username: 'ab', email: 'not-an-email', password: 'short' });
    expect(res.status).toBe(400);
    expect(res.body.message).toBeDefined();
  });
});

describe('POST /api/auth/login', () => {
  test('logs in with correct credentials', async () => {
    await registerFixture(request, app, { username: 'carol', email: 'carol@example.com' });
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'carol@example.com', password: 'password123' });
    expect(res.status).toBe(200);
    expect(res.body.accessToken).toBeDefined();
    expect(res.body.user.passwordHash).toBeUndefined();
  });

  test('rejects wrong password with 401', async () => {
    await registerFixture(request, app, { username: 'dave', email: 'dave@example.com' });
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'dave@example.com', password: 'wrongpassword' });
    expect(res.status).toBe(401);
  });
});

describe('refresh / logout / me', () => {
  test('refresh cookie yields a new access token', async () => {
    const agent = request.agent(app);
    await agent
      .post('/api/auth/register')
      .send({ username: 'erin', email: 'erin@example.com', password: 'password123' });
    const res = await agent.post('/api/auth/refresh').send();
    expect(res.status).toBe(200);
    expect(res.body.accessToken).toBeDefined();
  });

  test('refresh without cookie is 401', async () => {
    const res = await request(app).post('/api/auth/refresh').send();
    expect(res.status).toBe(401);
  });

  test('GET /api/auth/me needs a token; works with one', async () => {
    const anon = await request(app).get('/api/auth/me');
    expect(anon.status).toBe(401);
    const { token } = await registerFixture(request, app, { username: 'frank', email: 'frank@example.com' });
    const me = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${token}`);
    expect(me.status).toBe(200);
    expect(me.body.user.username).toBe('frank');
  });
});
