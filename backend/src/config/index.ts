import { env } from './env';

const config = {
  supabase: {
    url: env.SUPABASE_URL,
    anonKey: env.SUPABASE_ANON_KEY,
    serviceRoleKey: env.SUPABASE_SERVICE_ROLE_KEY,
  },
  huggingface: {
    apiToken: env.HUGGINGFACE_API_TOKEN,
  },
  server: {
    port: env.PORT,
    frontendUrl: env.FRONTEND_URL,
  },
  rateLimit: {
    windowMs: env.RATE_LIMIT_WINDOW_MS,
    maxRequests: env.RATE_LIMIT_MAX_REQUESTS,
  },
};

export default config;
