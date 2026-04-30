import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import MatchEditDialog from '@/pages/admin/components/MatchEditDialog';
import type { Match, Team, SwissAdvancementResult } from '@/types';

const mockTeams: Team[] = [
  { id: 'team1', name: '驴酱', logo: '/logo1.png', players: [], battleCry: '测试队伍1' },
  { id: 'team2', name: '雨酱', logo: '/logo2.png', players: [], battleCry: '测试队伍2' },
  { id: 'team3', name: 'IC', logo: '/logo3.png', players: [], battleCry: '测试队伍3' },
  { id: 'team4', name: '小熊', logo: '/logo4.png', players: [], battleCry: '测试队伍4' },
  { id: 'team5', name: 'PLG', logo: '/logo5.png', players: [], battleCry: '测试队伍5' },
  { id: 'team6', name: '69', logo: '/logo6.png', players: [], battleCry: '测试队伍6' },
  { id: 'team7', name: '老虎', logo: '/logo7.png', players: [], battleCry: '测试队伍7' },
  { id: 'team8', name: '兔子', logo: '/logo8.png', players: [], battleCry: '测试队伍8' },
];

const createMockMatch = (id: string, teamAId: string, teamBId: string): Match => ({
  id,
  teamAId,
  teamBId,
  scoreA: 0,
  scoreB: 0,
  winnerId: null,
  round: 'QF1',
  status: 'upcoming',
  stage: 'elimination',
  startTime: '',
  eliminationBracket: 'quarterfinals',
});

const mockAdvancement: SwissAdvancementResult = {
  top8: ['team1', 'team2', 'team3', 'team4', 'team5', 'team6', 'team7', 'team8'],
  eliminated: [],
  rankings: [],
};

