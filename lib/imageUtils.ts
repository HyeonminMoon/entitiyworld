import { supabase } from './supabase';

/**
 * Supabase Storage에서 엔티티 이미지 URL 가져오기
 * @param entityId - 엔티티 ID (1~52)
 * @param status - 'open' (포획 완료) 또는 'close' (실루엣)
 * @returns 이미지 Public URL
 */
export function getEntityImageUrl(entityId: number, status: 'open' | 'close'): string {
  const { data } = supabase.storage
    .from('entity-images')
    .getPublicUrl(`${status}/${entityId}.png`);
  
  return data.publicUrl;
}

/**
 * Supabase Storage에서 배경 이미지 URL 가져오기
 * @param path - 배경 이미지 경로 (예: 'background/field.jpg')
 * @returns 이미지 Public URL
 */
export function getBackgroundImageUrl(path: string): string {
  const { data } = supabase.storage
    .from('entity-images')
    .getPublicUrl(path);
  
  return data.publicUrl;
}

/**
 * 로컬 이미지 경로 (fallback용)
 */
export function getLocalImagePath(entityId: number, status: 'open' | 'close'): string {
  return `/assets/entities/${status}/${entityId}.png`;
}
