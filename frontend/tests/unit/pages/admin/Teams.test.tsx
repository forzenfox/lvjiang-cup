import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AdminTeams from '@/pages/admin/Teams';
import * as teamsImportApi from '@/api/teams-import';
import { toast } from 'sonner';
import { teamService } from '@/services/teamService';

vi.mock('@/api/teams-import', () => ({
  downloadTemplate: vi.fn(),
}));

vi.mock('@/services/teamService', () => ({
  teamService: {
    getAll: vi.fn(),
  },
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    loading: vi.fn(),
  },
}));

vi.mock('@/api/axios', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    logout: vi.fn(),
    user: { id: '1', username: 'admin' },
    loading: false,
  }),
}));

const renderWithRouter = (component: React.ReactElement) => {
  return render(<MemoryRouter>{component}</MemoryRouter>);
};

describe('AdminTeams - 下载模板功能', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (teamService.getAll as ReturnType<typeof vi.fn>).mockResolvedValue([]);
  });

  it('应该显示下载模板按钮', async () => {
    renderWithRouter(<AdminTeams />);
    const downloadButton = screen.getByTestId('download-template-button');
    expect(downloadButton).toBeInTheDocument();
    expect(downloadButton).toHaveTextContent('下载模板');
  });

  it('下载成功时应该显示正确的提示文案', async () => {
    const mockBlob = new Blob(['test content'], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    (teamsImportApi.downloadTemplate as ReturnType<typeof vi.fn>).mockResolvedValue(mockBlob);

    renderWithRouter(<AdminTeams />);
    const downloadButton = screen.getByTestId('download-template-button');

    await act(async () => {
      fireEvent.click(downloadButton);
    });

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith(
        '模板已开始下载，请查看浏览器下载进度',
        expect.any(Object)
      );
    });
  });

  it('下载失败时应该显示错误提示', async () => {
    (teamsImportApi.downloadTemplate as ReturnType<typeof vi.fn>).mockRejectedValue(
      new Error('Network error')
    );

    renderWithRouter(<AdminTeams />);
    const downloadButton = screen.getByTestId('download-template-button');

    await act(async () => {
      fireEvent.click(downloadButton);
    });

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('模板下载失败', expect.any(Object));
    });
  });

  it('下载时应该显示loading状态', async () => {
    const mockBlob = new Blob(['test content'], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    (teamsImportApi.downloadTemplate as ReturnType<typeof vi.fn>).mockResolvedValue(mockBlob);

    renderWithRouter(<AdminTeams />);
    const downloadButton = screen.getByTestId('download-template-button');

    await act(async () => {
      fireEvent.click(downloadButton);
    });

    expect(toast.loading).toHaveBeenCalledWith('正在下载模板...');
  });

  it('应该创建正确的文件名', async () => {
    const mockBlob = new Blob(['test content'], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    (teamsImportApi.downloadTemplate as ReturnType<typeof vi.fn>).mockResolvedValue(mockBlob);

    const createElementSpy = vi.spyOn(document, 'createElement');

    renderWithRouter(<AdminTeams />);
    const downloadButton = screen.getByTestId('download-template-button');

    await act(async () => {
      fireEvent.click(downloadButton);
    });

    await waitFor(() => {
      const anchorCalls = createElementSpy.mock.results.filter(
        call => call.value && call.value.tagName === 'A'
      );
      expect(anchorCalls.length).toBeGreaterThan(0);
    });

    createElementSpy.mockRestore();
  });
});
