import { IsArray, IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateAdvancementDto {
  @ApiPropertyOptional({ description: '2-0 胜者组', type: [String] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  winners2_0?: string[];

  @ApiPropertyOptional({ description: '2-1 胜者组', type: [String] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  winners2_1?: string[];

  @ApiPropertyOptional({ description: '败者组', type: [String] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  losersBracket?: string[];

  @ApiPropertyOptional({ description: '第三名淘汰', type: [String] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  eliminated3rd?: string[];

  @ApiPropertyOptional({ description: '0-3 淘汰', type: [String] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  eliminated0_3?: string[];
}
