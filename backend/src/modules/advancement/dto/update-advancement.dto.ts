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

  @ApiPropertyOptional({ description: '2-0 战绩晋级', type: [String] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  winners2_0?: string[];

  @ApiPropertyOptional({ description: '2-1 战绩晋级', type: [String] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  winners2_1?: string[];

  @ApiPropertyOptional({ description: '败者组', type: [String] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  losersBracket?: string[];

  @ApiPropertyOptional({ description: '0-3 战绩淘汰', type: [String] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  eliminated0_3?: string[];

  @ApiPropertyOptional({ description: '淘汰并列为第三', type: [String] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  eliminated3rd?: string[];
}
