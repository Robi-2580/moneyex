import { useApp } from '@/context/AppContext';
import { useState } from 'react';

interface Props {
  onQuickAdd: (categoryId: string) => void;
}

export default function QuickEntryGrid({ onQuickAdd }: Props) {
  const { state, t, catName } = useApp();
  const [quickMode, setQuickMode] = useState(true);

  const expenseCategories = state.categories.filter(c => c.type === 'expense').slice(0, 9);

  return (
    <>
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-sm">{t('budgetStatus')}</h3>
        <label className="flex items-center gap-1.5 text-xs text-muted-foreground cursor-pointer">
          {t('quickEntry')}
          <div
            className={`w-8 h-4 rounded-full transition-colors ${quickMode ? 'bg-primary' : 'bg-muted'} relative cursor-pointer`}
            onClick={() => setQuickMode(!quickMode)}
          >
            <div className={`w-3.5 h-3.5 rounded-full bg-white absolute top-0.5 transition-transform ${quickMode ? 'translate-x-4' : 'translate-x-0.5'}`} />
          </div>
        </label>
      </div>
      <div className="grid grid-cols-3 gap-2.5">
        {expenseCategories.map(cat => (
          <button
            key={cat.id}
            onClick={() => onQuickAdd(cat.id)}
            className="bg-card rounded-2xl border border-border p-3 text-center hover:shadow-sm hover:border-primary/30 transition-all group"
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-1.5 text-xl group-hover:scale-110 transition-transform"
              style={{ backgroundColor: cat.color + '15' }}
            >
              {cat.icon}
            </div>
            <p className="text-xs font-medium truncate">{catName(cat)}</p>
            <p className="text-[9px] text-muted-foreground">
              {quickMode ? t('clickToAdd').substring(0, 20) + '...' : ''}
            </p>
          </button>
        ))}
      </div>
    </>
  );
}
