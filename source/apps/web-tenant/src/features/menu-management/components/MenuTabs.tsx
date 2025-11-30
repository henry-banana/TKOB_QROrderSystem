'use client';

import { usePathname } from 'next/navigation';
import { useAppRouter } from '@/shared/hooks/useAppRouter';
import { ROUTES } from '@/lib/routes';

const tabs = [
  { id: 'items', label: 'Menu Items', href: ROUTES.menu },
  { id: 'modifiers', label: 'Modifier Groups', href: ROUTES.menuModifiers },
];

export function MenuTabs() {
  const pathname = usePathname();
  const { goTo } = useAppRouter();

  const getActiveTab = () => {
    if (pathname.startsWith('/admin/menu/modifiers')) {
      return 'modifiers';
    }
    return 'items';
  };

  const activeTab = getActiveTab();

  return (
    <div className="inline-flex rounded-full bg-slate-100 p-1">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => goTo(tab.href)}
            className={`px-4 py-1 text-sm font-medium rounded-full transition ${
              isActive
                ? 'bg-white text-emerald-700 shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
