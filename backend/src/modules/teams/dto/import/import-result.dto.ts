import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ImportErrorDto } from './import-error.dto';

export class ImportResultDto {
  @ApiProperty({ description: '总处理数量' })
  total: number;

  @ApiProperty({ description: '新增数量' })
  created: number;

  @ApiProperty({ description: '覆盖数量' })
  updated: number;

  @ApiProperty({ description: '失败数量' })
  failed: number;

  @ApiPropertyOptional({ description: '错误列表', type: [ImportErrorDto] })
  errors?: ImportErrorDto[];

  @ApiPropertyOptional({ description: '外链URL列表' })
  externalUrlItems?: string[];

  constructor(
    total: number = 0,
    created: number = 0,
    updated: number = 0,
    failed: number = 0,
    errors: ImportErrorDto[] = [],
    externalUrlItems: string[] = [],
  ) {
    this.total = total;
    this.created = created;
    this.updated = updated;
    this.failed = failed;
    this.errors = errors;
    this.externalUrlItems = externalUrlItems;
  }
}
