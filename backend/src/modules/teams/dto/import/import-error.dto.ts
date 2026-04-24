import { ApiProperty } from '@nestjs/swagger';

export class ImportErrorDto {
  @ApiProperty({ description: '错误所在行' })
  row: number;

  @ApiProperty({ description: '战队名称' })
  teamName: string;

  @ApiProperty({ description: '位置' })
  position: string;

  @ApiProperty({ description: '错误字段' })
  field: string;

  @ApiProperty({ description: '错误信息' })
  message: string;

  constructor(row: number, teamName: string, position: string, field: string, message: string) {
    this.row = row;
    this.teamName = teamName;
    this.position = position;
    this.field = field;
    this.message = message;
  }
}
