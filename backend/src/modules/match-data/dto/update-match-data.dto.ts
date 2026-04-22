import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsNumber,
  IsBoolean,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class TeamStatsDto {
  @ApiProperty({ description: '战队ID' })
  @IsString()
  teamId: string;

  @ApiProperty({ description: '阵营 (blue/red)' })
  @IsString()
  side: string;

  @ApiProperty({ description: '击杀数' })
  @IsNumber()
  kills: number;

  @ApiProperty({ description: '死亡数' })
  @IsNumber()
  deaths: number;

  @ApiProperty({ description: '助攻数' })
  @IsNumber()
  assists: number;

  @ApiProperty({ description: '总经济' })
  @IsNumber()
  gold: number;

  @ApiProperty({ description: '推塔数' })
  @IsNumber()
  towers: number;

  @ApiProperty({ description: '控龙数' })
  @IsNumber()
  dragons: number;

  @ApiProperty({ description: '控Baron数' })
  @IsNumber()
  barons: number;

  @ApiProperty({ description: '是否一血' })
  @IsBoolean()
  firstBlood: boolean;
}

export class PlayerStatsDto {
  @ApiProperty({ description: '选手ID' })
  @IsString()
  playerId: string;

  @ApiProperty({ description: '战队ID' })
  @IsString()
  teamId: string;

  @ApiProperty({ description: '位置 (TOP/JUNGLE/MID/ADC/SUPPORT)' })
  @IsString()
  position: string;

  @ApiProperty({ description: '使用英雄' })
  @IsString()
  championName: string;

  @ApiProperty({ description: '击杀数' })
  @IsNumber()
  kills: number;

  @ApiProperty({ description: '死亡数' })
  @IsNumber()
  deaths: number;

  @ApiProperty({ description: '助攻数' })
  @IsNumber()
  assists: number;

  @ApiProperty({ description: '补刀数' })
  @IsNumber()
  cs: number;

  @ApiProperty({ description: '总经济' })
  @IsNumber()
  gold: number;

  @ApiProperty({ description: '造成伤害' })
  @IsNumber()
  damageDealt: number;

  @ApiProperty({ description: '承受伤害' })
  @IsNumber()
  damageTaken: number;

  @ApiProperty({ description: '视野得分' })
  @IsNumber()
  visionScore: number;

  @ApiProperty({ description: '插眼数' })
  @IsNumber()
  wardsPlaced: number;

  @ApiProperty({ description: '等级' })
  @IsNumber()
  level: number;

  @ApiPropertyOptional({ description: '是否一血' })
  @IsOptional()
  @IsBoolean()
  firstBlood?: boolean;

  @ApiPropertyOptional({ description: '是否MVP' })
  @IsOptional()
  @IsBoolean()
  mvp?: boolean;
}

export class UpdateMatchDataDto {
  @ApiProperty({ description: '获胜方战队ID（可选）' })
  @IsOptional()
  @IsString()
  winnerTeamId?: string;

  @ApiProperty({ description: '游戏时长 (MM:SS格式)' })
  @IsOptional()
  @IsString()
  gameDuration?: string;

  @ApiProperty({ description: '本局开始时间 (ISO 8601格式)' })
  @IsOptional()
  @IsString()
  gameStartTime?: string;

  @ApiProperty({ description: '蓝色方战队数据' })
  @IsOptional()
  @ValidateNested()
  @Type(() => TeamStatsDto)
  blueTeam?: TeamStatsDto;

  @ApiProperty({ description: '红色方战队数据' })
  @IsOptional()
  @ValidateNested()
  @Type(() => TeamStatsDto)
  redTeam?: TeamStatsDto;

  @ApiProperty({ description: '选手统计数据列表' })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PlayerStatsDto)
  playerStats?: PlayerStatsDto[];
}
