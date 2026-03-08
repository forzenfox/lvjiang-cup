import React, { useCallback, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Match, Team } from '@/types';
import BracketMatchCard from './BracketMatchCard';

interface EliminationStageProps {
  matches: Match[];
  teams: Team[];
}

// 格式化时间为 "X月X日 XX:XX"
const formatDateTime = (dateString: string): string => {
  const date = new Date(dateString);
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${month}月${day}日 ${hours}:${minutes}`;
};

const BOARD_WIDTH = 1200;
const BOARD_HEIGHT = 650;

const EliminationStage: React.FC<EliminationStageProps> = ({ matches, teams }) => {
  // Helper to find match by game number
  const getMatch = (gameNum: number) => matches.find(m => m.eliminationGameNumber === gameNum);

  const g1 = getMatch(1);
  const g2 = getMatch(2);
  const g3 = getMatch(3);
  const g4 = getMatch(4);
  const g5 = getMatch(5);
  const g6 = getMatch(6);
  const g7 = getMatch(7);
  const g8 = getMatch(8);

  const xSpacing = 280;

  // Coordinates for each match (Top-Left corner of the card wrapper)
  const positions = {
    g1: { x: 20, y: 20 },
    g2: { x: 20, y: 160 },
    g3: { x: 20, y: 340 },
    g4: { x: 20, y: 480 },

    g5: { x: 20 + xSpacing, y: 90 },
    g6: { x: 20 + xSpacing, y: 410 },

    g7: { x: 20 + xSpacing * 2, y: 410 },

    g8: { x: 20 + xSpacing * 3, y: 250 },
  };

  const placeholderMatch = (gameNum?: number): Match => ({
    id: `placeholder-${gameNum ?? 'na'}`,
    teamAId: '',
    teamBId: '',
    scoreA: 0,
    scoreB: 0,
    winnerId: null,
    round: '',
    status: 'upcoming',
    startTime: '',
    stage: 'elimination',
    eliminationGameNumber: gameNum
  });

  const g1Ref = useRef<HTMLDivElement>(null);
  const g2Ref = useRef<HTMLDivElement>(null);
  const g3Ref = useRef<HTMLDivElement>(null);
  const g4Ref = useRef<HTMLDivElement>(null);
  const g5Ref = useRef<HTMLDivElement>(null);
  const g6Ref = useRef<HTMLDivElement>(null);
  const g7Ref = useRef<HTMLDivElement>(null);
  const g8Ref = useRef<HTMLDivElement>(null);

  const boardRef = useRef<HTMLDivElement>(null);

  type GameKey = 'g1' | 'g2' | 'g3' | 'g4' | 'g5' | 'g6' | 'g7' | 'g8';

  type CardPoint = {
    left: number;
    right: number;
    midX: number;
    midY: number;
    bottomY: number;
  };

  const [points, setPoints] = useState<Partial<Record<GameKey, CardPoint>>>({});

  const computePoints = useCallback(() => {
    const boardEl = boardRef.current;
    if (!boardEl) return;
    const boardRect = boardEl.getBoundingClientRect();

    const calc = (el: HTMLDivElement | null): CardPoint | undefined => {
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const teamAEl = el.querySelector('[data-team="a"]') as HTMLElement | null;
      const midY = teamAEl ? teamAEl.getBoundingClientRect().bottom - boardRect.top : rect.top + rect.height / 2 - boardRect.top;
      return {
        left: rect.left - boardRect.left,
        right: rect.right - boardRect.left,
        midX: rect.left - boardRect.left + rect.width / 2,
        midY,
        bottomY: rect.bottom - boardRect.top
      };
    };

    setPoints({
      g1: calc(g1Ref.current),
      g2: calc(g2Ref.current),
      g3: calc(g3Ref.current),
      g4: calc(g4Ref.current),
      g5: calc(g5Ref.current),
      g6: calc(g6Ref.current),
      g7: calc(g7Ref.current),
      g8: calc(g8Ref.current)
    });
  }, []);

  useLayoutEffect(() => {
    computePoints();
  }, [matches, computePoints]);

  useLayoutEffect(() => {
    const onResize = () => computePoints();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [computePoints]);

  const renderMatch = (
    match: Match | undefined,
    pos: { x: number; y: number },
    ref: React.RefObject<HTMLDivElement>,
    gameNum?: number
  ) => {
    // If no match data, create a placeholder
    const displayMatch = match || placeholderMatch(gameNum);

    return (
      <div
        className="absolute"
        style={{ left: pos.x, top: pos.y }}
      >
        <div className="mb-1 text-xs text-gray-500 font-mono ml-1 h-4">
          {displayMatch.startTime ? formatDateTime(displayMatch.startTime) : ''}
        </div>
        <BracketMatchCard
          match={displayMatch}
          teams={teams}
          ref={ref}
        />
      </div>
    );
  };

  const drawElbow = (start: { x: number; y: number }, end: { x: number; y: number }) => {
    const midX = start.x + 20;
    return `M ${start.x} ${start.y} L ${midX} ${start.y} L ${midX} ${end.y} L ${end.x} ${end.y}`;
  };

  const drawDrop = (start: { x: number; y: number }, end: { x: number; y: number }) => {
    return `M ${start.x} ${start.y} L ${start.x} ${end.y} L ${end.x} ${end.y}`;
  };

  const lines = useMemo(() => {
    const p1 = points.g1;
    const p2 = points.g2;
    const p3 = points.g3;
    const p4 = points.g4;
    const p5 = points.g5;
    const p6 = points.g6;
    const p7 = points.g7;
    const p8 = points.g8;
    if (!p1 || !p2 || !p3 || !p4 || !p5 || !p6 || !p7 || !p8) return null;

    const solid = [
      drawElbow({ x: p1.right, y: p1.midY }, { x: p5.left, y: p5.midY }),
      drawElbow({ x: p2.right, y: p2.midY }, { x: p5.left, y: p5.midY }),
      drawElbow({ x: p3.right, y: p3.midY }, { x: p6.left, y: p6.midY }),
      drawElbow({ x: p4.right, y: p4.midY }, { x: p6.left, y: p6.midY }),
      drawElbow({ x: p5.right, y: p5.midY }, { x: p8.left, y: p8.midY }),
      drawElbow({ x: p6.right, y: p6.midY }, { x: p7.left, y: p7.midY }),
      drawElbow({ x: p7.right, y: p7.midY }, { x: p8.left, y: p8.midY })
    ];

    const dashed = [
      drawDrop({ x: p1.midX, y: p1.bottomY }, { x: p3.left, y: p3.midY }),
      drawDrop({ x: p2.midX, y: p2.bottomY }, { x: p4.left, y: p4.midY }),
      drawDrop({ x: p5.midX, y: p5.bottomY }, { x: p7.left, y: p7.midY })
    ];

    return { solid, dashed };
  }, [points]);

  return (
    <div className="relative w-full overflow-x-auto min-h-[700px] bg-gray-900/20 rounded-xl p-8">
      <div ref={boardRef} className="relative z-10" style={{ width: BOARD_WIDTH, height: BOARD_HEIGHT }}>
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          {lines?.solid.map((d, i) => (
            <path key={`s-${i}`} d={d} fill="none" stroke="#6B7280" strokeWidth="2" className="opacity-60" />
          ))}
          {lines?.dashed.map((d, i) => (
            <path key={`d-${i}`} d={d} fill="none" stroke="#6B7280" strokeWidth="2" strokeDasharray="4 4" className="opacity-50" />
          ))}
        </svg>

        {renderMatch(g1, positions.g1, g1Ref, 1)}
        {renderMatch(g2, positions.g2, g2Ref, 2)}

        <div className="absolute left-[20px] top-[300px] text-gray-500 font-bold text-sm tracking-widest border-l-4 border-gray-700 pl-2">
          败者组
        </div>

        {renderMatch(g3, positions.g3, g3Ref, 3)}
        {renderMatch(g4, positions.g4, g4Ref, 4)}

        {renderMatch(g5, positions.g5, g5Ref, 5)}
        {renderMatch(g6, positions.g6, g6Ref, 6)}

        {renderMatch(g7, positions.g7, g7Ref, 7)}

        {renderMatch(g8, positions.g8, g8Ref, 8)}
      </div>
    </div>
  );
};

export default EliminationStage;
