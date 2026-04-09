import { IsArray, IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateAdvancementDto {
  @ApiPropertyOptional({ description: '前8名晋级淘汰赛', type: [String] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  top8?: string[];

  @ApiPropertyOptional({ description: '被淘汰队伍', type: [String] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  eliminated?: string[];
}
