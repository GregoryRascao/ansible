import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { ZodValidationException } from 'nestjs-zod';
import { Request, Response } from 'express';

@Catch(ZodValidationException)
export class ZodExceptionFilterFilter
  implements ExceptionFilter<ZodValidationException>
{
  catch(exception: ZodValidationException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();

    const errorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message: exception.message || 'Erreur interne du serveur',
    };

    response.status(status).json(errorResponse);
  }
}
