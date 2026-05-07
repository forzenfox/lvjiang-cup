import React from 'react';
import { Match, Team } from '@/types';
import Modal from '@/components/ui/Modal';
import MatchDetailContent from './MatchDetailContent';

interface MatchDetailModalProps {
  visible: boolean;
  onClose: () => void;
  match: Match | null;
  teams: Team[];
}

const MatchDetailModal: React.FC<MatchDetailModalProps> = ({ visible, onClose, match, teams }) => {
  if (!match) return null;

  return (
    <Modal visible={visible} onClose={onClose} title="对战详情" className="max-w-lg w-full">
      <MatchDetailContent match={match} teams={teams} />
    </Modal>
  );
};

export default MatchDetailModal;
