import { Stats } from '@/types/entity';

/**
 * 데미지 계산 함수
 * 공식: (공격자 ATK - 방어자 DEF) + (공격자 MATK - 방어자 MDEF)
 * 각 계산 결과가 0 미만이면 0으로 처리
 * 최종 데미지가 0이면 1로 고정 (최소 데미지 보장)
 */
export function calculateDamage(attackerStats: Stats, defenderStats: Stats): number {
  const physicalDamage = Math.max(0, attackerStats.atk - defenderStats.def);
  const magicalDamage = Math.max(0, attackerStats.matk - defenderStats.mdef);
  
  const totalDamage = physicalDamage + magicalDamage;
  
  // 최소 데미지 1 보장
  return totalDamage > 0 ? totalDamage : 1;
}

/**
 * 랜덤 스탯 생성 (Min ~ Max 사이)
 */
export function generateRandomStats(minStats: Stats, maxStats: Stats): Stats {
  return {
    hp: randomBetween(minStats.hp, maxStats.hp),
    atk: randomBetween(minStats.atk, maxStats.atk),
    def: randomBetween(minStats.def, maxStats.def),
    matk: randomBetween(minStats.matk, maxStats.matk),
    mdef: randomBetween(minStats.mdef, maxStats.mdef),
  };
}

/**
 * Min ~ Max 사이의 랜덤 정수
 */
function randomBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * 경험치 계산
 * 승리 시 적 레벨 기반으로 획득
 */
export function calculateExpGain(enemyLevel: number): number {
  return Math.floor(50 * enemyLevel * 1.1);
}

/**
 * 전투 로그 타입
 */
export type BattleLogType = 'player_attack' | 'enemy_attack' | 'player_win' | 'enemy_win' | 'escape';

export interface BattleLog {
  type: BattleLogType;
  message: string;
  damage?: number;
}
