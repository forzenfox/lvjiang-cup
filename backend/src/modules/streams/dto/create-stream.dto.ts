import { IsString, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateStreamDto {
  @ApiProperty({ description: '直播标题' })
  @IsString()
  title: string;

  @ApiProperty({ description: '直播URL' })
  @IsString()
  url: string;

  @ApiPropertyOptional({ description: '是否直播中' })
  @IsBoolean()
  @IsOptional()
  isLive?: boolean;
}
