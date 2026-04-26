import { HttpException } from '@nestjs/common';

/**
 * 局数不一致告警项类型
 * 用于描述 Sheet 局数与 Excel 局数不匹配的具体信息
 */
export interface GameNumberMismatchWarningItem {
  /** Sheet名称 */
  sheetName: string;
  /** Sheet中的局数 */
  sheetGameNumber: number;
  /** Excel中声明的局数 */
  excelGameNumber: number;
  /** 解析后使用的局数 */
  resolvedGameNumber: number;
  /** 告警描述信息 */
  message: string;
}

/**
 * 统一响应格式接口
 * 所有自定义异常的响应体都遵循此格式
 */
export interface MatchDataErrorResponse {
  /** 业务错误码 */
  code: number;
  /** 错误消息 */
  message: string;
  /** 详细错误列表（可选） */
  errors?: string[];
  /** 附加数据（可选） */
  data?: any;
}

/**
 * 未找到有效的Sheet异常
 * 当Excel文件中没有符合"第X局"格式命名的Sheet时抛出
 * 错误码：40013，HTTP状态码：400
 */
export class NoValidSheetException extends HttpException {
  constructor() {
    const response: MatchDataErrorResponse = {
      code: 40013,
      message: '未找到有效的Sheet，Sheet名称须为"第X局"格式',
    };
    super(response, 400);
  }
}

/**
 * 局数重复异常
 * 当Excel中存在重复的局数时抛出
 * 错误码：40012，HTTP状态码：400
 */
export class DuplicateGameNumberException extends HttpException {
  /**
   * @param errors 重复局数的详细描述列表
   */
  constructor(errors: string[]) {
    const response: MatchDataErrorResponse = {
      code: 40012,
      message: '局数重复',
      errors,
    };
    super(response, 400);
  }
}

/**
 * 局数超出赛制限制异常
 * 当Excel中的局数超过了比赛赛制规定的最大局数时抛出
 * 错误码：40011，HTTP状态码：400
 */
export class GameNumberExceedFormatException extends HttpException {
  /**
   * @param errors 超出限制的局数详细描述列表
   */
  constructor(errors: string[]) {
    const response: MatchDataErrorResponse = {
      code: 40011,
      message: '局数超出赛制限制',
      errors,
    };
    super(response, 400);
  }
}

/**
 * 局数不一致告警
 * 当Sheet局数与Excel声明的局数不一致时抛出
 * 注意：这是告警而非错误，HTTP状态码为200，前端根据code判断是否需要用户确认
 * 错误码：40010，HTTP状态码：200
 */
export class GameNumberMismatchWarning extends HttpException {
  /**
   * @param warnings 局数不一致的详细告警列表
   */
  constructor(warnings: GameNumberMismatchWarningItem[]) {
    const response: MatchDataErrorResponse = {
      code: 40010,
      message: '局数不一致，请确认是否继续导入',
      data: warnings,
    };
    super(response, 200);
  }
}

/**
 * 对战尚未结束异常
 * 当尝试下载尚未结束的对战模板时抛出
 * 错误码：40020，HTTP状态码：400
 */
export class MatchNotFinishedException extends HttpException {
  constructor() {
    const response: MatchDataErrorResponse = {
      code: 40020,
      message: '对战尚未结束，无法下载模板',
    };
    super(response, 400);
  }
}

/**
 * 对战比分无效异常
 * 当对战比分数据不符合规则时抛出
 * 错误码：40021，HTTP状态码：400
 */
export class InvalidScoreException extends HttpException {
  /**
   * @param errors 比分无效的详细描述列表
   */
  constructor(errors: string[]) {
    const response: MatchDataErrorResponse = {
      code: 40021,
      message: '对战比分无效',
      errors,
    };
    super(response, 400);
  }
}

/**
 * Excel数据格式错误异常
 * 当Excel文件中的数据格式不符合要求时抛出（如行数不足、行为空等）
 * 错误码：40014，HTTP状态码：400
 */
export class ExcelDataFormatException extends HttpException {
  constructor(errors: string[]) {
    const response: MatchDataErrorResponse = {
      code: 40014,
      message: 'Excel数据格式错误',
      errors,
    };
    super(response, 400);
  }
}

/**
 * Excel数据验证失败异常
 * 当Excel中的数据内容验证不通过时抛出（如战队名为空、选手昵称为空等）
 * 错误码：40015，HTTP状态码：400
 */
export class ExcelDataValidationException extends HttpException {
  constructor(message: string, errors: string[]) {
    const response: MatchDataErrorResponse = {
      code: 40015,
      message,
      errors,
    };
    super(response, 400);
  }
}
