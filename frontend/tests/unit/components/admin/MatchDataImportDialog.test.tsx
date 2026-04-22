import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import MatchDataImportDialog from '@/components/admin/MatchDataImportDialog';
import * as matchDataApi from '@/api/matchData';

// Mock API
vi.mock('@/api/matchData', () => ({
  importMatchData: vi.fn(),
}));

// Mock toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    loading: vi.fn(),
    dismiss: vi.fn(),
  },
}));

const mockMatchId = 'test-match-123';

const defaultProps = {
  open: true,
  onClose: vi.fn(),
  onSuccess: vi.fn(),
  matchId: mockMatchId,
};

describe('MatchDataImportDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders nothing when open is false', () => {
    render(<MatchDataImportDialog {...defaultProps} open={false} />);
    expect(screen.queryByText(/导入比赛数据/i)).not.toBeInTheDocument();
  });

  it('renders dialog when open is true', () => {
    render(<MatchDataImportDialog {...defaultProps} />);
    expect(screen.getByText(/导入比赛数据/i)).toBeInTheDocument();
  });

  it('shows file validation error for invalid file type', () => {
    render(<MatchDataImportDialog {...defaultProps} />);

    const file = new File(['test'], 'test.pdf', { type: 'application/pdf' });

    // Simulate file selection through input
    const dataTransfer = {
      files: [file],
      items: [],
      types: ['Files'],
    };

    fireEvent.drop(screen.getByText(/拖拽文件到此处/i).parentElement!, {
      dataTransfer,
    });

    expect(screen.getByText(/仅支持 \.xlsx 或 \.xls 格式的 Excel 文件/i)).toBeInTheDocument();
  });

  it('shows file validation error for file size over 10MB', () => {
    render(<MatchDataImportDialog {...defaultProps} />);

    const largeFile = new File([new ArrayBuffer(11 * 1024 * 1024)], 'test.xlsx', {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });

    fireEvent.drop(screen.getByText(/拖拽文件到此处/i).parentElement!, {
      dataTransfer: {
        files: [largeFile],
        items: [],
        types: ['Files'],
      },
    });

    expect(screen.getByText(/文件大小不能超过 10MB/i)).toBeInTheDocument();
  });

  it('accepts valid xlsx file and shows file info', () => {
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

    expect(screen.getByText('match-data.xlsx')).toBeInTheDocument();
  });

  it('removes selected file when remove button is clicked', () => {
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

    const removeButton = screen.getByLabelText('移除文件');
    fireEvent.click(removeButton);

    expect(screen.getByText(/拖拽文件到此处/i)).toBeInTheDocument();
  });

  it('calls importMatchData API when upload button is clicked', async () => {
    const mockImportResult = {
      imported: true,
      gameNumber: 1,
      playerCount: 10,
    };

    vi.mocked(matchDataApi.importMatchData).mockResolvedValue(mockImportResult);

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
      expect(matchDataApi.importMatchData).toHaveBeenCalledWith(mockMatchId, validFile);
    });
  });

  it('calls onSuccess callback after successful import and confirm', async () => {
    const mockImportResult = {
      imported: true,
      gameNumber: 1,
      playerCount: 10,
    };

    vi.mocked(matchDataApi.importMatchData).mockResolvedValue(mockImportResult);

    const onSuccess = vi.fn();
    render(<MatchDataImportDialog {...defaultProps} onSuccess={onSuccess} />);

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

    // After successful import, preview appears - click confirm
    await waitFor(() => {
      expect(screen.getByText(/导入预览/i)).toBeInTheDocument();
    });

    const confirmButton = screen.getByText(/确认导入/i);
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalledWith(mockImportResult);
    });
  });

  it('shows error message when import fails', async () => {
    vi.mocked(matchDataApi.importMatchData).mockRejectedValue(new Error('导入失败'));

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
      expect(screen.getByText('导入失败')).toBeInTheDocument();
    });
  });

  it('calls onClose when cancel button is clicked', () => {
    render(<MatchDataImportDialog {...defaultProps} />);

    const cancelButton = screen.getByText('取消');
    fireEvent.click(cancelButton);

    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it('handles drag over and drag leave events', () => {
    render(<MatchDataImportDialog {...defaultProps} />);

    const dropZone = screen.getByText(/拖拽文件到此处/i).parentElement!;

    fireEvent.dragOver(dropZone);
    expect(dropZone).toHaveClass('border-blue-500');

    fireEvent.dragLeave(dropZone);
    expect(dropZone).toHaveClass('border-gray-600');
  });
});
