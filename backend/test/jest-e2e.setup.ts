// E2E 测试环境配置
import * as dotenv from 'dotenv';
import * as path from 'path';

// 加载测试环境变量
dotenv.config({ path: path.join(__dirname, '../.env.test') });

// 确保必要的测试环境变量存在
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret-key-for-jwt-signing';
process.env.JWT_EXPIRATION = process.env.JWT_EXPIRATION || '1h';
process.env.DATABASE_PATH = process.env.DATABASE_PATH || ':memory:';
process.env.CACHE_TTL = process.env.CACHE_TTL || '60';
process.env.ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
process.env.ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH || '$2b$10$test-hash';
