import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Observable, tap } from 'rxjs';

@Injectable()
export class LoggerInterceptor implements NestInterceptor {
  private readonly $logger = new Logger(LoggerInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const now = Date.now();
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();

    const uri = request.url;
    const method = request.method;

    this.$logger.log(
      `[${method}] ${uri} - Timestamp: ${new Date(now).toISOString()}`,
    );

    return next.handle().pipe(
      tap((req) => {
        const user =
          (req['user'] && req['user']['email']) ||
          (req['user'] && req['user']['sub']) ||
          'Guest';
        const responseTime = Date.now() - now;
        this.$logger.log(
          `[${method}] ${uri} - User: ${user} - Response Status: ${response['statusCode']} - Took: ${responseTime}ms`,
        );
      }),
    );
  }
}
