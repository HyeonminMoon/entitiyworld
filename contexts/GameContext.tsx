'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserEntity, ArchiveStatus, EntityMaster } from '@/types/entity';
import { supabase, fetchEntities, fetchUserEntities, fetchUserArchives } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';

interface GameState {
  points: number;
  playerEntity: UserEntity | null;
  userEntities: UserEntity[];
  discoveredEntities: Map<number, ArchiveStatus>;
  entities: EntityMaster[];
  entitiesLoading: boolean;
  user: User | null;
  setPoints: (points: number) => void;
  setPlayerEntity: (entity: UserEntity | null) => void;
  setUserEntities: (entities: UserEntity[]) => void;
  setDiscoveredEntities: (entities: Map<number, ArchiveStatus>) => void;
  updateDiscoveredEntity: (entityId: number, status: ArchiveStatus) => void;
  logout: () => Promise<void>;
}

const GameContext = createContext<GameState | undefined>(undefined);

export function GameProvider({ children }: { children: ReactNode }) {
  const [points, setPoints] = useState(0);
  const [playerEntity, setPlayerEntity] = useState<UserEntity | null>(null);
  const [userEntities, setUserEntities] = useState<UserEntity[]>([]);
  const [discoveredEntities, setDiscoveredEntities] = useState<Map<number, ArchiveStatus>>(new Map());
  const [entities, setEntities] = useState<EntityMaster[]>([]);
  const [entitiesLoading, setEntitiesLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  // Supabase에서 엔티티 데이터 로드
  useEffect(() => {
    async function loadEntities() {
      setEntitiesLoading(true);
      const data = await fetchEntities();
      setEntities(data);
      setEntitiesLoading(false);
    }
    loadEntities();
  }, []);

  // 사용자 인증 상태 확인
  useEffect(() => {
    // 현재 세션 확인
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        loadUserData(session.user.id);
      }
    });

    // 인증 상태 변경 감지
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        loadUserData(session.user.id);
      } else {
        // 로그아웃 시 데이터 초기화
        setPlayerEntity(null);
        setDiscoveredEntities(new Map());
        setPoints(0);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // 사용자 데이터 로드 (엔티티, 도감)
  const loadUserData = async (userId: string) => {
    // 사용자 엔티티 로드
    const userEntitiesData = await fetchUserEntities(userId);
    const userEntitiesList: UserEntity[] = userEntitiesData.map(ue => ({
      id: ue.id,
      entity_id: ue.entity_id,
      user_id: ue.user_id,
      current_level: ue.current_level,
      current_stats: {
        hp: ue.stat_hp,
        atk: ue.stat_atk,
        def: ue.stat_def,
        matk: ue.stat_matk,
        mdef: ue.stat_mdef,
      },
      current_xp: ue.current_xp,
      current_hp: ue.current_hp,
      acquired_at: new Date(ue.acquired_at),
    }));
    
    setUserEntities(userEntitiesList);
    
    // 첫 번째 엔티티를 활성 엔티티로 설정
    if (userEntitiesList.length > 0) {
      setPlayerEntity(userEntitiesList[0]);
    }

    // 도감 데이터 로드
    const archives = await fetchUserArchives(userId);
    const archiveMap = new Map<number, ArchiveStatus>();
    archives.forEach(archive => {
      archiveMap.set(archive.entity_id, archive.status as ArchiveStatus);
    });
    setDiscoveredEntities(archiveMap);
  };

  const updateDiscoveredEntity = (entityId: number, status: ArchiveStatus) => {
    setDiscoveredEntities(prev => {
      const newMap = new Map(prev);
      newMap.set(entityId, status);
      return newMap;
    });
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setPoints(0);
    setPlayerEntity(null);
    setDiscoveredEntities(new Map());
  };

  return (
    <GameContext.Provider value={{
      points,
      playerEntity,
      userEntities,
      discoveredEntities,
      entities,
      entitiesLoading,
      user,
      setPoints,
      setPlayerEntity,
      setUserEntities,
      setDiscoveredEntities,
      updateDiscoveredEntity,
      logout,
    }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within GameProvider');
  }
  return context;
}
