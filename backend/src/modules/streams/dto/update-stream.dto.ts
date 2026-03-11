import { IsString, IsOptional, IsBoolean } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateStreamDto {
  @ApiPropertyOptional({ description: '直播标题' })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional({ description: '直播URL' })
  @IsString()
  @IsOptional()
  url?: string;

  @ApiPropertyOptional({ description: '是否直播中' })
  @IsBoolean()
  @IsOptional()
  isLive?: boolean;
}
