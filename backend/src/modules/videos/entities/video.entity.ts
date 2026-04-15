import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class Video {
  @ApiProperty({ description: '视频ID' })
  id: string;

  @ApiPropertyOptional({ description: 'B站视频BV号' })
  bvid: string;

  @ApiPropertyOptional({ description: 'B站原始标题' })
  bilibiliTitle?: string;

  @ApiPropertyOptional({ description: '自定义标题' })
  customTitle?: string;

  @ApiProperty({ description: '显示标题（customTitle || bilibiliTitle || 未命名视频）' })
  title: string;

  @ApiPropertyOptional({ description: '封面URL' })
  coverUrl?: string;

  @ApiProperty({ description: '排序值' })
  order: number;

  @ApiProperty({ description: '状态' })
  status: string;

  @ApiProperty({ description: '是否启用' })
  isEnabled: boolean;

  @ApiProperty({ description: '创建时间' })
  createdAt: string;

  @ApiProperty({ description: '更新时间' })
  updatedAt: string;

  @ApiProperty({ description: '创建人' })
  createdBy: string;
}
