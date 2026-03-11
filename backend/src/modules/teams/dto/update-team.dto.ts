import { IsString, IsOptional, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

class UpdatePlayerDto {
  @ApiPropertyOptional({ description: '队员ID' })
  @IsString()
  @IsOptional()
  id?: string;

  @ApiPropertyOptional({ description: '队员名称' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ description: '队员头像URL' })
  @IsString()
  @IsOptional()
  avatar?: string;

  @ApiPropertyOptional({ description: '位置', enum: ['上单', '打野', '中单', 'AD', '辅助'] })
  @IsString()
  @IsOptional()
  position?: '上单' | '打野' | '中单' | 'AD' | '辅助';
}

export class UpdateTeamDto {
  @ApiPropertyOptional({ description: '战队名称' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ description: '战队Logo URL' })
  @IsString()
  @IsOptional()
  logo?: string;

  @ApiPropertyOptional({ description: '战队描述' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ description: '队员列表', type: [UpdatePlayerDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdatePlayerDto)
  @IsOptional()
  players?: UpdatePlayerDto[];
}
