import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, Eye, EyeOff, ArrowRight, Shield, Wallet, TrendingUp, BarChart3 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function LoginPage() {
  const { login, register, loginWithGoogle, continueAsGuest } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await register(email, password, name);
        setSuccess('অ্যাকাউন্ট তৈরি হয়েছে! ইমেইল ভেরিফাই করুন।');
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError('');
    try {
      await loginWithGoogle();
    } catch (err: any) {
      setError(err.message || 'Google login failed');
    }
  };

  const features = [
    { icon: Wallet, title: 'মাল্টি ওয়ালেট', desc: 'ক্যাশ, ব্যাংক, মোবাইল' },
    { icon: TrendingUp, title: 'আয়-ব্যয় ট্র্যাকিং', desc: 'রিয়েল-টাইম হিসাব' },
    { icon: BarChart3, title: 'রিপোর্ট ও চার্ট', desc: 'বিস্তারিত বিশ্লেষণ' },
    { icon: Shield, title: 'নিরাপদ ক্লাউড', desc: 'সব ডিভাইসে সিঙ্ক' },
  ];

  return (
    <div className="min-h-screen flex bg-background">
      {/* Left Panel — Branding */}
      <div className="hidden lg:flex flex-1 items-center justify-center relative overflow-hidden">
        {/* Gradient background */}
        <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, hsl(239 84% 57%), hsl(260 90% 50%), hsl(280 80% 55%))' }} />
        
        {/* Decorative circles */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-20 -left-20 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-32 -right-20 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute top-1/3 right-1/4 w-48 h-48 bg-white/5 rounded-full blur-2xl" />
        </div>

        {/* Pattern overlay */}
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
          backgroundSize: '40px 40px'
        }} />

        <div className="relative z-10 text-center text-white px-12 max-w-lg">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <div className="w-20 h-20 rounded-2xl bg-white/15 backdrop-blur-lg flex items-center justify-center text-4xl mx-auto mb-6 shadow-2xl border border-white/20">
              💰
            </div>
            <h1 className="text-4xl font-extrabold mb-3 tracking-tight">Finance Control</h1>
            <p className="text-lg opacity-90 font-medium mb-2">আপনার আর্থিক ব্যবস্থাপনার সেরা সমাধান</p>
            <p className="text-sm opacity-60 mb-10">Premium Money Manager by Robi</p>
          </motion.div>

          {/* Feature cards */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="grid grid-cols-2 gap-3"
          >
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 + i * 0.1 }}
                className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/10 text-left hover:bg-white/15 transition-colors"
              >
                <f.icon size={20} className="mb-1.5 opacity-90" />
                <p className="text-sm font-bold">{f.title}</p>
                <p className="text-xs opacity-70">{f.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Right Panel — Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-3xl mx-auto mb-3">
              💰
            </div>
            <h1 className="text-2xl font-extrabold text-foreground">Finance Control</h1>
            <p className="text-xs text-muted-foreground mt-1">Premium Money Manager by Robi</p>
          </div>

          {/* Form Card */}
          <div className="bg-card rounded-3xl p-8 shadow-2xl border border-border/60">
            {/* Tab Switcher */}
            <div className="flex bg-muted rounded-xl p-1 mb-6">
              <button
                onClick={() => { setIsLogin(true); setError(''); setSuccess(''); }}
                className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${
                  isLogin ? 'bg-primary text-primary-foreground shadow-md' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                সাইন ইন
              </button>
              <button
                onClick={() => { setIsLogin(false); setError(''); setSuccess(''); }}
                className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${
                  !isLogin ? 'bg-primary text-primary-foreground shadow-md' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                সাইন আপ
              </button>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={isLogin ? 'login' : 'register'}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <h2 className="text-xl font-bold mb-1">
                  {isLogin ? 'ফিরে আসার জন্য স্বাগতম!' : 'নতুন অ্যাকাউন্ট তৈরি করুন'}
                </h2>
                <p className="text-muted-foreground text-sm mb-5">
                  {isLogin ? 'আপনার অ্যাকাউন্টে সাইন ইন করুন' : 'ফ্রি অ্যাকাউন্ট তৈরি করে শুরু করুন'}
                </p>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-destructive/10 text-destructive text-sm p-3 rounded-xl mb-4 flex items-center gap-2"
                  >
                    <span className="text-lg">⚠️</span> {error}
                  </motion.div>
                )}

                {success && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-emerald-500/10 text-emerald-600 text-sm p-3 rounded-xl mb-4 flex items-center gap-2"
                  >
                    <span className="text-lg">✅</span> {success}
                  </motion.div>
                )}

                <form onSubmit={handleSubmit} className="space-y-3">
                  {!isLogin && (
                    <div className="relative group">
                      <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" />
                      <input
                        value={name} onChange={e => setName(e.target.value)}
                        placeholder="আপনার নাম"
                        className="w-full pl-11 pr-4 py-3 bg-muted/60 rounded-xl outline-none font-medium focus:ring-2 focus:ring-primary/30 focus:bg-muted transition-all border border-transparent focus:border-primary/20"
                      />
                    </div>
                  )}
                  <div className="relative group">
                    <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <input
                      type="email" value={email} onChange={e => setEmail(e.target.value)}
                      placeholder="ইমেইল অ্যাড্রেস" required
                      className="w-full pl-11 pr-4 py-3 bg-muted/60 rounded-xl outline-none font-medium focus:ring-2 focus:ring-primary/30 focus:bg-muted transition-all border border-transparent focus:border-primary/20"
                    />
                  </div>
                  <div className="relative group">
                    <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <input
                      type={showPass ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                      placeholder="পাসওয়ার্ড" required minLength={6}
                      className="w-full pl-11 pr-11 py-3 bg-muted/60 rounded-xl outline-none font-medium focus:ring-2 focus:ring-primary/30 focus:bg-muted transition-all border border-transparent focus:border-primary/20"
                    />
                    <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                      {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit" disabled={loading}
                    className="w-full py-3.5 rounded-xl font-bold text-sm bg-primary text-primary-foreground shadow-lg shadow-primary/25 disabled:opacity-50 flex items-center justify-center gap-2 hover:shadow-xl hover:shadow-primary/30 transition-shadow"
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        {isLogin ? 'সাইন ইন করুন' : 'অ্যাকাউন্ট তৈরি করুন'}
                        <ArrowRight size={16} />
                      </>
                    )}
                  </motion.button>
                </form>
              </motion.div>
            </AnimatePresence>

            <div className="flex items-center gap-3 my-5">
              <div className="flex-1 h-px bg-border" />
              <span className="text-xs text-muted-foreground font-medium">অথবা</span>
              <div className="flex-1 h-px bg-border" />
            </div>

            <div className="space-y-2.5">
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleGoogle}
                className="w-full py-3 rounded-xl font-semibold border border-border bg-card hover:bg-muted/70 transition-all flex items-center justify-center gap-3 shadow-sm hover:shadow-md text-sm"
              >
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Google দিয়ে সাইন ইন
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                onClick={continueAsGuest}
                className="w-full py-3 rounded-xl font-semibold text-muted-foreground hover:bg-muted/50 transition-all text-sm border border-dashed border-border"
              >
                👤 গেস্ট মোডে চালিয়ে যান
              </motion.button>
            </div>
          </div>

          <p className="text-center text-xs text-muted-foreground mt-5 opacity-70">
            Developer: Robi · WhatsApp: 01726782512
          </p>
        </motion.div>
      </div>
    </div>
  );
}
