import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Tag, Target, Download, Upload, Trash2, Globe, Type, Cloud } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { useAuth } from '@/context/AuthContext';
import { FONTS } from '@/data/defaults';

export default function SettingsPage() {
  const { state, dispatch, t, dbDispatch } = useApp();
  const { user, isGuest } = useAuth();
  const navigate = useNavigate();

  const d = (action: any) => {
    if (user && !isGuest) {
      dbDispatch(action);
    } else {
      dispatch(action);
    }
  };

  const exportData = () => {
    const data = JSON.stringify(state, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `finance-control-backup-${new Date().toISOString().split('T')[0]}.json`;
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
    d({ type: 'SET_LANGUAGE', payload: state.language === 'bn' ? 'en' : 'bn' });
  };

  const allFonts = [...FONTS.bn, ...FONTS.en];

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

      {/* Font Selection */}
      <div className="bg-card rounded-2xl border border-border p-4 space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <Type size={20} />
          </div>
          <div>
            <p className="font-semibold text-sm">{t('font')}</p>
            <p className="text-xs text-muted-foreground">{t('selectFont')}</p>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-xs font-semibold text-muted-foreground px-1">বাংলা ফন্ট</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {FONTS.bn.map(font => (
              <button
                key={font.value}
                onClick={() => d({ type: 'SET_FONT', payload: font.value })}
                className={`text-left p-3 rounded-xl border transition-all text-sm ${
                  state.fontFamily === font.value
                    ? 'border-primary bg-primary/5 font-semibold'
                    : 'border-border hover:border-primary/30'
                }`}
                style={{ fontFamily: font.value }}
              >
                <span className="block font-bold">{font.name}</span>
                <span className="text-xs text-muted-foreground">আমার অর্থ ব্যবস্থাপনা</span>
              </button>
            ))}
          </div>

          <p className="text-xs font-semibold text-muted-foreground px-1 mt-3">English Fonts</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {FONTS.en.map(font => (
              <button
                key={font.value}
                onClick={() => d({ type: 'SET_FONT', payload: font.value })}
                className={`text-left p-3 rounded-xl border transition-all text-sm ${
                  state.fontFamily === font.value
                    ? 'border-primary bg-primary/5 font-semibold'
                    : 'border-border hover:border-primary/30'
                }`}
                style={{ fontFamily: font.value }}
              >
                <span className="block font-bold">{font.name}</span>
                <span className="text-xs text-muted-foreground">Finance Control App</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Cloud Sync Status */}
      {user && !isGuest && (
        <div className="bg-card rounded-2xl border border-border p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <Cloud size={20} />
            </div>
            <div>
              <p className="font-semibold text-sm">{t('cloudSync')}</p>
              <p className="text-xs text-emerald-500 font-medium">✓ {t('synced')} — {user.email}</p>
            </div>
          </div>
        </div>
      )}

      {/* Menu Items */}
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

      <div className="text-center pt-6 space-y-1">
        <p className="text-sm font-bold text-foreground">Finance Control v1.0</p>
        <p className="text-xs text-muted-foreground">Developer: Robi</p>
        <p className="text-xs text-muted-foreground">WhatsApp: 01726782512</p>
        <p className="text-xs text-muted-foreground mt-2">
          {user && !isGuest ? '☁️ Cloud sync active' : '📱 Data stored locally'}
        </p>
      </div>
    </div>
  );
}
