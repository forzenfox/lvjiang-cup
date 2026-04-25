import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import MatchDataImportDialog from '@/components/admin/MatchDataImportDialog';
import * as matchDataApi from '@/api/matchData';
import { AxiosError } from 'axios';

// Mock API
vi.mock('@/api/matchData', () => ({
  importMatchData: vi.fn(),
  downloadMatchDataErrorReport: vi.fn(),
}));

// Mock toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    loading: vi.fn(() => 'toast-id'),
    warning: vi.fn(),
    dismiss: vi.fn(),
  },
}));

// Mock tracking
vi.mock('@/utils/tracking', () => ({
  trackAdminImportStart: vi.fn(),
  trackAdminImportSuccess: vi.fn(),
}));

const mockMatchId = 'test-match-123';

const defaultProps = {
  open: true,
  onClose: vi.fn(),
  onSuccess: vi.fn(),
  matchId: mockMatchId,
};

describe('MatchDataImportDialog - Validation Error Display', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  /**
   * 测试场景：后端返回验证错误数组时，前端应显示详细的错误信息
   */
  it('should display detailed validation errors when backend returns errors array', async () => {
    // 构建模拟的 Axios 错误响应，包含详细的验证错误
    const validationError = new Error('Match info validation failed') as AxiosError;
    validationError.response = {
      data: {
        code: 40001,
        message: 'Match info validation failed',
        errors: ['红方战队名称不能为空', '蓝方战队名称不能为空', '局数必须在1-5之间'],
      },
      status: 400,
      statusText: 'Bad Request',
      headers: {},
      config: {} as any,
    };

    vi.mocked(matchDataApi.importMatchData).mockRejectedValue(validationError);

    render(<MatchDataImportDialog {...defaultProps} />);

    // 上传文件
    const validFile = new File(['test content'], 'match-data.xlsx', {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });

    const dropZone = screen.getByText(/拖拽文件到此处/i).parentElement!;
    fireEvent.drop(dropZone, {
      dataTransfer: {
        files: [validFile],
        items: [],
        types: ['Files'],
      },
    });

    // 点击导入按钮
    const uploadButton = screen.getByText(/开始导入/i);
    fireEvent.click(uploadButton);

    // 验证详细的错误信息是否显示
    await waitFor(() => {
      expect(screen.getByText(/红方战队名称不能为空/i)).toBeInTheDocument();
      expect(screen.getByText(/蓝方战队名称不能为空/i)).toBeInTheDocument();
      expect(screen.getByText(/局数必须在1-5之间/i)).toBeInTheDocument();
    });

    // 验证错误标题显示
    expect(screen.getByText(/验证错误/i)).toBeInTheDocument();
  });

  /**
   * 测试场景：后端返回战队名称不匹配错误
   */
  it('should display team name mismatch errors correctly', async () => {
    const validationError = new Error('战队名称不匹配') as AxiosError;
    validationError.response = {
      data: {
        code: 40001,
        message: '战队名称不匹配',
        errors: [
          'Excel中的红方战队名"RNG"与所选对战中的战队名称不匹配。所选对战为：T1 vs GEN',
          'Excel中的蓝方战队名"FPX"与所选对战中的战队名称不匹配。所选对战为：T1 vs GEN',
        ],
      },
      status: 400,
      statusText: 'Bad Request',
      headers: {},
      config: {} as any,
    };

    vi.mocked(matchDataApi.importMatchData).mockRejectedValue(validationError);

    render(<MatchDataImportDialog {...defaultProps} />);

    const validFile = new File(['test content'], 'match-data.xlsx', {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });

    const dropZone = screen.getByText(/拖拽文件到此处/i).parentElement!;
    fireEvent.drop(dropZone, {
      dataTransfer: {
        files: [validFile],
        items: [],
        types: ['Files'],
      },
    });

    const uploadButton = screen.getByText(/开始导入/i);
    fireEvent.click(uploadButton);

    await waitFor(() => {
      // 验证错误列表已显示
      expect(screen.getByText(/验证错误.*2 个问题/i)).toBeInTheDocument();
      // 验证详细错误信息显示
      const errorList = screen.getAllByText(/战队名称不匹配/i);
      expect(errorList.length).toBeGreaterThan(0);
    });
  });

  /**
   * 测试场景：后端返回选手数据验证错误
   */
  it('should display player stats validation errors correctly', async () => {
    const validationError = new Error('Player stats validation failed') as AxiosError;
    validationError.response = {
      data: {
        code: 40001,
        message: 'Player stats validation failed',
        errors: [
          '第7行: 选手昵称不能为空',
          '第7行: 使用英雄不能为空',
          '第8行: 击杀数不能为负数',
          '第9行: 等级必须在1-18之间',
        ],
      },
      status: 400,
      statusText: 'Bad Request',
      headers: {},
      config: {} as any,
    };

    vi.mocked(matchDataApi.importMatchData).mockRejectedValue(validationError);

    render(<MatchDataImportDialog {...defaultProps} />);

    const validFile = new File(['test content'], 'match-data.xlsx', {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });

    const dropZone = screen.getByText(/拖拽文件到此处/i).parentElement!;
    fireEvent.drop(dropZone, {
      dataTransfer: {
        files: [validFile],
        items: [],
        types: ['Files'],
      },
    });

    const uploadButton = screen.getByText(/开始导入/i);
    fireEvent.click(uploadButton);

    await waitFor(() => {
      expect(screen.getByText(/第7行: 选手昵称不能为空/i)).toBeInTheDocument();
      expect(screen.getByText(/第8行: 击杀数不能为负数/i)).toBeInTheDocument();
      expect(screen.getByText(/第9行: 等级必须在1-18之间/i)).toBeInTheDocument();
    });
  });

  /**
   * 测试场景：后端返回英雄名称验证错误
   */
  it('should display champion name validation errors correctly', async () => {
    const validationError = new Error('英雄名称验证失败') as AxiosError;
    validationError.response = {
      data: {
        code: 40002,
        message: '英雄名称验证失败',
        errors: [
          '红方BAN1英雄"亚索特"不存在，请检查英雄名称',
          '蓝方BAN3英雄"盖伦斯"不存在，请检查英雄名称',
          '第7行选手"Faker"使用的英雄"李青儿"不存在，请检查英雄名称',
        ],
      },
      status: 400,
      statusText: 'Bad Request',
      headers: {},
      config: {} as any,
    };

    vi.mocked(matchDataApi.importMatchData).mockRejectedValue(validationError);

    render(<MatchDataImportDialog {...defaultProps} />);

    const validFile = new File(['test content'], 'match-data.xlsx', {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });

    const dropZone = screen.getByText(/拖拽文件到此处/i).parentElement!;
    fireEvent.drop(dropZone, {
      dataTransfer: {
        files: [validFile],
        items: [],
        types: ['Files'],
      },
    });

    const uploadButton = screen.getByText(/开始导入/i);
    fireEvent.click(uploadButton);

    await waitFor(() => {
      expect(screen.getByText(/亚索特/i)).toBeInTheDocument();
      expect(screen.getByText(/盖伦斯/i)).toBeInTheDocument();
      expect(screen.getByText(/李青儿/i)).toBeInTheDocument();
    });
  });

  /**
   * 测试场景：普通错误（没有 errors 数组）应该正常显示
   */
  it('should display simple error message when no errors array is provided', async () => {
    const simpleError = new Error('网络连接失败') as AxiosError;
    simpleError.response = {
      data: {
        message: '网络连接失败',
      },
      status: 500,
      statusText: 'Internal Server Error',
      headers: {},
      config: {} as any,
    };

    vi.mocked(matchDataApi.importMatchData).mockRejectedValue(simpleError);

    render(<MatchDataImportDialog {...defaultProps} />);

    const validFile = new File(['test content'], 'match-data.xlsx', {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });

    const dropZone = screen.getByText(/拖拽文件到此处/i).parentElement!;
    fireEvent.drop(dropZone, {
      dataTransfer: {
        files: [validFile],
        items: [],
        types: ['Files'],
      },
    });

    const uploadButton = screen.getByText(/开始导入/i);
    fireEvent.click(uploadButton);

    await waitFor(() => {
      expect(screen.getByText(/网络连接失败/i)).toBeInTheDocument();
    });
  });
});
