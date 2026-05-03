import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Tag, Target, Download, Upload, Trash2, Globe, Type, Cloud, ChevronDown, Facebook, Github, Linkedin, MessageCircle, Mail } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { useAuth } from '@/context/AuthContext';
import { FONTS } from '@/data/defaults';
import { useState, useEffect } from 'react';

export default function SettingsPage() {
  const { state, dispatch, t, dbDispatch } = useApp();
  const { user, isGuest } = useAuth();
  const navigate = useNavigate();
  const [fontDropdownOpen, setFontDropdownOpen] = useState(false);

  const d = (action: any) => {
    if (user && !isGuest) {
      dbDispatch(action);
    } else {
      dispatch(action);
    }
  };

  // Preload all font stylesheets so switching is instant
  useEffect(() => {
    const allFonts = [...FONTS.bn, ...FONTS.en];
    allFonts.forEach(font => {
      const existing = document.querySelector(`link[href="${font.url}"]`);
      if (!existing) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = font.url;
        document.head.appendChild(link);
      }
    });
  }, []);

  const allFonts = [...FONTS.bn, ...FONTS.en];
  const currentFont = allFonts.find(f => f.value === state.fontFamily) || allFonts[0];
  const isBanglaFont = FONTS.bn.some(f => f.value === state.fontFamily);

  const handleFontSelect = (fontValue: string) => {
    d({ type: 'SET_FONT', payload: fontValue });
    setFontDropdownOpen(false);
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

  const menuItems = [
    { icon: Globe, label: t('language'), desc: state.language === 'bn' ? 'বাংলা → English' : 'English → বাংলা', onClick: toggleLanguage },
    { icon: Tag, label: t('categories'), desc: state.language === 'bn' ? 'আয় ও ব্যয়ের ক্যাটাগরি' : 'Manage categories', onClick: () => navigate('/categories') },
    { icon: Target, label: t('budgets'), desc: state.language === 'bn' ? 'মাসিক বাজেট সেট করুন' : 'Set monthly limits', onClick: () => navigate('/budgets') },
    { icon: Download, label: t('exportData'), desc: state.language === 'bn' ? 'JSON ফাইলে ডাউনলোড করুন' : 'Download as JSON', onClick: exportData },
    { icon: Upload, label: t('importData'), desc: state.language === 'bn' ? 'ব্যাকআপ থেকে পুনরুদ্ধার করুন' : 'Restore from backup', onClick: importData },
    { icon: Trash2, label: t('clearData'), desc: state.language === 'bn' ? 'সব ডাটা স্থায়ীভাবে মুছুন' : 'Delete everything', onClick: clearData, danger: true },
  ];

  return (
    <div className="py-4 space-y-5">
      <h2 className="text-xl font-bold">{t('settings')}</h2>

      {/* Font Selection Dropdown */}
      <div className="bg-card rounded-2xl border border-border p-4 space-y-3">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <Type size={20} />
          </div>
          <div>
            <p className="font-semibold text-sm">{t('font')}</p>
            <p className="text-xs text-muted-foreground">{t('selectFont')}</p>
          </div>
        </div>

        {/* Current font dropdown */}
        <div className="relative">
          <button
            onClick={() => setFontDropdownOpen(!fontDropdownOpen)}
            className="w-full flex items-center justify-between p-3 rounded-xl border border-border hover:border-primary/40 transition-all bg-background"
          >
            <div className="flex items-center gap-3">
              <span
                className="text-base font-bold"
                style={{ fontFamily: currentFont.value }}
              >
                {currentFont.name}
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                {isBanglaFont ? 'বাংলা' : 'English'}
              </span>
            </div>
            <ChevronDown size={18} className={`text-muted-foreground transition-transform ${fontDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {fontDropdownOpen && (
            <div className="absolute z-50 mt-1 w-full bg-card border border-border rounded-xl shadow-xl max-h-80 overflow-y-auto">
              {/* Bengali Fonts */}
              <div className="px-3 pt-3 pb-1">
                <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">বাংলা ফন্ট</p>
              </div>
              {FONTS.bn.map(font => (
                <button
                  key={font.value}
                  onClick={() => handleFontSelect(font.value)}
                  className={`w-full text-left px-4 py-2.5 hover:bg-primary/5 transition-colors flex items-center justify-between ${
                    state.fontFamily === font.value ? 'bg-primary/10 text-primary' : ''
                  }`}
                >
                  <span style={{ fontFamily: font.value }} className="font-semibold text-sm">
                    {font.name} — <span className="font-normal">আমার অর্থ ব্যবস্থাপনা</span>
                  </span>
                  {state.fontFamily === font.value && <span className="text-primary text-xs">✓</span>}
                </button>
              ))}

              {/* English Fonts */}
              <div className="px-3 pt-3 pb-1 border-t border-border mt-1">
                <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">English Fonts</p>
              </div>
              {FONTS.en.map(font => (
                <button
                  key={font.value}
                  onClick={() => handleFontSelect(font.value)}
                  className={`w-full text-left px-4 py-2.5 hover:bg-primary/5 transition-colors flex items-center justify-between ${
                    state.fontFamily === font.value ? 'bg-primary/10 text-primary' : ''
                  }`}
                >
                  <span style={{ fontFamily: font.value }} className="font-semibold text-sm">
                    {font.name} — <span className="font-normal">Finance Control App</span>
                  </span>
                  {state.fontFamily === font.value && <span className="text-primary text-xs">✓</span>}
                </button>
              ))}
            </div>
          )}
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
