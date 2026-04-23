import { IsArray, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SortVideosDto {
  @ApiProperty({ description: '排序后的视频ID数组', type: [String] })
  @IsNotEmpty()
  @IsArray()
  @IsString({ each: true })
  orderedIds: string[];
}
