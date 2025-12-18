import { RarityWeight } from '@/types/entity';

/**
 * 희귀도별 가중치 설정
 * 일반 맵과 Chaos 맵의 확률이 다름
 */

export const RARITY_WEIGHTS: RarityWeight[] = [
  {
    rarity: 'normal',
    weight: 6.0,      // 60%
    chaos_weight: 5.0, // 50%
  },
  {
    rarity: 'rare',
    weight: 3.0,      // 30%
    chaos_weight: 3.0, // 30%
  },
  {
    rarity: 'unique',
    weight: 0.999,    // 9.99%
    chaos_weight: 1.5, // 15%
  },
  {
    rarity: 'legend',
    weight: 0.001,    // 0.01%
    chaos_weight: 0.5, // 5%
  },
];

/**
 * 포획 확률 (희귀도별)
 */
export const CAPTURE_RATES = {
  normal: 0.8,   // 80%
  rare: 0.5,     // 50%
  unique: 0.25,  // 25%
  legend: 0.05,  // 5%
};

/**
 * Chaos 맵에서의 포획 확률 (보너스)
 */
export const CHAOS_CAPTURE_RATES = {
  normal: 0.9,   // 90%
  rare: 0.65,    // 65%
  unique: 0.4,   // 40%
  legend: 0.15,  // 15%
};

/**
 * 경험치 테이블
 * 레벨업에 필요한 경험치 계산
 */
export function getRequiredXP(level: number): number {
  return Math.floor(100 * Math.pow(1.2, level - 1));
}

/**
 * HP 회복 비용 (포인트)
 */
export function getHealCost(level: number): number {
  return level * 10;
}

/**
 * 스탯 강화 비용 (포인트)
 */
export function getStatUpgradeCost(currentStatValue: number): number {
  return currentStatValue * 5;
}
