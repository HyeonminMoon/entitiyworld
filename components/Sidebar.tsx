'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Sidebar() {
  const pathname = usePathname();

  const menuItems = [
    { id: 'training', label: '훈련', icon: '⚡', path: '/training' },
    { id: 'explore', label: '탐색', icon: '🗺️', path: '/explore' },
    { id: 'bag', label: '가방', icon: '🎒', path: '/bag' },
    { id: 'grow', label: '성장', icon: '📈', path: '/grow' },
    { id: 'archive', label: '도감', icon: '📚', path: '/archive' },
  ];

  return (
    <aside className="w-48 bg-[#16213e] border-r-4 border-[#8b5cf6] p-4">
      <nav className="flex flex-col gap-2">
        {menuItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <Link
              key={item.id}
              href={item.path}
              className={`
              flex items-center gap-3 px-4 py-3 rounded-lg
              font-bold text-left transition-all
              border-2 border-[#8b5cf6]/30 block
              ${
                isActive
                  ? 'bg-[#8b5cf6] text-white border-[#8b5cf6] shadow-lg shadow-[#8b5cf6]/50'
                  : 'bg-[#1a1a2e] text-[#e5e7eb] hover:bg-[#8b5cf6]/20 hover:border-[#8b5cf6]'
              }
            `}
            >
              <span className="text-xl">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
