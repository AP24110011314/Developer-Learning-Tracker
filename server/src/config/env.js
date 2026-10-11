// Fail-fast env validation. Import this first in app/server entry points.
const required = [
  'PORT',
  'MONGODB_URI',
  'JWT_ACCESS_SECRET',
  'JWT_REFRESH_SECRET',
  'CLIENT_URL',
  'NODE_ENV',
];

export function validateEnv() {
  const missing = required.filter((k) => !process.env[k]);
  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}. ` +
        `Copy server/.env.example to server/.env and fill in values.`
    );
  }
}

export const env = {
  get PORT() {
    return process.env.PORT;
  },
  get MONGODB_URI() {
    return process.env.MONGODB_URI;
  },
  get JWT_ACCESS_SECRET() {
    return process.env.JWT_ACCESS_SECRET;
  },
  get JWT_REFRESH_SECRET() {
    return process.env.JWT_REFRESH_SECRET;
  },
  get CLIENT_URL() {
    return process.env.CLIENT_URL;
  },
  get NODE_ENV() {
    return process.env.NODE_ENV || 'development';
  },
  get isProd() {
    return (process.env.NODE_ENV || 'development') === 'production';
  },
};
