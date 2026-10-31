const dotenv = require('dotenv');
dotenv.config();

const env = {
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  DATABASE_URL: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/subscription_db?schema=public',
  JWT_SECRET: process.env.JWT_SECRET || 'brightloop_super_secret_jwt_key_hackathon_2026',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  BCRYPT_SALT_ROUNDS: parseInt(process.env.BCRYPT_SALT_ROUNDS, 10) || 10,
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:3000'
};

module.exports = env;
