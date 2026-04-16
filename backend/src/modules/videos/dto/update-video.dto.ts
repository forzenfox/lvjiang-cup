import { IsString, IsOptional, IsInt, Min, Max, MaxLength, IsIn, IsBoolean } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateVideoDto {
  @ApiPropertyOptional({ description: 'B站视频链接或BV号' })
  @IsString()
  @IsOptional()
  url?: string;

  @ApiPropertyOptional({ description: '自定义标题（留空则使用B站原始标题）', maxLength: 50 })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  customTitle?: string;

  @ApiPropertyOptional({ description: '排序值' })
  @IsInt()
  @Min(0)
  @Max(9999)
  @IsOptional()
  order?: number;

  @ApiPropertyOptional({ description: '状态' })
  @IsIn(['enabled', 'disabled'])
  @IsOptional()
  status?: string;

  @ApiPropertyOptional({ description: '是否启用' })
  @IsBoolean()
  @IsOptional()
  isEnabled?: boolean;
}
