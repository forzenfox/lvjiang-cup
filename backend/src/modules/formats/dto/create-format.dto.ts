import { IsObject, IsOptional, IsString } from 'class-validator';
import { FormatConfig } from '../format.types';

/** 创建/编辑赛制配置 DTO（结构合法性由 validateFormat 完成，此处仅最简校验） */
export class CreateFormatDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsObject()
  config: FormatConfig;
}
