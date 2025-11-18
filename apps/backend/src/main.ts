import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as express from 'express';
import { join } from 'path';
// Use require to avoid ESM interop issues
// eslint-disable-next-line @typescript-eslint/no-var-requires
const compression = require('compression');

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const port = process.env.PORT ? Number(process.env.PORT) : 4000;

  app.setGlobalPrefix('api');
  app.enableCors({ origin: process.env.CORS_ORIGIN || '*' });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  // Enable gzip compression for better bandwidth usage across many clients
  // Skip compression for SSE (text/event-stream)
  app.use(compression({
    filter: (req: any, res: any) => {
      const accept = req.headers?.accept || '';
      if (typeof accept === 'string' && accept.includes('text/event-stream')) return false;
      const ct = res.getHeader && res.getHeader('Content-Type');
      if (typeof ct === 'string' && ct.includes('text/event-stream')) return false;
      return compression.filter ? (compression as any).filter(req, res) : true;
    }
  } as any));

  // Serve static uploads with long cache lifetime; files are content-addressed by unique name
  app.use(
    '/api/uploads',
    express.static(join(process.cwd(), 'uploads'), {
      maxAge: 1000 * 60 * 60 * 24 * 30, // 30 days
      etag: true,
      immutable: true as any,
    } as any),
  );

  const host = process.env.HOST || '0.0.0.0';
  await app.listen(port, host);
}

bootstrap();
