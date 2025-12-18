'use client';

export default function ArchivePanel() {
  return (
    <aside className="w-64 bg-[#16213e] border-l-4 border-[#8b5cf6] p-4 overflow-y-auto">
      <div className="mb-4">
        <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
          📚 <span>도감</span>
        </h2>
        <div className="text-sm text-[#10b981]">
          발견: <span className="font-bold">0</span> / 52
        </div>
      </div>

      {/* 도감 미니 그리드 */}
      <div className="grid grid-cols-4 gap-2">
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            className="aspect-square bg-[#1a1a2e] border-2 border-[#8b5cf6]/30 rounded-lg flex items-center justify-center text-2xl opacity-50"
          >
            ❓
          </div>
        ))}
      </div>

      {/* 더보기 버튼 */}
      <button className="mt-4 w-full py-2 bg-[#8b5cf6] text-white rounded-lg font-bold hover:bg-[#8b5cf6]/80 transition-colors">
        전체 도감 보기
      </button>
    </aside>
  );
}
