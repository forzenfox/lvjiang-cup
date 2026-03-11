import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import AdminDashboard from '@/pages/admin/Dashboard';
import { mockService } from '@/mock/service';

describe('数据流集成测试', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('Dashboard 数据管理', () => {
    it('应该能够加载 Mock 数据', async () => {
      // 先清空数据
      await mockService.clearAllData();

      render(
        <BrowserRouter>
          <AdminDashboard />
        </BrowserRouter>
      );

      // 找到加载 Mock 数据按钮
      const loadButton = screen.getByText('加载 Mock 数据');
      expect(loadButton).toBeInTheDocument();

      // 点击按钮
      fireEvent.click(loadButton);

      // 等待确认对话框出现
      await waitFor(() => {
        expect(screen.getByText('确认加载 Mock 数据？')).toBeInTheDocument();
      });
    });

    it('应该能够清空所有数据', async () => {
      render(
        <BrowserRouter>
          <AdminDashboard />
        </BrowserRouter>
      );

      // 找到清空数据按钮
      const clearButton = screen.getByText('清空所有数据');
      expect(clearButton).toBeInTheDocument();

      // 点击按钮
      fireEvent.click(clearButton);

      // 等待确认对话框出现
      await waitFor(() => {
        expect(screen.getByText('确认清空所有数据？')).toBeInTheDocument();
      });
    });
  });

  describe('数据持久化集成', () => {
    it('localStorage 应该与 Mock Service 同步', async () => {
      // 添加测试数据
      await mockService.addTeam({
        id: 'test-team',
        name: 'Test Team',
        logo: 'test.png',
        description: 'Test',
        players: []
      });

      // 验证 localStorage
      const stored = localStorage.getItem('teams');
      expect(stored).toBeTruthy();

      const parsed = JSON.parse(stored!);
      const found = parsed.find((t: { id: string }) => t.id === 'test-team');
      expect(found).toBeDefined();
      expect(found.name).toBe('Test Team');
    });

    it('页面刷新后数据应该保持', async () => {
      // 添加测试数据
      await mockService.addTeam({
        id: 'persistent-team',
        name: 'Persistent Team',
        logo: 'test.png',
        description: 'Test',
        players: []
      });

      // 模拟页面刷新（重新加载数据）
      const teams = await mockService.getTeams();
      const found = teams.find(t => t.id === 'persistent-team');
      expect(found).toBeDefined();
      expect(found?.name).toBe('Persistent Team');
    });
  });

  describe('数据操作集成', () => {
    it('应该能够完整执行 CRUD 操作', async () => {
      // Create
      const newTeam = await mockService.addTeam({
        id: 'crud-test',
        name: 'CRUD Test',
        logo: 'test.png',
        description: 'Test',
        players: []
      });
      expect(newTeam.id).toBe('crud-test');

      // Read
      const teams = await mockService.getTeams();
      const found = teams.find(t => t.id === 'crud-test');
      expect(found).toBeDefined();

      // Update
      const updated = await mockService.updateTeam({
        ...found!,
        name: 'Updated Name'
      });
      expect(updated.name).toBe('Updated Name');

      // Delete
      await mockService.deleteTeam('crud-test');
      const remainingTeams = await mockService.getTeams();
      expect(remainingTeams.find(t => t.id === 'crud-test')).toBeUndefined();
    });

    it('resetAllData 应该恢复所有数据', async () => {
      // 先删除一些数据
      const teams = await mockService.getTeams();
      await mockService.deleteTeam(teams[0].id);

      // 重置数据
      await mockService.resetAllData();

      // 验证数据已恢复
      const restoredTeams = await mockService.getTeams();
      expect(restoredTeams.length).toBe(8); // 初始有 8 支战队
    });
  });
});
