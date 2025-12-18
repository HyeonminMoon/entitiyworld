// 엔티티 희귀도
export type Rarity = 'normal' | 'rare' | 'unique' | 'legend';

// 엔티티 속성 (타입)
export type Element = 'water' | 'fire' | 'forest' | 'electric' | 'stone' | 'chaos';

// 공격 타입
export type AttackType = 'physical' | 'magic';

// 5대 스탯 구조
export interface Stats {
  hp: number;      // 체력
  atk: number;     // 공격력
  def: number;     // 방어력
  matk: number;    // 마법공격력
  mdef: number;    // 마법방어력
}

// 엔티티 마스터 데이터 (Static)
export interface EntityMaster {
  id: number;
  name: string;              // 예: water_otter
  display_name: string;      // 예: Water Otter
  element: Element;
  attack_type: AttackType;
  rarity: Rarity;
  min_stats: Stats;         // 최소 스탯
  max_stats: Stats;         // 최대 스탯
  image_id: number;         // 이미지 파일명 (1.png, 2.png...)
}

// 유저가 보유한 엔티티 (Dynamic)
export interface UserEntity {
  id: string;               // UUID (고유 개체)
  entity_id: number;        // EntityMaster의 id 참조
  user_id: string;
  current_level: number;
  current_stats: Stats;     // 성장한 스탯
  current_xp: number;       // 현재 경험치
  current_hp: number;       // 현재 체력 (전투 중)
  acquired_at: Date;
}

// 도감 상태
export type ArchiveStatus = 'none' | 'close' | 'open';

// 유저 도감 데이터
export interface UserArchive {
  user_id: string;
  entity_id: number;
  status: ArchiveStatus;    // none: 미발견, close: 실루엣, open: 완전 등록
  first_seen_at?: Date;
}

// 맵 정보
export interface Map {
  id: string;
  name: string;
  display_name: string;
  description: string;
  entity_id_range: [number, number];  // [시작 ID, 끝 ID]
  unlock_requirement: number;         // 이전 맵 도감 채우기 % (80)
}

// 전투 결과
export interface BattleResult {
  winner: 'player' | 'enemy' | 'escaped';
  xp_gained: number;
  entity_captured: boolean;
  captured_entity?: UserEntity;
}

// 희귀도 가중치
export interface RarityWeight {
  rarity: Rarity;
  weight: number;           // 기본 가중치
  chaos_weight: number;     // Chaos 맵에서의 가중치
}
