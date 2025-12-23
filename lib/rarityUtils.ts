import { EntityMaster } from '@/types/entity';

/**
 * 등급별 확률로 랜덤 엔티티 생성
 * normal: 80%, rare: 19%, unique: 0.99%, legend: 0.01%
 */
export function generateRandomRarity(): 'normal' | 'rare' | 'unique' | 'legend' {
  const random = Math.random() * 100;
  
  if (random < 0.01) {
    return 'legend';
  } else if (random < 1) { // 0.01 ~ 1 = 0.99%
    return 'unique';
  } else if (random < 20) { // 1 ~ 20 = 19%
    return 'rare';
  } else { // 20 ~ 100 = 80%
    return 'normal';
  }
}

/**
 * 특정 등급의 엔티티 중 랜덤으로 하나 선택
 */
export function getRandomEntityByRarity(entities: EntityMaster[], rarity: 'normal' | 'rare' | 'unique' | 'legend'): EntityMaster | null {
  const entitiesOfRarity = entities.filter(e => e.rarity === rarity);
  
  if (entitiesOfRarity.length === 0) {
    return null;
  }
  
  const randomIndex = Math.floor(Math.random() * entitiesOfRarity.length);
  return entitiesOfRarity[randomIndex];
}

/**
 * 랜덤 엔티티 생성 (등급 확률 적용)
 */
export function generateRandomEntity(entities: EntityMaster[]): EntityMaster | null {
  const rarity = generateRandomRarity();
  return getRandomEntityByRarity(entities, rarity);
}

/**
 * 시작 선택용 엔티티 3개 생성 (중복 없이)
 */
export function generateStarterEntities(entities: EntityMaster[]): EntityMaster[] {
  const starters: EntityMaster[] = [];
  const usedIds = new Set<number>();
  
  for (let i = 0; i < 3; i++) {
    let entity = generateRandomEntity(entities);
    let attempts = 0;
    
    // 중복 제거 (최대 50번 시도)
    while (entity && usedIds.has(entity.id) && attempts < 50) {
      entity = generateRandomEntity(entities);
      attempts++;
    }
    
    if (entity && !usedIds.has(entity.id)) {
      starters.push(entity);
      usedIds.add(entity.id);
    }
  }
  
  return starters;
}
