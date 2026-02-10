import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { existsSync, readFileSync, writeFileSync } from 'fs';

async function bootstrap() {
  const file = 'worker.json';
  let data: { worker_id: string };
  if (existsSync(file)) {
    Logger.log(`Worker ID found in ${file}`, 'Bootstrap');
    const content = readFileSync(file, 'utf8');
    data = JSON.parse(content) as { worker_id: string };

    process.env.WORKER_ID = data.worker_id;
  } else {
    data = { worker_id: uuidv4() };
    Logger.log(`Worker ID not found in ${file}, creating new one`, 'Bootstrap');
    writeFileSync(file, JSON.stringify(data, null, 2), {
      encoding: 'utf8',
    });
    process.env.WORKER_ID = data.worker_id;
    Logger.log(
      `Worker ID set to ${process.env.WORKER_ID}; check = ${data.worker_id}`,
      'Bootstrap',
    );
  }

  // Import AppModule only after WORKER_ID is set so decorators that read it
  // receive the correct value at definition time.
  const { AppModule } = await import('./app.module');

  const app = await NestFactory.create(AppModule);

  await app.listen(3002);
}
bootstrap();
