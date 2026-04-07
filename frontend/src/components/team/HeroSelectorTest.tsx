import React, { useState } from 'react';
import HeroSelector from './HeroSelector';

const TestHeroSelector: React.FC = () => {
  const [visible, setVisible] = useState(false);
  const [selectedHeroes, setSelectedHeroes] = useState<string[]>([]);

  const handleConfirm = (heroes: string[]) => {
    setSelectedHeroes(heroes);
    console.log('确认选择的英雄:', heroes);
  };

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <h1 className="text-white text-2xl mb-4">英雄选择器测试</h1>

      <div className="mb-4 text-white">
        <p>已选英雄: {selectedHeroes.length > 0 ? selectedHeroes.join(', ') : '无'}</p>
      </div>

      <button
        onClick={() => setVisible(true)}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
      >
        打开英雄选择器
      </button>

      <HeroSelector
        visible={visible}
        onClose={() => setVisible(false)}
        selectedHeroes={selectedHeroes}
        onConfirm={handleConfirm}
        maxSelect={5}
      />
    </div>
  );
};

export default TestHeroSelector;