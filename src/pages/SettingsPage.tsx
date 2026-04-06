import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Tag, Target, Download, Upload, Trash2, Globe } from 'lucide-react';
import { useApp } from '@/context/AppContext';

export default function SettingsPage() {
  const { state, dispatch, t } = useApp();
  const navigate = useNavigate();

  const exportData = () => {
    const data = JSON.stringify(state, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `moneyflow-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importData = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const text = await file.text();
      try {
        const data = JSON.parse(text);
        dispatch({ type: 'SET_STATE', payload: data });
        alert('Data imported successfully!');
      } catch {
        alert('Invalid file format');
      }
    };
    input.click();
  };

  const clearData = () => {
    if (confirm('Are you sure? This will delete ALL your data permanently.')) {
      localStorage.removeItem('money-manager-data');
      window.location.reload();
    }
  };

  const toggleLanguage = () => {
    dispatch({ type: 'SET_LANGUAGE', payload: state.language === 'bn' ? 'en' : 'bn' });
  };

  const menuItems = [
    { icon: Globe, label: t('language'), desc: state.language === 'bn' ? 'বাংলা → English' : 'English → বাংলা', onClick: toggleLanguage },
    { icon: Tag, label: t('categories'), desc: 'Manage income & expense categories', onClick: () => navigate('/categories') },
    { icon: Target, label: t('budgets'), desc: 'Set monthly spending limits', onClick: () => navigate('/budgets') },
    { icon: Download, label: t('exportData'), desc: 'Download your data as JSON', onClick: exportData },
    { icon: Upload, label: t('importData'), desc: 'Restore from a backup file', onClick: importData },
    { icon: Trash2, label: t('clearData'), desc: 'Delete everything permanently', onClick: clearData, danger: true },
  ];

  return (
    <div className="py-4 space-y-5">
      <h2 className="text-xl font-bold">{t('settings')}</h2>

      <div className="space-y-2">
        {menuItems.map((item, i) => (
          <motion.button
            key={item.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            onClick={item.onClick}
            className={`w-full glass-card rounded-2xl p-4 flex items-center gap-4 text-left hover:shadow-md transition-shadow ${item.danger ? 'hover:bg-destructive/5' : ''}`}
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${item.danger ? 'bg-destructive/10 text-destructive' : 'bg-primary/10 text-primary'}`}>
              <item.icon size={20} />
            </div>
            <div>
              <p className={`font-semibold text-sm ${item.danger ? 'text-destructive' : ''}`}>{item.label}</p>
              <p className="text-xs text-muted-foreground">{item.desc}</p>
            </div>
          </motion.button>
        ))}
      </div>

      <div className="text-center pt-6">
        <p className="text-xs text-muted-foreground">MoneyFlow v1.0</p>
        <p className="text-xs text-muted-foreground">Your data is stored locally on this device</p>
      </div>
    </div>
  );
}
