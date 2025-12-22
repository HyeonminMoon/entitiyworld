'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserEntity, ArchiveStatus } from '@/types/entity';
import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';

interface GameState {
  points: number;
  playerEntity: UserEntity | null;
  discoveredEntities: Map<number, ArchiveStatus>;
  user: User | null;
  setPoints: (points: number) => void;
  setPlayerEntity: (entity: UserEntity | null) => void;
  setDiscoveredEntities: (entities: Map<number, ArchiveStatus>) => void;
  updateDiscoveredEntity: (entityId: number, status: ArchiveStatus) => void;
  logout: () => Promise<void>;
}

const GameContext = createContext<GameState | undefined>(undefined);

export function GameProvider({ children }: { children: ReactNode }) {
  const [points, setPoints] = useState(0);
  const [playerEntity, setPlayerEntity] = useState<UserEntity | null>(null);
  const [discoveredEntities, setDiscoveredEntities] = useState<Map<number, ArchiveStatus>>(new Map());
  const [user, setUser] = useState<User | null>(null);

  // 사용자 인증 상태 확인
  useEffect(() => {
    // 현재 세션 확인
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // 인증 상태 변경 감지
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

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
      discoveredEntities,
      user,
      setPoints,
      setPlayerEntity,
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
