import { defineConfig } from 'drizzle-kit';
export default defineConfig({
  dialect: 'postgresql', // "mysql" | "sqlite" | "postgresql"
  schema: './src/drizzle/schema.ts',
  out: './drizzle',
  dbCredentials: {
    url: process.env.POSTGRES_URL_PROD,
  },
});
