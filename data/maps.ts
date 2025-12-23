import { Map } from '@/types/entity';

/**
 * 6개 맵 정보
 * 각 맵은 특정 ID 범위의 엔티티가 출현
 */

export const MAPS: Map[] = [
  {
    id: 'water',
    name: 'water',
    display_name: 'Water',
    description: '깊은 바다의 비밀. 방어력이 높은 엔티티들.',
    entity_id_range: [1, 10],
    unlock_requirement: 0, // 기본 해금
  },
  {
    id: 'fire',
    name: 'fire',
    display_name: 'Fire',
    description: '뜨거운 화염의 땅. 공격적인 엔티티들이 서식.',
    entity_id_range: [11, 20],
    unlock_requirement: 80, // Water 80% 필요
  },
  {
    id: 'forest',
    name: 'forest',
    display_name: 'Forest',
    description: '균형잡힌 생태계. 모험의 시작.',
    entity_id_range: [21, 30],
    unlock_requirement: 80, // Fire 80% 필요
  },
  {
    id: 'electric',
    name: 'electric',
    display_name: 'Electric',
    description: '전기가 흐르는 공간. 마법 공격형 엔티티들.',
    entity_id_range: [31, 40],
    unlock_requirement: 80, // Forest 80% 필요
  },
  {
    id: 'stone',
    name: 'stone',
    display_name: 'Stone',
    description: '견고한 바위 산맥. 최강의 방어력.',
    entity_id_range: [41, 50],
    unlock_requirement: 80, // Electric 80% 필요
  },
  {
    id: 'chaos',
    name: 'chaos',
    display_name: 'Chaos',
    description: '혼돈의 공간. 모든 엔티티 + 레전드 출현!',
    entity_id_range: [1, 52], // 전체
    unlock_requirement: 80, // Stone 80% 필요
  },
];

// 헬퍼 함수: 맵 ID로 맵 정보 찾기
export function getMapById(id: string): Map | undefined {
  return MAPS.find((map) => map.id === id);
}

// 헬퍼 함수: 다음 맵 가져오기
export function getNextMap(currentMapId: string): Map | undefined {
  const currentIndex = MAPS.findIndex((map) => map.id === currentMapId);
  if (currentIndex === -1 || currentIndex === MAPS.length - 1) {
    return undefined; // 마지막 맵이거나 없음
  }
  return MAPS[currentIndex + 1];
}
