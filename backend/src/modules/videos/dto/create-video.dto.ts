import { IsString, IsOptional, IsInt, Min, Max, MaxLength, IsIn, IsNotEmpty } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateVideoDto {
  @ApiProperty({ description: 'B站视频链接或BV号' })
  @IsString()
  @IsNotEmpty()
  url: string;

  @ApiPropertyOptional({ description: '自定义标题（留空则使用B站原始标题）', maxLength: 50 })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  customTitle?: string;

  @ApiPropertyOptional({ description: '排序值', default: 0 })
  @IsInt()
  @Min(0)
  @Max(9999)
  @IsOptional()
  order?: number = 0;

  @ApiPropertyOptional({ description: '状态', default: 'enabled' })
  @IsIn(['enabled', 'disabled'])
  @IsOptional()
  status?: string = 'enabled';
}
