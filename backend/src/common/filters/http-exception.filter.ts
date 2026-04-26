import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let error = 'Internal Server Error';
    let errors: string[] | undefined;
    let code: number | undefined;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (typeof exceptionResponse === 'object') {
        message = (exceptionResponse as any).message || message;
        error = (exceptionResponse as any).error || error;
        errors = (exceptionResponse as any).errors;
        code = (exceptionResponse as any).code;
      }
    } else if (exception instanceof Error) {
      // 记录详细的错误堆栈到控制台
      this.logger.error(
        `未捕获的异常: ${exception.message}\n堆栈: ${exception.stack}`,
        exception.stack,
      );
      message = exception.message;
    }

    // 对于500错误,记录请求信息以便调试
    if (status === HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error(`500错误 - 请求: ${request?.method} ${request?.url}, 错误: ${message}`);
    }

    const responseBody: any = {
      statusCode: status,
      message,
      error,
      timestamp: new Date().toISOString(),
    };

    // 返回额外字段(errors、code)
    if (errors && errors.length > 0) {
      responseBody.errors = errors;
    }
    if (code !== undefined) {
      responseBody.code = code;
    }

    response.status(status).json(responseBody);
  }
}