describe('MatchEditDialog', () => {
  it('应该渲染编辑弹框', () => {
    const match = createMockMatch('match-1', 'team1', 'team2');
    render(
      <MatchEditDialog
        match={match}
        teams={mockTeams}
        isOpen={true}
        onClose={() => {}}
        onSave={() => {}}
      />
    );

    expect(screen.getByText('编辑比赛')).toBeInTheDocument();
  });

  it('应该显示所有队伍当没有传入 advancement', () => {
    const match = createMockMatch('match-1', 'team1', 'team2');
    render(
      <MatchEditDialog
        match={match}
        teams={mockTeams}
        isOpen={true}
        onClose={() => {}}
        onSave={() => {}}
      />
    );

    // 验证所有队伍选项都存在（使用 getAllByText 因为队伍名称可能在两个下拉框中出现）
    mockTeams.forEach(team => {
      expect(screen.getAllByText(team.name).length).toBeGreaterThanOrEqual(1);
    });
  });

  it('应该只显示晋级成功的队伍', () => {
    const match = createMockMatch('match-1', 'team1', 'team2');
    const partialAdvancement: SwissAdvancementResult = {
      top8: ['team1', 'team2', 'team3', 'team4'],
      eliminated: ['team5', 'team6', 'team7', 'team8'],
      rankings: [],
    };

    render(
      <MatchEditDialog
        match={match}
        teams={mockTeams}
        isOpen={true}
        onClose={() => {}}
        onSave={() => {}}
        advancement={partialAdvancement}
      />
    );

    // 验证晋级队伍存在
    expect(screen.getAllByText('驴酱').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('雨酱').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('IC').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('小熊').length).toBeGreaterThanOrEqual(1);

    // 验证已淘汰队伍不存在
    expect(screen.queryByText('PLG')).not.toBeInTheDocument();
    expect(screen.queryByText('69')).not.toBeInTheDocument();
    expect(screen.queryByText('老虎')).not.toBeInTheDocument();
    expect(screen.queryByText('兔子')).not.toBeInTheDocument();
  });

  it('应该禁用同一轮次已选择的队伍', () => {
    const match = createMockMatch('match-3', '', '');
    const allMatches: Match[] = [
      createMockMatch('match-1', 'team1', 'team2'),
      createMockMatch('match-2', 'team3', 'team4'),
      match,
    ];

    render(
      <MatchEditDialog
        match={match}
        teams={mockTeams.filter(t => mockAdvancement.top8.includes(t.id))}
        isOpen={true}
        onClose={() => {}}
        onSave={() => {}}
        advancement={mockAdvancement}
        allMatches={allMatches}
        currentBracket="quarterfinals"
      />
    );

    // 获取所有 option 元素
    const options = screen.getAllByRole('option');

    // 验证已使用的队伍被禁用
    // 检查至少有一个版本被禁用
    const disabledTeam1Options = options.filter(
      opt => opt.textContent === '驴酱' && opt.hasAttribute('disabled')
    );
    const disabledTeam2Options = options.filter(
      opt => opt.textContent === '雨酱' && opt.hasAttribute('disabled')
    );
    const disabledTeam3Options = options.filter(
      opt => opt.textContent === 'IC' && opt.hasAttribute('disabled')
    );
    const disabledTeam4Options = options.filter(
      opt => opt.textContent === '小熊' && opt.hasAttribute('disabled')
    );

    expect(disabledTeam1Options.length).toBeGreaterThan(0);
    expect(disabledTeam2Options.length).toBeGreaterThan(0);
    expect(disabledTeam3Options.length).toBeGreaterThan(0);
    expect(disabledTeam4Options.length).toBeGreaterThan(0);
  });

  it('应该允许选择当前比赛已选择的队伍（编辑模式）', () => {
    const match = createMockMatch('match-1', 'team1', 'team2');
    const allMatches: Match[] = [match, createMockMatch('match-2', 'team3', 'team4')];

    render(
      <MatchEditDialog
        match={match}
        teams={mockTeams.filter(t => mockAdvancement.top8.includes(t.id))}
        isOpen={true}
        onClose={() => {}}
        onSave={() => {}}
        advancement={mockAdvancement}
        allMatches={allMatches}
        currentBracket="quarterfinals"
      />
    );

    // 获取所有 option 元素
    const options = screen.getAllByRole('option');

    // 验证当前比赛的队伍未被禁用（至少有一个版本可选）
    const enabledTeam1Options = options.filter(
      opt => opt.textContent === '驴酱' && !opt.hasAttribute('disabled')
    );
    const enabledTeam2Options = options.filter(
      opt => opt.textContent === '雨酱' && !opt.hasAttribute('disabled')
    );

    // team1 在队伍 A 下拉框中应该可选
    expect(enabledTeam1Options.length).toBeGreaterThan(0);
    // team2 在队伍 B 下拉框中应该可选
    expect(enabledTeam2Options.length).toBeGreaterThan(0);

    // 验证其他比赛的队伍在所有下拉框中都被禁用
    const enabledTeam3Options = options.filter(
      opt => opt.textContent === 'IC' && !opt.hasAttribute('disabled')
    );
    const enabledTeam4Options = options.filter(
      opt => opt.textContent === '小熊' && !opt.hasAttribute('disabled')
    );

    expect(enabledTeam3Options.length).toBe(0);
    expect(enabledTeam4Options.length).toBe(0);
  });

  it('应该在不同轮次中允许选择队伍', () => {
    const match = createMockMatch('match-4', 'team5', 'team6');
    match.eliminationBracket = 'semifinals';

    const allMatches: Match[] = [
      createMockMatch('match-1', 'team1', 'team2'),
      createMockMatch('match-2', 'team3', 'team4'),
      createMockMatch('match-3', '', ''),
      match,
    ];

    render(
      <MatchEditDialog
        match={match}
        teams={mockTeams.filter(t => mockAdvancement.top8.includes(t.id))}
        isOpen={true}
        onClose={() => {}}
        onSave={() => {}}
        advancement={mockAdvancement}
        allMatches={allMatches}
        currentBracket="semifinals"
      />
    );

    // 获取所有 option 元素
    const options = screen.getAllByRole('option');

    // 四分之一决赛的队伍在半决赛中应该可选
    const enabledTeam1Options = options.filter(
      opt => opt.textContent === '驴酱' && !opt.hasAttribute('disabled')
    );
    const enabledTeam2Options = options.filter(
      opt => opt.textContent === '雨酱' && !opt.hasAttribute('disabled')
    );
    const enabledTeam3Options = options.filter(
      opt => opt.textContent === 'IC' && !opt.hasAttribute('disabled')
    );
    const enabledTeam4Options = options.filter(
      opt => opt.textContent === '小熊' && !opt.hasAttribute('disabled')
    );

    expect(enabledTeam1Options.length).toBeGreaterThan(0);
    expect(enabledTeam2Options.length).toBeGreaterThan(0);
    expect(enabledTeam3Options.length).toBeGreaterThan(0);
    expect(enabledTeam4Options.length).toBeGreaterThan(0);
  });

  it('应该在晋级名单为空时不报错且下拉框无队伍', () => {
    const match = createMockMatch('match-1', '', '');
    const emptyAdvancement: SwissAdvancementResult = {
      top8: [],
      eliminated: ['team1', 'team2', 'team3', 'team4', 'team5', 'team6', 'team7', 'team8'],
      rankings: [],
    };

    // 验证渲染不报错
    render(
      <MatchEditDialog
        match={match}
        teams={mockTeams}
        isOpen={true}
        onClose={() => {}}
        onSave={() => {}}
        advancement={emptyAdvancement}
      />
    );

    // 验证弹框正常显示
    expect(screen.getByText('编辑比赛')).toBeInTheDocument();

    // 获取所有 option 元素
    const options = screen.getAllByRole('option');

    // 应该只有"选择队伍"占位符，没有具体队伍选项
    // 队伍名称不应该出现在下拉框中
    expect(screen.queryByText('驴酱')).not.toBeInTheDocument();
    expect(screen.queryByText('雨酱')).not.toBeInTheDocument();
    expect(screen.queryByText('IC')).not.toBeInTheDocument();

    // 验证只有两个下拉框的占位符（"选择队伍"）
    const placeholderOptions = options.filter(opt => opt.textContent === '选择队伍');
    expect(placeholderOptions.length).toBe(2);
  });

  it('应该在晋级名单部分为空时正常显示剩余队伍', () => {
    const match = createMockMatch('match-1', 'team1', '');
    const partialAdvancement: SwissAdvancementResult = {
      top8: ['team1', 'team2'],
      eliminated: ['team3', 'team4', 'team5', 'team6', 'team7', 'team8'],
      rankings: [],
    };

    render(
      <MatchEditDialog
        match={match}
        teams={mockTeams}
        isOpen={true}
        onClose={() => {}}
        onSave={() => {}}
        advancement={partialAdvancement}
      />
    );

    // 验证弹框正常显示
    expect(screen.getByText('编辑比赛')).toBeInTheDocument();

    // 验证只有晋级队伍显示
    expect(screen.getAllByText('驴酱').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('雨酱').length).toBeGreaterThanOrEqual(1);

    // 验证未晋级队伍不显示
    expect(screen.queryByText('IC')).not.toBeInTheDocument();
    expect(screen.queryByText('小熊')).not.toBeInTheDocument();
  });

  it('点击"已结束"按钮时，根据比分自动设置 winnerId', async () => {
    const match = createMockMatch('match-1', 'team1', 'team2');
    match.scoreA = 2;
    match.scoreB = 1;
    match.status = 'finished';

    const mockOnSave = vi.fn(() => true);
    const mockOnClose = vi.fn();

    render(
      <MatchEditDialog
        match={match}
        teams={mockTeams}
        isOpen={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
      />
    );

    // 找到保存按钮并点击
    fireEvent.click(screen.getByText('保存'));

    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalledTimes(1);
      // 验证 winnerId 被设置为 team1（因为 scoreA > scoreB）
      expect(mockOnSave).toHaveBeenCalledWith(
        expect.objectContaining({
          winnerId: 'team1',
          status: 'finished',
        })
      );
    });
  });

  it('点击"未开始"按钮时，清除 winnerId', async () => {
    const match = createMockMatch('match-1', 'team1', 'team2');
    match.scoreA = 2;
    match.scoreB = 1;
    match.status = 'finished';
    match.winnerId = 'team1';

    const mockOnSave = vi.fn(() => true);
    const mockOnClose = vi.fn();

    render(
      <MatchEditDialog
        match={match}
        teams={mockTeams}
        isOpen={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
      />
    );

    // 找到"未开始"按钮并点击
    fireEvent.click(screen.getByText('未开始'));

    // 找到保存按钮并点击
    fireEvent.click(screen.getByText('保存'));

    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalledTimes(1);
      // 验证 winnerId 被清除为 null
      expect(mockOnSave).toHaveBeenCalledWith(
        expect.objectContaining({
          winnerId: null,
          status: 'upcoming',
        })
      );
    });
  });

  it('点击"进行中"按钮时，清除 winnerId', async () => {
    const match = createMockMatch('match-1', 'team1', 'team2');
    match.scoreA = 2;
    match.scoreB = 1;
    match.status = 'finished';
    match.winnerId = 'team1';

    const mockOnSave = vi.fn(() => true);
    const mockOnClose = vi.fn();

    render(
      <MatchEditDialog
        match={match}
        teams={mockTeams}
        isOpen={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
      />
    );

    // 找到"进行中"按钮并点击
    fireEvent.click(screen.getByText('进行中'));

    // 找到保存按钮并点击
    fireEvent.click(screen.getByText('保存'));

    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalledTimes(1);
      // 验证 winnerId 被清除为 null
      expect(mockOnSave).toHaveBeenCalledWith(
        expect.objectContaining({
          winnerId: null,
          status: 'ongoing',
        })
      );
    });
  });

  it('保存时状态不是"已结束"，清除 winnerId', async () => {
    const match = createMockMatch('match-1', 'team1', 'team2');
    match.scoreA = 2;
    match.scoreB = 1;
    match.status = 'upcoming';
    match.winnerId = 'team1'; // 之前设置的 winnerId

    const mockOnSave = vi.fn(() => true);
    const mockOnClose = vi.fn();

    render(
      <MatchEditDialog
        match={match}
        teams={mockTeams}
        isOpen={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
      />
    );

    // 直接点击保存按钮（不改变状态）
    fireEvent.click(screen.getByText('保存'));

    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalledTimes(1);
      // 验证即使比分有差异，因为状态不是 finished，winnerId 被清除
      expect(mockOnSave).toHaveBeenCalledWith(
        expect.objectContaining({
          winnerId: null,
          status: 'upcoming',
        })
      );
    });
  });

  it('保存时状态是"已结束"且比分为平局，winnerId 保持 null', async () => {
    const match = createMockMatch('match-1', 'team1', 'team2');
    match.scoreA = 1;
    match.scoreB = 1;
    match.status = 'finished';
    match.winnerId = null;

    const mockOnSave = vi.fn(() => true);
    const mockOnClose = vi.fn();

    render(
      <MatchEditDialog
        match={match}
        teams={mockTeams}
        isOpen={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
      />
    );

    // 点击保存按钮
    fireEvent.click(screen.getByText('保存'));

    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalledTimes(1);
      // 验证平局时 winnerId 保持 null
      expect(mockOnSave).toHaveBeenCalledWith(
        expect.objectContaining({
          winnerId: null,
          status: 'finished',
        })
      );
    });
  });

  it('从"已结束"切换回"未开始"后保存，winnerId 被清除', async () => {
    const match = createMockMatch('match-1', 'team1', 'team2');
    match.scoreA = 2;
    match.scoreB = 1;
    match.status = 'finished';
    match.winnerId = 'team1';

    const mockOnSave = vi.fn(() => true);
    const mockOnClose = vi.fn();

    render(
      <MatchEditDialog
        match={match}
        teams={mockTeams}
        isOpen={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
      />
    );

    // 先点击"未开始"按钮
    fireEvent.click(screen.getByText('未开始'));

    // 再点击保存按钮
    fireEvent.click(screen.getByText('保存'));

    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalledTimes(1);
      // 验证 winnerId 被清除
      expect(mockOnSave).toHaveBeenCalledWith(
        expect.objectContaining({
          winnerId: null,
          status: 'upcoming',
        })
      );
    });
  });

  it('已结束状态修改比分后，winnerId 应根据新比分自动修正', async () => {
    const match = createMockMatch('match-1', 'team1', 'team2');
    match.scoreA = 1;
    match.scoreB = 2;
    match.status = 'finished';
    match.winnerId = 'team2'; // 原胜者是 team2

    const mockOnSave = vi.fn(() => true);
    const mockOnClose = vi.fn();

    render(
      <MatchEditDialog
        match={match}
        teams={mockTeams}
        isOpen={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
      />
    );

    // 修改比分 A 为 3，使其大于 B
    const scoreAInput = screen.getByText('比分 A').nextElementSibling as HTMLInputElement;
    fireEvent.change(scoreAInput, { target: { value: '3' } });

    // 点击保存按钮
    fireEvent.click(screen.getByText('保存'));

    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalledTimes(1);
      // 验证 winnerId 根据新比分修正为 team1
      expect(mockOnSave).toHaveBeenCalledWith(
        expect.objectContaining({
          winnerId: 'team1',
          status: 'finished',
          scoreA: 3,
          scoreB: 2,
        })
      );
    });
  });

  it('已结束状态修改比分为平局后，winnerId 应清空', async () => {
    const match = createMockMatch('match-1', 'team1', 'team2');
    match.scoreA = 2;
    match.scoreB = 1;
    match.status = 'finished';
    match.winnerId = 'team1';

    const mockOnSave = vi.fn(() => true);
    const mockOnClose = vi.fn();

    render(
      <MatchEditDialog
        match={match}
        teams={mockTeams}
        isOpen={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
      />
    );

    // 修改比分 B 为 2，使其平局
    const scoreBInput = screen.getByText('比分 B').nextElementSibling as HTMLInputElement;
    fireEvent.change(scoreBInput, { target: { value: '2' } });

    // 点击保存按钮
    fireEvent.click(screen.getByText('保存'));

    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalledTimes(1);
      // 验证平局时 winnerId 被清空
      expect(mockOnSave).toHaveBeenCalledWith(
        expect.objectContaining({
          winnerId: null,
          status: 'finished',
          scoreA: 2,
          scoreB: 2,
        })
      );
    });
  });
});
