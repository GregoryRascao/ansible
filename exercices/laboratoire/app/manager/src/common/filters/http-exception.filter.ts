import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ApiProperty } from '@nestjs/swagger';
import { ZodValidationException } from 'nestjs-zod';
import { ZodError } from 'zod';

export class ExceptionResponse {
  @ApiProperty()
  statusCode: number;
  @ApiProperty()
  timestamp: string;
  @ApiProperty()
  path: string;
  @ApiProperty()
  method: string;
  @ApiProperty()
  message: string;
}

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter<HttpException> {
  private readonly $logger = new Logger(HttpExceptionFilter.name);

  catch(exception: HttpException, host: ArgumentsHost) {
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
    } as Record<string, any>;
    if (exception instanceof ZodValidationException) {
      const zodError = exception.getZodError();
      if (zodError instanceof ZodError) {
        errorResponse.validation = JSON.parse(zodError.message);
      }
    }

    if (status >= HttpStatus.INTERNAL_SERVER_ERROR.valueOf()) {
      this.$logger.error(
        `${request.method} ${request.url}`,
        exception.stack,
        HttpExceptionFilter.name,
      );
    } else {
      this.$logger.warn(
        `${request.method} ${request.url} - ${exception.message}`,
        HttpExceptionFilter.name,
      );
    }

    response.status(status).json(errorResponse);
  }
}
