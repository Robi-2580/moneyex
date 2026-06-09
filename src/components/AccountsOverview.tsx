import { ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import { CategoryIcon } from '@/lib/icon-map';

export default function AccountsOverview() {
  const { state, t, fmt } = useApp();
  const navigate = useNavigate();

  const walletTypeLabel = (type: string) => {
    const map: Record<string, string> = {
      bank: t('bank'),
      cash: t('cash'),
      mobile: t('mobile'),
    };
    return map[type] || type;
  };

  return (
    <>
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-sm">{t('accounts')}</h3>
        <button onClick={() => navigate('/wallets')} className="text-xs text-primary font-medium flex items-center gap-1">
          {t('viewAll')} <ChevronRight size={14} />
        </button>
      </div>
      <div className="grid grid-cols-2 gap-2.5">
        {state.wallets.map(wallet => (
          <div
            key={wallet.id}
            className="bg-card rounded-2xl border border-border p-3 hover:shadow-sm transition-shadow cursor-pointer"
            onClick={() => navigate('/wallets')}
          >
            <div className="flex items-center gap-2 mb-1.5">
              <span className="inline-flex w-7 h-7 rounded-lg items-center justify-center" style={{ backgroundColor: (wallet.color || '#6B7280') + '20', color: wallet.color || '#6B7280' }}>
                <CategoryIcon icon={wallet.icon} size={14} />
              </span>
              <span className="text-[10px] text-muted-foreground">{walletTypeLabel(wallet.type)}</span>
            </div>
            <p className="font-bold text-base">{fmt(wallet.balance)}</p>
          </div>
        ))}
      </div>
    </>
  );
}
