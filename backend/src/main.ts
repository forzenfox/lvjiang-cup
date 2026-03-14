import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import * as fs from 'fs';
import * as path from 'path';

const logger = new Logger('Bootstrap');

const REQUIRED_ENV_VARS = [
  'NODE_ENV',
  'PORT',
  'JWT_SECRET',
  'JWT_EXPIRES_IN',
  'ADMIN_USERNAME',
  'ADMIN_PASSWORD',
  'DATABASE_PATH',
  'CORS_ORIGIN',
];

async function validateEnvironmentConfig() {
  const nodeEnv = process.env.NODE_ENV || 'development';
  const envFileName = `.env.${nodeEnv}`;
  const envFilePath = path.resolve(process.cwd(), envFileName);

  logger.log(`当前环境: ${nodeEnv}`);
  logger.log(`期望配置文件: ${envFileName}`);

  if (!fs.existsSync(envFilePath)) {
    logger.error(`❌ 环境配置文件不存在: ${envFileName}`);
    logger.error('');
    logger.error('请执行以下命令创建配置文件:');
    logger.error('');

    const examples = {
      development: 'cp .env.example .env.development',
      production: 'cp .env.example .env.production',
      test: 'cp .env.example .env.test',
    };

    if (examples[nodeEnv]) {
      logger.error(`  ${examples[nodeEnv]}`);
    } else {
      logger.error(`  cp .env.example ${envFileName}`);
    }

    logger.error('');
    logger.error('然后编辑配置文件设置正确的值');
    logger.error('');

    process.exit(1);
  }

  logger.log(`✅ 配置文件加载成功: ${envFileName}`);
  logger.log('');

  const missingVars = REQUIRED_ENV_VARS.filter((varName) => !process.env[varName]);

  if (missingVars.length > 0) {
    logger.error(`❌ 缺少必需的环境变量: ${missingVars.join(', ')}`);
    logger.error('');
    logger.error('请在配置文件中添加以下变量:');
    logger.error('');
    missingVars.forEach((varName) => {
      logger.error(`  ${varName}=`);
    });
    logger.error('');

    process.exit(1);
  }

  logger.log('✅ 所有必需的环境变量已配置');
}

async function bootstrap() {
  await validateEnvironmentConfig();
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: process.env.CORS_ORIGIN!,
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  app.useGlobalFilters(new HttpExceptionFilter());

  app.useGlobalInterceptors(new TransformInterceptor());

  app.setGlobalPrefix('api');

  const config = new DocumentBuilder()
    .setTitle('驴酱杯赛事 API')
    .setDescription('驴酱杯LOL娱乐赛事网站后端 API 文档')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = parseInt(process.env.PORT!, 10);
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}/api`);
  console.log(`Swagger docs: http://localhost:${port}/api/docs`);
}

bootstrap();
