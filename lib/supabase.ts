import { createClient } from '@supabase/supabase-js';
import { EntityMaster, Stats } from '@/types/entity';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Supabase에서 모든 엔티티 데이터 가져오기
export async function fetchEntities(): Promise<EntityMaster[]> {
  const { data, error } = await supabase
    .from('entities')
    .select('*')
    .order('id', { ascending: true });

  if (error) {
    console.error('엔티티 로드 실패:', error);
    return [];
  }

  // DB 스키마를 EntityMaster 타입으로 변환
  return (data || []).map(entity => ({
    id: entity.id,
    name: entity.name,
    display_name: entity.display_name,
    element: entity.element,
    attack_type: entity.attack_type,
    rarity: entity.rarity,
    min_stats: {
      hp: entity.min_hp,
      atk: entity.min_atk,
      def: entity.min_def,
      matk: entity.min_matk,
      mdef: entity.min_mdef,
    },
    max_stats: {
      hp: entity.max_hp,
      atk: entity.max_atk,
      def: entity.max_def,
      matk: entity.max_matk,
      mdef: entity.max_mdef,
    },
    image_id: entity.id,
  }));
}

// 사용자 엔티티를 DB에 저장
export async function saveUserEntity(userId: string, entityId: number, stats: Stats) {
  const { data, error } = await supabase
    .from('user_entities')
    .insert({
      user_id: userId,
      entity_id: entityId,
      current_level: 1,
      current_xp: 0,
      current_hp: stats.hp,
      stat_hp: stats.hp,
      stat_atk: stats.atk,
      stat_def: stats.def,
      stat_matk: stats.matk,
      stat_mdef: stats.mdef,
    })
    .select()
    .single();

  if (error) {
    console.error('엔티티 저장 실패:', error);
    return null;
  }

  return data;
}

// 도감에 엔티티 기록 (조우/포획)
export async function saveArchiveEntry(userId: string, entityId: number, status: 'close' | 'open') {
  const { error } = await supabase
    .from('archives')
    .upsert({
      user_id: userId,
      entity_id: entityId,
      status: status,
    }, {
      onConflict: 'user_id,entity_id',
    });

  if (error) {
    console.error('도감 저장 실패:', error);
    return false;
  }

  return true;
}

// 사용자의 모든 엔티티 가져오기
export async function fetchUserEntities(userId: string) {
  const { data, error } = await supabase
    .from('user_entities')
    .select('*')
    .eq('user_id', userId)
    .order('acquired_at', { ascending: false });

  if (error) {
    console.error('사용자 엔티티 로드 실패:', error);
    return [];
  }

  return data || [];
}

// 사용자의 도감 기록 가져오기
export async function fetchUserArchives(userId: string) {
  const { data, error } = await supabase
    .from('archives')
    .select('*')
    .eq('user_id', userId);

  if (error) {
    console.error('도감 로드 실패:', error);
    return [];
  }

  return data || [];
}
