'use client';

import { useState, useEffect } from 'react';
import { EntityMaster, UserEntity, Stats } from '@/types/entity';
import { MOCK_ENTITIES } from '@/data/mockEntities';
import { generateRandomStats, calculateDamage, calculateExpGain, BattleLog } from '@/lib/battleUtils';
import { CAPTURE_RATES } from '@/data/constants';

interface BattleAreaProps {
  playerEntity: UserEntity | null;
  currentMap: string;
  onBattleEnd: (result: 'win' | 'lose' | 'escape', expGained: number) => void;
  onCapture?: (entity: EntityMaster) => void;
}

export default function BattleArea({ playerEntity, currentMap, onBattleEnd, onCapture }: BattleAreaProps) {
  const [enemy, setEnemy] = useState<EntityMaster | null>(null);
  const [enemyCurrentHp, setEnemyCurrentHp] = useState(0);
  const [enemyStats, setEnemyStats] = useState<Stats | null>(null);
  
  const [playerCurrentHp, setPlayerCurrentHp] = useState(0);
  const [turn, setTurn] = useState<'player' | 'enemy'>('player');
  const [battleLog, setBattleLog] = useState<BattleLog[]>([]);
  const [battleEnded, setBattleEnded] = useState(false);

  // 전투 시작: 적 생성
  useEffect(() => {
    if (!playerEntity) return;
    
    spawnEnemy();
    setPlayerCurrentHp(playerEntity.current_stats.hp);
    addLog({ type: 'player_attack', message: '전투 시작!' });
  }, []);

  // 적 생성
  const spawnEnemy = () => {
    // Forest 맵 엔티티 (21~30)
    const forestEntities = MOCK_ENTITIES.filter(e => e.id >= 21 && e.id <= 30 && e.rarity === 'normal');
    const randomEnemy = forestEntities[Math.floor(Math.random() * forestEntities.length)];
    
    const stats = generateRandomStats(randomEnemy.min_stats, randomEnemy.max_stats);
    
    setEnemy(randomEnemy);
    setEnemyStats(stats);
    setEnemyCurrentHp(stats.hp);
    setBattleEnded(false);
  };

  // 로그 추가
  const addLog = (log: BattleLog) => {
    setBattleLog(prev => [...prev, log].slice(-5)); // 최근 5개만 유지
  };

  // 플레이어 공격
  const handlePlayerAttack = () => {
    if (!playerEntity || !enemy || !enemyStats || battleEnded || turn !== 'player') return;

    const damage = calculateDamage(playerEntity.current_stats, enemyStats);
    const newEnemyHp = Math.max(0, enemyCurrentHp - damage);
    
    setEnemyCurrentHp(newEnemyHp);
    addLog({
      type: 'player_attack',
      message: `${playerEntity.current_stats.hp > 0 ? '플레이어' : ''}가 ${damage} 데미지를 입혔다!`,
      damage,
    });

    // 적 HP 0 -> 승리
    if (newEnemyHp === 0) {
      handleWin();
      return;
    }

    // 적 턴으로 전환
    setTurn('enemy');
    setTimeout(() => handleEnemyAttack(), 1000);
  };

  // 적 공격
  const handleEnemyAttack = () => {
    if (!playerEntity || !enemyStats || battleEnded) return;

    const damage = calculateDamage(enemyStats, playerEntity.current_stats);
    const newPlayerHp = Math.max(0, playerCurrentHp - damage);
    
    setPlayerCurrentHp(newPlayerHp);
    addLog({
      type: 'enemy_attack',
      message: `${enemy?.display_name}의 공격! ${damage} 데미지!`,
      damage,
    });

    // 플레이어 HP 0 -> 패배
    if (newPlayerHp === 0) {
      handleLose();
      return;
    }

    // 플레이어 턴으로 전환
    setTurn('player');
  };

  // 승리 처리
  const handleWin = () => {
    setBattleEnded(true);
    const expGained = calculateExpGain(1); // 레벨 1로 가정
    
    addLog({ type: 'player_win', message: `승리! ${expGained} 경험치 획득!` });
    
    // 포획 확률 판정
    if (enemy) {
      const captureRate = CAPTURE_RATES[enemy.rarity];
      const captured = Math.random() < captureRate;
      
      if (captured) {
        addLog({ type: 'player_win', message: `${enemy.display_name}를 포획했다!` });
        onCapture?.(enemy);
      } else {
        addLog({ type: 'player_win', message: '포획 실패...' });
      }
    }
    
    setTimeout(() => onBattleEnd('win', expGained), 2000);
  };

  // 패배 처리
  const handleLose = () => {
    setBattleEnded(true);
    addLog({ type: 'enemy_win', message: '패배...' });
    setTimeout(() => onBattleEnd('lose', 0), 2000);
  };

  // 도망
  const handleEscape = () => {
    setBattleEnded(true);
    addLog({ type: 'escape', message: '도망쳤다!' });
    setTimeout(() => onBattleEnd('escape', 0), 1000);
  };

  if (!playerEntity || !enemy || !enemyStats) {
    return <div className="text-white">전투 준비 중...</div>;
  }

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-4xl">
      {/* 전투 화면 */}
      <div className="grid grid-cols-2 gap-8 w-full">
        {/* 플레이어 엔티티 */}
        <div className="bg-[#16213e] border-4 border-[#10b981] rounded-2xl p-6">
          <div className="text-center mb-4">
            <div className="text-6xl mb-2">🛡️</div>
            <h3 className="text-xl font-bold text-white">플레이어</h3>
            <p className="text-sm text-[#10b981]">Lv.{playerEntity.current_level}</p>
          </div>
          
          {/* HP 바 */}
          <div className="mb-4">
            <div className="flex justify-between text-sm text-white mb-1">
              <span>HP</span>
              <span>{playerCurrentHp} / {playerEntity.current_stats.hp}</span>
            </div>
            <div className="w-full bg-[#1a1a2e] rounded-full h-4 overflow-hidden">
              <div 
                className="bg-[#10b981] h-full transition-all duration-300"
                style={{ width: `${(playerCurrentHp / playerEntity.current_stats.hp) * 100}%` }}
              />
            </div>
          </div>

          {/* 스탯 */}
          <div className="grid grid-cols-2 gap-2 text-sm text-[#e5e7eb]">
            <div>ATK: {playerEntity.current_stats.atk}</div>
            <div>DEF: {playerEntity.current_stats.def}</div>
            <div>MATK: {playerEntity.current_stats.matk}</div>
            <div>MDEF: {playerEntity.current_stats.mdef}</div>
          </div>
        </div>

        {/* 적 엔티티 */}
        <div className="bg-[#16213e] border-4 border-[#8b5cf6] rounded-2xl p-6">
          <div className="text-center mb-4">
            <div className="text-6xl mb-2">👾</div>
            <h3 className="text-xl font-bold text-white">{enemy.display_name}</h3>
            <p className="text-sm text-[#8b5cf6]">{enemy.element} / {enemy.rarity}</p>
          </div>
          
          {/* HP 바 */}
          <div className="mb-4">
            <div className="flex justify-between text-sm text-white mb-1">
              <span>HP</span>
              <span>{enemyCurrentHp} / {enemyStats.hp}</span>
            </div>
            <div className="w-full bg-[#1a1a2e] rounded-full h-4 overflow-hidden">
              <div 
                className="bg-[#8b5cf6] h-full transition-all duration-300"
                style={{ width: `${(enemyCurrentHp / enemyStats.hp) * 100}%` }}
              />
            </div>
          </div>

          {/* 스탯 */}
          <div className="grid grid-cols-2 gap-2 text-sm text-[#e5e7eb]">
            <div>ATK: {enemyStats.atk}</div>
            <div>DEF: {enemyStats.def}</div>
            <div>MATK: {enemyStats.matk}</div>
            <div>MDEF: {enemyStats.mdef}</div>
          </div>
        </div>
      </div>

      {/* 전투 로그 */}
      <div className="w-full bg-[#16213e] border-2 border-[#8b5cf6]/30 rounded-lg p-4">
        <h3 className="text-[#8b5cf6] font-bold mb-2">전투 로그</h3>
        <div className="space-y-1">
          {battleLog.map((log, i) => (
            <div 
              key={i} 
              className={`text-sm ${
                log.type === 'player_attack' ? 'text-[#10b981]' : 
                log.type === 'enemy_attack' ? 'text-[#ef4444]' : 
                'text-[#e5e7eb]'
              }`}
            >
              {log.message}
            </div>
          ))}
        </div>
      </div>

      {/* 액션 버튼 */}
      <div className="flex gap-4">
        <button
          onClick={handlePlayerAttack}
          disabled={battleEnded || turn !== 'player'}
          className={`px-8 py-3 rounded-lg font-bold text-white transition-all ${
            battleEnded || turn !== 'player'
              ? 'bg-gray-600 cursor-not-allowed'
              : 'bg-[#10b981] hover:bg-[#059669] shadow-lg shadow-[#10b981]/50'
          }`}
        >
          ⚔️ 공격
        </button>
        
        <button
          onClick={handleEscape}
          disabled={battleEnded}
          className={`px-8 py-3 rounded-lg font-bold text-white transition-all ${
            battleEnded
              ? 'bg-gray-600 cursor-not-allowed'
              : 'bg-[#ef4444] hover:bg-[#dc2626]'
          }`}
        >
          🏃 도망
        </button>
      </div>

      {/* 턴 표시 */}
      {!battleEnded && (
        <div className="text-center">
          <div className="text-[#8b5cf6] font-bold text-lg">
            {turn === 'player' ? '플레이어 턴' : '적 턴...'}
          </div>
        </div>
      )}
    </div>
  );
}
