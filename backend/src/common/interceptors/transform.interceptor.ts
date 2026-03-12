import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface ApiResponse<T> {
  success: boolean;
  code: number;
  data?: T;
  message?: string;
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, ApiResponse<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<ApiResponse<T>> {
    return next.handle().pipe(
      map(data => {
        // 如果已经是标准响应格式，直接返回
        if (data && typeof data === 'object' && 'success' in data && 'code' in data) {
          return data;
        }

        // 包装为统一响应格式
        return {
          success: true,
          code: 200,
          data,
          message: '操作成功',
        };
      }),
    );
  }
}
