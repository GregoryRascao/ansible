import {
  CallHandler,
  ClassSerializerInterceptor,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { ServerResponse } from 'http';
import { map, Observable } from 'rxjs';

export class TransformDTO<T> {
  @ApiProperty()
  statusCode: number;
  @ApiProperty()
  data: T;
  @ApiProperty()
  timestamp: string;
}

@Injectable()
export class TransformInterceptor
  extends ClassSerializerInterceptor
  implements NestInterceptor
{
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data: any) => {
        const response = context.switchToHttp().getResponse<ServerResponse>();

        return {
          statusCode: response.statusCode,
          data,
          timestamp: new Date().toISOString(),
        };
      }),
    );
  }
}
