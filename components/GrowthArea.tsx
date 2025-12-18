'use client';

import { useState } from 'react';
import { UserEntity } from '@/types/entity';
import { getRequiredXP, getStatUpgradeCost } from '@/data/constants';

interface GrowthAreaProps {
  playerEntity: UserEntity | null;
  points: number;
  onPointsChange: (points: number) => void;
  onEntityUpdate?: (entity: UserEntity) => void;
}

type StatKey = 'hp' | 'atk' | 'def' | 'matk' | 'mdef';

export default function GrowthArea({ playerEntity, points, onPointsChange, onEntityUpdate }: GrowthAreaProps) {
  const [selectedEntity, setSelectedEntity] = useState<UserEntity | null>(playerEntity);

  if (!selectedEntity) {
    return (
      <div className="flex flex-col items-center gap-6">
        <div className="w-[500px] bg-[#16213e] border-4 border-[#8b5cf6] rounded-2xl p-8">
          <div className="text-center">
            <div className="text-8xl mb-4">📈</div>
            <h2 className="text-2xl font-bold text-white mb-4">성장 시스템</h2>
            <p className="text-[#e5e7eb]">먼저 엔티티를 획득해주세요!</p>
          </div>
        </div>
      </div>
    );
  }

  const requiredXP = getRequiredXP(selectedEntity.current_level);
  const xpProgress = (selectedEntity.current_xp / requiredXP) * 100;

  // 스탯 강화
  const handleStatUpgrade = (stat: StatKey) => {
    const currentValue = selectedEntity.current_stats[stat];
    const cost = getStatUpgradeCost(currentValue);

    if (points < cost) {
      alert(`포인트가 부족합니다! (필요: ${cost}, 보유: ${points})`);
      return;
    }

    // 포인트 차감
    onPointsChange(points - cost);

    // 스탯 증가
    const updatedEntity = {
      ...selectedEntity,
      current_stats: {
        ...selectedEntity.current_stats,
        [stat]: currentValue + 1,
      },
    };

    setSelectedEntity(updatedEntity);
    onEntityUpdate?.(updatedEntity);

    alert(`${stat.toUpperCase()} +1! (비용: ${cost} Points)`);
  };

  // 레벨업 (경험치로)
  const handleLevelUp = () => {
    if (selectedEntity.current_xp < requiredXP) {
      alert(`경험치가 부족합니다! (${selectedEntity.current_xp}/${requiredXP})`);
      return;
    }

    // 레벨업: 모든 스탯 +1
    const updatedEntity = {
      ...selectedEntity,
      current_level: selectedEntity.current_level + 1,
      current_xp: selectedEntity.current_xp - requiredXP,
      current_stats: {
        hp: selectedEntity.current_stats.hp + 1,
        atk: selectedEntity.current_stats.atk + 1,
        def: selectedEntity.current_stats.def + 1,
        matk: selectedEntity.current_stats.matk + 1,
        mdef: selectedEntity.current_stats.mdef + 1,
      },
    };

    setSelectedEntity(updatedEntity);
    onEntityUpdate?.(updatedEntity);

    alert(`🎉 레벨업! Lv.${updatedEntity.current_level} (모든 스탯 +1)`);
  };

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-2xl">
      {/* 엔티티 정보 */}
      <div className="w-full bg-[#16213e] border-4 border-[#8b5cf6] rounded-2xl p-6">
        <div className="text-center mb-6">
          <div className="text-8xl mb-4">🛡️</div>
          <h2 className="text-2xl font-bold text-white mb-2">엔티티 성장</h2>
          <p className="text-[#8b5cf6]">레벨: {selectedEntity.current_level}</p>
        </div>

        {/* 경험치 바 */}
        <div className="mb-6">
          <div className="flex justify-between text-sm text-white mb-2">
            <span>경험치</span>
            <span>{selectedEntity.current_xp} / {requiredXP}</span>
          </div>
          <div className="w-full bg-[#1a1a2e] rounded-full h-6 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-[#8b5cf6] to-[#a78bfa] h-full transition-all duration-300"
              style={{ width: `${xpProgress}%` }}
            />
          </div>
          <button
            onClick={handleLevelUp}
            disabled={selectedEntity.current_xp < requiredXP}
            className={`mt-4 w-full py-3 rounded-lg font-bold transition-all ${
              selectedEntity.current_xp >= requiredXP
                ? 'bg-[#10b981] text-white hover:bg-[#059669] shadow-lg shadow-[#10b981]/50'
                : 'bg-gray-600 text-gray-400 cursor-not-allowed'
            }`}
          >
            ⬆️ 레벨업 (모든 스탯 +1)
          </button>
        </div>

        {/* 현재 포인트 */}
        <div className="bg-[#1a1a2e] border-2 border-[#10b981] rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <span className="text-[#10b981] font-bold">보유 포인트</span>
            <span className="text-white text-2xl font-bold">{points.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* 스탯 강화 */}
      <div className="w-full bg-[#16213e] border-4 border-[#8b5cf6] rounded-2xl p-6">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          💪 <span>스탯 강화</span>
        </h3>
        <p className="text-sm text-[#e5e7eb] mb-6">포인트를 소모하여 개별 스탯을 강화할 수 있습니다.</p>

        <div className="space-y-3">
          {/* HP */}
          <StatUpgradeRow
            label="HP"
            icon="❤️"
            currentValue={selectedEntity.current_stats.hp}
            cost={getStatUpgradeCost(selectedEntity.current_stats.hp)}
            onUpgrade={() => handleStatUpgrade('hp')}
            canAfford={points >= getStatUpgradeCost(selectedEntity.current_stats.hp)}
          />

          {/* ATK */}
          <StatUpgradeRow
            label="ATK"
            icon="⚔️"
            currentValue={selectedEntity.current_stats.atk}
            cost={getStatUpgradeCost(selectedEntity.current_stats.atk)}
            onUpgrade={() => handleStatUpgrade('atk')}
            canAfford={points >= getStatUpgradeCost(selectedEntity.current_stats.atk)}
          />

          {/* DEF */}
          <StatUpgradeRow
            label="DEF"
            icon="🛡️"
            currentValue={selectedEntity.current_stats.def}
            cost={getStatUpgradeCost(selectedEntity.current_stats.def)}
            onUpgrade={() => handleStatUpgrade('def')}
            canAfford={points >= getStatUpgradeCost(selectedEntity.current_stats.def)}
          />

          {/* MATK */}
          <StatUpgradeRow
            label="MATK"
            icon="✨"
            currentValue={selectedEntity.current_stats.matk}
            cost={getStatUpgradeCost(selectedEntity.current_stats.matk)}
            onUpgrade={() => handleStatUpgrade('matk')}
            canAfford={points >= getStatUpgradeCost(selectedEntity.current_stats.matk)}
          />

          {/* MDEF */}
          <StatUpgradeRow
            label="MDEF"
            icon="🌟"
            currentValue={selectedEntity.current_stats.mdef}
            cost={getStatUpgradeCost(selectedEntity.current_stats.mdef)}
            onUpgrade={() => handleStatUpgrade('mdef')}
            canAfford={points >= getStatUpgradeCost(selectedEntity.current_stats.mdef)}
          />
        </div>
      </div>

      {/* 성장 팁 */}
      <div className="w-full bg-[#16213e]/50 border border-[#8b5cf6]/30 rounded-lg p-4">
        <div className="text-[#8b5cf6] font-bold mb-2 flex items-center gap-2">
          💡 <span>성장 팁</span>
        </div>
        <ul className="text-[#e5e7eb] text-sm space-y-1">
          <li>• 레벨업: 경험치를 모아 레벨을 올리면 모든 스탯이 +1씩 증가합니다</li>
          <li>• 스탯 강화: 포인트로 원하는 스탯만 선택적으로 강화할 수 있습니다</li>
          <li>• 강화 비용: 현재 스탯 값 × 5 Point</li>
        </ul>
      </div>
    </div>
  );
}

