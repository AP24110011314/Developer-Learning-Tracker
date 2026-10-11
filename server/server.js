import dotenv from 'dotenv';

dotenv.config();

import { validateEnv, env } from './src/config/env.js';
import { connectDB } from './src/config/db.js';
import { createApp } from './src/app.js';

try {
  validateEnv();
} catch (err) {
  console.error(`Startup error: ${err.message}`);
  process.exit(1);
}

const app = createApp();

try {
  await connectDB(env.MONGODB_URI);
  console.log('MongoDB connected');
} catch (err) {
  console.error(`Startup error: failed to connect to MongoDB: ${err.message}`);
  process.exit(1);
}

app.listen(Number(env.PORT), () => {
  console.log(`Server listening on port ${env.PORT} (${env.NODE_ENV})`);
});
