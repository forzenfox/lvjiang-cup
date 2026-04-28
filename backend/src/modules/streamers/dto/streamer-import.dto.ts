export class ImportStreamerDto {
  rowIndex: number;
  nickname: string;
  streamerType: 'internal' | 'guest';
  posterUrl: string;
  liveUrl: string;
  bio: string;
}

export class ImportErrorDto {
  constructor(
    public row: number,
    public nickname: string,
    public field: string,
    public message: string,
  ) {}
}

export class ImportResultDto {
  constructor(
    public total: number,
    public created: number,
    public failed: number,
    public errors: ImportErrorDto[],
    public externalUrlItems: string[],
  ) {}
}
