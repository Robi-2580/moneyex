import { ChevronRight, ArrowDownLeft, ArrowUpRight, Landmark } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import { useMemo } from 'react';

export default function LoanSummaryCard() {
  const { state, t } = useApp();
  const navigate = useNavigate();

  const summary = useMemo(() => {
    const active = state.loans.filter(l => l.status === 'active');
    const receivable = active.filter(l => l.type === 'receivable').reduce((s, l) => s + (l.amount - l.paidAmount), 0);
    const payable = active.filter(l => l.type === 'payable').reduce((s, l) => s + (l.amount - l.paidAmount), 0);
    const loan = active.filter(l => l.type === 'loan').reduce((s, l) => s + (l.amount - l.paidAmount), 0);
    return { receivable, payable, loan };
  }, [state.loans]);

  return (
    <>
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-sm">{t('loanSummary')}</h3>
        <button onClick={() => navigate('/loans')} className="text-xs text-primary font-medium flex items-center gap-1">
          {t('viewAll')} <ChevronRight size={14} />
        </button>
      </div>
      <div className="grid grid-cols-3 gap-2.5">
        <div className="bg-card rounded-2xl border border-border p-3 text-center">
          <div className="w-8 h-8 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-1.5">
            <ArrowDownLeft size={16} className="text-success" />
          </div>
          <p className="text-[10px] text-muted-foreground mb-0.5">{t('receivable')}</p>
          <p className="font-bold text-sm text-success">৳{summary.receivable.toLocaleString()}</p>
        </div>
        <div className="bg-card rounded-2xl border border-border p-3 text-center">
          <div className="w-8 h-8 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-1.5">
            <ArrowUpRight size={16} className="text-destructive" />
          </div>
          <p className="text-[10px] text-muted-foreground mb-0.5">{t('payable')}</p>
          <p className="font-bold text-sm text-destructive">৳{summary.payable.toLocaleString()}</p>
        </div>
        <div className="bg-card rounded-2xl border border-border p-3 text-center">
          <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-1.5">
            <Landmark size={16} className="text-accent" />
          </div>
          <p className="text-[10px] text-muted-foreground mb-0.5">{t('loan')}</p>
          <p className="font-bold text-sm">৳{summary.loan.toLocaleString()}</p>
        </div>
      </div>
    </>
  );
}
