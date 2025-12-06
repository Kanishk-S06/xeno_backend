import dotenv from 'dotenv';
dotenv.config();

const required = (v: string | undefined, name: string) => {
  if (!v) {
    console.warn(`Warning: ${name} is not set.`);
  }
  return v;
};

export default {
  PORT: parseInt(process.env.PORT || '4000', 10),
  DATABASE_URL: required(process.env.DATABASE_URL, 'DATABASE_URL'),
  JWT_SECRET: required(process.env.JWT_SECRET || 'devsecret', 'JWT_SECRET'),
  APP_URL: process.env.APP_URL || 'http://localhost:4000',
  SHOPIFY_API_KEY: process.env.SHOPIFY_API_KEY,
  SHOPIFY_API_SECRET: process.env.SHOPIFY_API_SECRET
};
