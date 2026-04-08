import {
  IsString,
  IsOptional,
  IsArray,
  ValidateNested,
  IsNumber,
  IsBoolean,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class CreateMemberDto {
  @ApiProperty({ description: '成员ID' })
  @IsString()
  id: string;

  @ApiPropertyOptional({ description: '用户ID' })
  @IsNumber()
  @IsOptional()
  userId?: number;

  @ApiProperty({ description: '昵称' })
  @IsString()
  nickname: string;

  @ApiPropertyOptional({ description: '头像URL' })
  @IsString()
  @IsOptional()
  avatarUrl?: string;

  @ApiProperty({ description: '位置', enum: ['TOP', 'JUNGLE', 'MID', 'ADC', 'SUPPORT'] })
  @IsString()
  position: 'TOP' | 'JUNGLE' | 'MID' | 'ADC' | 'SUPPORT';

  @ApiPropertyOptional({ description: '游戏ID' })
  @IsString()
  @IsOptional()
  gameId?: string;

  @ApiPropertyOptional({ description: '个人简介' })
  @IsString()
  @IsOptional()
  bio?: string;

  @ApiPropertyOptional({ description: '英雄池' })
  @IsArray()
  @IsOptional()
  championPool?: string[];

  @ApiPropertyOptional({ description: 'rating' })
  @IsNumber()
  @IsOptional()
  rating?: number;

  @ApiPropertyOptional({ description: '是否为队长' })
  @IsBoolean()
  @IsOptional()
  isCaptain?: boolean;

  @ApiPropertyOptional({ description: '直播URL' })
  @IsString()
  @IsOptional()
  liveUrl?: string;

  @ApiPropertyOptional({ description: '排序顺序' })
  @IsNumber()
  @IsOptional()
  sortOrder?: number;
}

export class CreateTeamDto {
  @ApiPropertyOptional({ description: '战队ID (可选，不传则由后端生成UUID)' })
  @IsString()
  @IsOptional()
  id?: string;

  @ApiProperty({ description: '战队名称' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: '战队Logo URL' })
  @IsString()
  @IsOptional()
  logo?: string;

  @ApiPropertyOptional({ description: '战队Logo URL (新)' })
  @IsString()
  @IsOptional()
  logoUrl?: string;

  @ApiPropertyOptional({ description: '战队Logo缩略图URL' })
  @IsString()
  @IsOptional()
  logoThumbnailUrl?: string;

  @ApiPropertyOptional({ description: '战队口号' })
  @IsString()
  @IsOptional()
  battleCry?: string;

  @ApiPropertyOptional({ description: '成员列表', type: [CreateMemberDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateMemberDto)
  @IsOptional()
  members?: CreateMemberDto[];

  @ApiPropertyOptional({ description: '成员列表 (旧字段，为兼容)', type: [CreateMemberDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateMemberDto)
  @IsOptional()
  players?: CreateMemberDto[];
}
