'use client';

import { useState, useEffect } from 'react';
import { EntityMaster, Stats } from '@/types/entity';
import { generateStarterEntities } from '@/lib/rarityUtils';
import { generateRandomStats } from '@/lib/battleUtils';
import { getEntityImageUrl } from '@/lib/imageUtils';
import Image from 'next/image';

interface StarterSelectionProps {
  onSelect: (entity: EntityMaster, stats: Stats) => void;
  entities: EntityMaster[];
}

export default function StarterSelection({ onSelect, entities }: StarterSelectionProps) {
  const [starters, setStarters] = useState<EntityMaster[]>([]);
  const [starterStats, setStarterStats] = useState<Stats[]>([]);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [rerollsLeft, setRerollsLeft] = useState(1);

  const generateNewStarters = () => {
    const starterEntities = generateStarterEntities(entities);
    const stats = starterEntities.map(entity => 
      generateRandomStats(entity.min_stats, entity.max_stats)
    );
    setStarters(starterEntities);
    setStarterStats(stats);
  };

  useEffect(() => {
    if (entities.length > 0) {
      generateNewStarters();
      setLoading(false);
    }
  }, [entities]);

  const handleReroll = () => {
    if (rerollsLeft > 0) {
      generateNewStarters();
      setRerollsLeft(rerollsLeft - 1);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#1a1a2e]">
        <div className="text-white text-2xl">엔티티 생성 중...</div>
      </div>
    );
  }

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'legend': return 'from-yellow-500 to-orange-500';
      case 'unique': return 'from-purple-500 to-pink-500';
      case 'rare': return 'from-blue-500 to-cyan-500';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const getRarityText = (rarity: string) => {
    switch (rarity) {
      case 'legend': return '레전드';
      case 'unique': return '유니크';
      case 'rare': return '레어';
      default: return '노말';
    }
  };

  const getElementText = (element: string) => {
    switch (element) {
      case 'water': return '💧 물';
      case 'fire': return '🔥 불';
      case 'forest': return '🌲 숲';
      case 'electric': return '⚡ 전기';
      case 'stone': return '🪨 돌';
      case 'chaos': return '🌀 혼돈';
      default: return element;
    }
  };

  const getAttackTypeText = (type: string) => {
    return type === 'physical' ? '물리' : '마법';
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-[#0f172a] via-[#1e1b4b] to-[#312e81] p-8">
      {/* 타이틀 */}
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold text-white mb-4">🎮 Archive World</h1>
        <h2 className="text-3xl font-bold text-[#8b5cf6] mb-2">시작 엔티티를 선택하세요!</h2>
        <p className="text-[#e5e7eb] text-lg">3개의 엔티티 중 하나를 골라 모험을 시작하세요</p>
      </div>

      {/* 엔티티 카드 */}
      <div className="flex gap-8 items-center mb-6">
        {starters.map((entity, index) => {
          const stats = starterStats[index];
          return (
            <div
              key={index}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              onClick={() => onSelect(entity, stats)}
              className={`
                relative cursor-pointer transition-all duration-300
                ${hoveredIndex === index ? 'scale-110 z-10' : 'scale-100'}
              `}
            >
              <div className={`
                w-[280px] bg-[#16213e] border-4 rounded-2xl p-6
                transition-all duration-300
                ${hoveredIndex === index 
                  ? 'border-[#8b5cf6] shadow-2xl shadow-[#8b5cf6]/50' 
                  : 'border-[#8b5cf6]/30'
                }
              `}>
                {/* 등급 배지 */}
                <div className={`
                  absolute -top-3 left-1/2 transform -translate-x-1/2
                  px-4 py-1 rounded-full text-white font-bold text-sm
                  bg-gradient-to-r ${getRarityColor(entity.rarity)}
                `}>
                  {getRarityText(entity.rarity)}
                </div>

                {/* 엔티티 이미지 */}
                <div className="relative w-full h-[200px] mb-4 bg-[#1a1a2e] rounded-lg overflow-hidden">
                  <Image
                    src={getEntityImageUrl(entity.id, 'open')}
                    alt={entity.display_name}
                    fill
                    className="object-contain"
                    unoptimized
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>

                {/* 엔티티 정보 */}
                <div className="text-center mb-4">
                  <h3 className="text-2xl font-bold text-white mb-2">{entity.display_name}</h3>
                  <div className="flex items-center justify-center gap-2 text-sm">
                    <span className="text-[#10b981]">{getElementText(entity.element)}</span>
                    <span className="text-gray-400">•</span>
                    <span className="text-[#f59e0b]">{getAttackTypeText(entity.attack_type)}</span>
                  </div>
                </div>

                {/* 스탯 정보 */}
                <div className="bg-[#1a1a2e] rounded-lg p-3 space-y-1">
                  {(() => {
                    const getStatColor = (current: number, min: number, max: number) => {
                      const percent = ((current - min) / (max - min)) * 100;
                      
                      if (percent >= 80) return { color: 'text-red-400', icon: '↑' }; // 상위 80% 이상 - 좋음
                      if (percent < 20) return { color: 'text-blue-400', icon: '↓' }; // 하위 20% 미만 - 나쁨
                      return { color: 'text-white', icon: '' }; // 중간 - 기본
                    };

                    const hpStat = getStatColor(stats.hp, entity.min_stats.hp, entity.max_stats.hp);
                    const atkStat = getStatColor(stats.atk, entity.min_stats.atk, entity.max_stats.atk);
                    const defStat = getStatColor(stats.def, entity.min_stats.def, entity.max_stats.def);
                    const matkStat = getStatColor(stats.matk, entity.min_stats.matk, entity.max_stats.matk);
                    const mdefStat = getStatColor(stats.mdef, entity.min_stats.mdef, entity.max_stats.mdef);

                    return (
                      <>
                        <div className="flex justify-between text-xs items-center">
                          <span className="text-gray-400">HP</span>
                          <div className="flex items-center gap-1">
                            <span className={`${hpStat.color} font-bold`}>{stats.hp}</span>
                            {hpStat.icon && <span className={`${hpStat.color} text-[10px]`}>{hpStat.icon}</span>}
                          </div>
                        </div>
                        <div className="flex justify-between text-xs items-center">
                          <span className="text-gray-400">ATK</span>
                          <div className="flex items-center gap-1">
                            <span className={`${atkStat.color} font-bold`}>{stats.atk}</span>
                            {atkStat.icon && <span className={`${atkStat.color} text-[10px]`}>{atkStat.icon}</span>}
                          </div>
                        </div>
                        <div className="flex justify-between text-xs items-center">
                          <span className="text-gray-400">DEF</span>
                          <div className="flex items-center gap-1">
                            <span className={`${defStat.color} font-bold`}>{stats.def}</span>
                            {defStat.icon && <span className={`${defStat.color} text-[10px]`}>{defStat.icon}</span>}
                          </div>
                        </div>
                        <div className="flex justify-between text-xs items-center">
                          <span className="text-gray-400">MATK</span>
                          <div className="flex items-center gap-1">
                            <span className={`${matkStat.color} font-bold`}>{stats.matk}</span>
                            {matkStat.icon && <span className={`${matkStat.color} text-[10px]`}>{matkStat.icon}</span>}
                          </div>
                        </div>
                        <div className="flex justify-between text-xs items-center">
                          <span className="text-gray-400">MDEF</span>
                          <div className="flex items-center gap-1">
                            <span className={`${mdefStat.color} font-bold`}>{stats.mdef}</span>
                            {mdefStat.icon && <span className={`${mdefStat.color} text-[10px]`}>{mdefStat.icon}</span>}
                          </div>
                        </div>
                      </>
                    );
                  })()}
                </div>

                {/* 선택 버튼 */}
                <button
                  onClick={() => onSelect(entity, stats)}
                  className={`
                    w-full mt-4 py-3 rounded-lg font-bold transition-all
                    ${hoveredIndex === index
                      ? 'bg-[#8b5cf6] text-white shadow-lg shadow-[#8b5cf6]/50'
                      : 'bg-[#8b5cf6]/20 text-[#8b5cf6] hover:bg-[#8b5cf6]/30'
                    }
                  `}
                >
                  {hoveredIndex === index ? '✨ 선택하기' : '선택'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* 다시 뽑기 버튼 */}
      <div className="flex flex-col items-center gap-2 mb-4">
        <button
          onClick={handleReroll}
          disabled={rerollsLeft === 0}
          className={`
            px-8 py-3 rounded-lg font-bold transition-all
            ${rerollsLeft > 0
              ? 'bg-[#10b981] text-white hover:bg-[#059669] shadow-lg shadow-[#10b981]/50'
              : 'bg-gray-600 text-gray-400 cursor-not-allowed'
            }
          `}
        >
          🔄 다시 뽑기 ({rerollsLeft}/1)
        </button>
      </div>

      {/* 안내 문구 */}
      <div className="text-center">
        <p className="text-gray-400 text-sm">💡 등급 확률: 노말 80% | 레어 19% | 유니크 0.99% | 레전드 0.01%</p>
      </div>
    </div>
  );
}
