import { IsString, IsOptional, MaxLength, IsIn, IsNotEmpty } from 'class-validator';
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

  @ApiPropertyOptional({ description: '状态', default: 'enabled' })
  @IsIn(['enabled', 'disabled'])
  @IsOptional()
  status?: string = 'enabled';
}
