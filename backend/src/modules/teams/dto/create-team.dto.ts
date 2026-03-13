import { IsString, IsOptional, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class CreatePlayerDto {
  @ApiProperty({ description: '队员ID' })
  @IsString()
  id: string;

  @ApiProperty({ description: '队员名称' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: '队员头像URL' })
  @IsString()
  @IsOptional()
  avatar?: string;

  @ApiProperty({ description: '位置', enum: ['top', 'jungle', 'mid', 'bot', 'support'] })
  @IsString()
  position: 'top' | 'jungle' | 'mid' | 'bot' | 'support';
}

export class CreateTeamDto {
  @ApiProperty({ description: '战队ID' })
  @IsString()
  id: string;

  @ApiProperty({ description: '战队名称' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: '战队Logo URL' })
  @IsString()
  @IsOptional()
  logo?: string;

  @ApiPropertyOptional({ description: '战队描述' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ description: '队员列表', type: [CreatePlayerDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreatePlayerDto)
  @IsOptional()
  players?: CreatePlayerDto[];
}
