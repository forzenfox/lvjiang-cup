import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ImportMemberDto } from './import-member.dto';

export { ImportMemberDto } from './import-member.dto';

export class ImportTeamDto {
  @ApiProperty({ description: '战队名称' })
  name: string;

  @ApiPropertyOptional({ description: '队标URL' })
  logoUrl?: string;

  @ApiPropertyOptional({ description: '参赛宣言' })
  battleCry?: string;

  @ApiProperty({ description: '队员列表', type: [ImportMemberDto] })
  members: ImportMemberDto[];
}
