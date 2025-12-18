'use client';

interface SidebarProps {
  activeMenu: string;
  onMenuChange: (menu: string) => void;
}

export default function Sidebar({ activeMenu, onMenuChange }: SidebarProps) {
  const menuItems = [
    { id: 'training', label: '훈련', icon: '⚡' },
    { id: 'explore', label: '탐색', icon: '🗺️' },
    { id: 'grow', label: '성장', icon: '📈' },
    { id: 'archive', label: '도감', icon: '📚' },
  ];

  return (
    <aside className="w-48 bg-[#16213e] border-r-4 border-[#8b5cf6] p-4">
      <nav className="flex flex-col gap-2">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onMenuChange(item.id)}
            className={`
              flex items-center gap-3 px-4 py-3 rounded-lg
              font-bold text-left transition-all
              border-2 border-[#8b5cf6]/30
              ${
                activeMenu === item.id
                  ? 'bg-[#8b5cf6] text-white border-[#8b5cf6] shadow-lg shadow-[#8b5cf6]/50'
                  : 'bg-[#1a1a2e] text-[#e5e7eb] hover:bg-[#8b5cf6]/20 hover:border-[#8b5cf6]'
              }
            `}
          >
            <span className="text-2xl">{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>
    </aside>
  );
}
