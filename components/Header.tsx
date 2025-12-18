'use client';

interface HeaderProps {
  points: number;
}

export default function Header({ points }: HeaderProps) {
  return (
    <header className="bg-[#16213e] border-b-4 border-[#8b5cf6] px-6 py-4">
      <div className="flex items-center justify-between">
        {/* 로고 */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#8b5cf6] rounded-lg flex items-center justify-center text-2xl">
            📦
          </div>
          <h1 className="text-2xl font-bold text-white tracking-wider">
            Archive World
          </h1>
        </div>

        {/* 포인트 표시 */}
        <div className="flex items-center gap-2 bg-[#1a1a2e] px-6 py-2 rounded-full border-2 border-[#10b981]">
          <span className="text-[#10b981] text-xl">💎</span>
          <span className="text-white font-bold text-lg">{points.toLocaleString()}</span>
          <span className="text-[#10b981] text-sm">Points</span>
        </div>
      </div>
    </header>
  );
}
