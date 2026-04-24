import { ApiProperty } from '@nestjs/swagger';

export class Stream {
  @ApiProperty({ description: '直播ID' })
  id: string;

  @ApiProperty({ description: '直播标题' })
  title: string;

  @ApiProperty({ description: '直播URL' })
  url: string;

  @ApiProperty({ description: '是否直播中' })
  isLive: boolean;

  @ApiProperty({ description: '创建时间' })
  createdAt: string;

  @ApiProperty({ description: '更新时间' })
  updatedAt: string;
}
