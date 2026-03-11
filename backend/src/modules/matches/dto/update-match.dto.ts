import { IsString, IsOptional, IsNumber, IsEnum } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export enum MatchStatus {
  UPCOMING = 'upcoming',
  ONGOING = 'ongoing',
  FINISHED = 'finished',
}

export class UpdateMatchDto {
  @ApiPropertyOptional({ description: '战队A ID' })
  @IsString()
  @IsOptional()
  teamAId?: string;

  @ApiPropertyOptional({ description: '战队B ID' })
  @IsString()
  @IsOptional()
  teamBId?: string;

  @ApiPropertyOptional({ description: '战队A比分' })
  @IsNumber()
  @IsOptional()
  scoreA?: number;

  @ApiPropertyOptional({ description: '战队B比分' })
  @IsNumber()
  @IsOptional()
  scoreB?: number;

  @ApiPropertyOptional({ description: '获胜方ID' })
  @IsString()
  @IsOptional()
  winnerId?: string;

  @ApiPropertyOptional({ description: '比赛状态', enum: MatchStatus })
  @IsEnum(MatchStatus)
  @IsOptional()
  status?: MatchStatus;

  @ApiPropertyOptional({ description: '开始时间' })
  @IsString()
  @IsOptional()
  startTime?: string;
}
