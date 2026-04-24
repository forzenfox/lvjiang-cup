import { IsString, IsOptional, IsBoolean, IsNotEmpty } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateStreamDto {
  @ApiProperty({ description: '直播标题' })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({ description: '直播URL' })
  @IsNotEmpty()
  @IsString()
  url: string;

  @ApiPropertyOptional({ description: '是否直播中' })
  @IsBoolean()
  @IsOptional()
  isLive?: boolean;
}
