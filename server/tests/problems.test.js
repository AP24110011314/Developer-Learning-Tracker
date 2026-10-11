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

async function twoUsers() {
  const a = await registerFixture(request, app, { username: 'userA', email: 'a@example.com' });
  const b = await registerFixture(request, app, { username: 'userB', email: 'b@example.com' });
  return { a, b };
}

describe('problems CRUD', () => {
  test('creates, reads, updates, and deletes a problem', async () => {
    const { a } = await twoUsers();
    const created = await request(app)
      .post('/api/problems')
      .set('Authorization', `Bearer ${a.token}`)
      .send({ title: 'Two Sum', difficulty: 'easy', topics: ['array'] });
    expect(created.status).toBe(201);
    expect(created.body.title).toBe('Two Sum');

    const id = created.body._id;
    const got = await request(app).get(`/api/problems/${id}`).set('Authorization', `Bearer ${a.token}`);
    expect(got.status).toBe(200);

    const updated = await request(app)
      .put(`/api/problems/${id}`)
      .set('Authorization', `Bearer ${a.token}`)
      .send({ status: 'revisit' });
    expect(updated.status).toBe(200);
    expect(updated.body.status).toBe('revisit');

    const deleted = await request(app).delete(`/api/problems/${id}`).set('Authorization', `Bearer ${a.token}`);
    expect(deleted.status).toBe(200);
    const gone = await request(app).get(`/api/problems/${id}`).set('Authorization', `Bearer ${a.token}`);
    expect(gone.status).toBe(404);
  });

  test('filters by difficulty/topic/status and paginates', async () => {
    const { a } = await twoUsers();
    const auth = (r) => r.set('Authorization', `Bearer ${a.token}`);
    for (let i = 1; i <= 5; i++) {
      await request(app).post('/api/problems').set('Authorization', `Bearer ${a.token}`).send({
        title: `P${i}`,
        difficulty: i <= 3 ? 'easy' : 'hard',
        topics: i % 2 ? ['array'] : ['dp'],
        status: 'solved',
      });
    }
    const easy = await auth(request(app).get('/api/problems?difficulty=easy'));
    expect(easy.body.total).toBe(3);
    const topic = await auth(request(app).get('/api/problems?topic=array'));
    expect(topic.body.total).toBe(3);
    const page = await auth(request(app).get('/api/problems?limit=2&page=2'));
    expect(page.body.items.length).toBe(2);
    expect(page.body.page).toBe(2);
    expect(page.body.totalPages).toBe(3);
  });

  test('rejects invalid difficulty with 400', async () => {
    const { a } = await twoUsers();
    const res = await request(app)
      .post('/api/problems')
      .set('Authorization', `Bearer ${a.token}`)
      .send({ title: 'X', difficulty: 'insane' });
    expect(res.status).toBe(400);
    expect(res.body.message).toBeDefined();
  });

  test('requires auth on all routes', async () => {
    expect((await request(app).get('/api/problems')).status).toBe(401);
    expect((await request(app).post('/api/problems').send({ title: 'X' })).status).toBe(401);
  });
});

describe('user scoping', () => {
  test('user A cannot read, update, or delete user B’s problem', async () => {
    const { a, b } = await twoUsers();
    const created = await request(app)
      .post('/api/problems')
      .set('Authorization', `Bearer ${a.token}`)
      .send({ title: 'A secret', difficulty: 'easy' });
    const id = created.body._id;

    expect((await request(app).get(`/api/problems/${id}`).set('Authorization', `Bearer ${b.token}`)).status).toBe(404);
    expect(
      (await request(app).put(`/api/problems/${id}`).set('Authorization', `Bearer ${b.token}`).send({ title: 'hijack' })).status
    ).toBe(404);
    expect((await request(app).delete(`/api/problems/${id}`).set('Authorization', `Bearer ${b.token}`)).status).toBe(404);

    // B's list is empty and A's problem is untouched.
    const listB = await request(app).get('/api/problems').set('Authorization', `Bearer ${b.token}`);
    expect(listB.body.total).toBe(0);
    const stillThere = await request(app).get(`/api/problems/${id}`).set('Authorization', `Bearer ${a.token}`);
    expect(stillThere.status).toBe(200);
    expect(stillThere.body.title).toBe('A secret');
  });
});
