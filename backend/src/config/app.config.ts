export default () => ({
  port: parseInt(process.env.PORT!, 10),
  nodeEnv: process.env.NODE_ENV!,
  jwt: {
    secret: process.env.JWT_SECRET!,
    expiresIn: process.env.JWT_EXPIRES_IN!,
  },
  admin: {
    username: process.env.ADMIN_USERNAME!,
    password: process.env.ADMIN_PASSWORD!,
  },
  database: {
    path: process.env.DATABASE_PATH!,
  },
  cache: {
    ttl: 60,
  },
  cors: {
    origin: process.env.CORS_ORIGIN!,
  },
});
