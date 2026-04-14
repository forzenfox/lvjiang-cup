import { IsOptional, IsInt, Min, IsString, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class VideoPaginationDto {
  @ApiPropertyOptional({ description: '页码，默认为 1', default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: '每页数量，默认为 10', default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  pageSize?: number = 10;

  @ApiPropertyOptional({ description: '排序字段，默认为 order', default: 'order' })
  @IsOptional()
  @IsString()
  sortBy?: string = 'order';

  @ApiPropertyOptional({ description: '排序方向，asc 或 desc', default: 'asc', enum: ['asc', 'desc'] })
  @IsOptional()
  @IsEnum(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc' = 'asc';

  @ApiPropertyOptional({ description: '搜索关键词（标题或BV号）' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: '按状态筛选：true-启用, false-禁用' })
  @IsOptional()
  @Type(() => Boolean)
  isEnabled?: boolean;
}

export interface PaginatedResult<T> {
  list: T[];
  total: number;
  page: number;
  pageSize: number;
}
