import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import type { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? exception.getResponse()
        : 'Internal server error';

    console.error('Exception Filter caught:', exception instanceof Error ? { message: exception.message, stack: exception.stack } : exception);

    response.status(status).json({
      statusCode: status,
      message: typeof message === 'object' && 'message' in (message as object)
        ? (message as { message: string }).message
        : message,
      error: HttpStatus[status],
      rawError: exception instanceof Error ? exception.message : String(exception),
      rawStack: exception instanceof Error ? exception.stack : undefined,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
