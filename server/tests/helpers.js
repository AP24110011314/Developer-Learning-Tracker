import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

process.env.JWT_ACCESS_SECRET = 'test_access_secret_0123456789abcdef';
process.env.JWT_REFRESH_SECRET = 'test_refresh_secret_0123456789abcdef';
process.env.CLIENT_URL = 'http://localhost:5173';
process.env.NODE_ENV = 'test';
process.env.MONGODB_URI = 'mongodb://localhost:27017/unused';
process.env.PORT = '5000';

let mongod;

export async function setupDB() {
  mongod = await MongoMemoryServer.create();
  await mongoose.connect(mongod.getUri());
}

export async function teardownDB() {
  await mongoose.disconnect();
  if (mongod) await mongod.stop();
}

export async function clearDB() {
  for (const name of Object.keys(mongoose.connection.collections)) {
    await mongoose.connection.collections[name].deleteMany({});
  }
}

export async function registerFixture(request, app, { username, email, password = 'password123' }) {
  const res = await request(app)
    .post('/api/auth/register')
    .send({ username, email, password });
  if (res.status !== 201) throw new Error(`Fixture register failed: ${res.status} ${JSON.stringify(res.body)}`);
  return { token: res.body.accessToken, user: res.body.user, cookie: res.headers['set-cookie'] };
}