// 스탯 강화 행 컴포넌트
interface StatUpgradeRowProps {
  label: string;
  icon: string;
  currentValue: number;
  cost: number;
  onUpgrade: () => void;
  canAfford: boolean;
}

function StatUpgradeRow({ label, icon, currentValue, cost, onUpgrade, canAfford }: StatUpgradeRowProps) {
  return (
    <div className="flex items-center justify-between bg-[#1a1a2e] rounded-lg p-4 border-2 border-[#8b5cf6]/30">
      <div className="flex items-center gap-3">
        <span className="text-2xl">{icon}</span>
        <div>
          <div className="text-white font-bold">{label}</div>
          <div className="text-[#10b981] text-sm">현재: {currentValue}</div>
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="text-right">
          <div className="text-[#8b5cf6] text-sm">비용</div>
          <div className="text-white font-bold">{cost} P</div>
        </div>
        <button
          onClick={onUpgrade}
          disabled={!canAfford}
          className={`px-6 py-2 rounded-lg font-bold transition-all ${
            canAfford
              ? 'bg-[#8b5cf6] text-white hover:bg-[#a78bfa] shadow-lg shadow-[#8b5cf6]/30'
              : 'bg-gray-600 text-gray-400 cursor-not-allowed'
          }`}
        >
          +1
        </button>
      </div>
    </div>
  );
}
