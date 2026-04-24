import { ApiProperty } from '@nestjs/swagger';

export class ImportMatchDataDto {
  @ApiProperty({
    description: 'Excel文件（.xlsx格式）',
    type: 'string',
    format: 'binary',
  })
  file: Express.Multer.File;
}
