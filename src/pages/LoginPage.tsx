import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, User, Eye, EyeOff } from 'lucide-react';
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await register(email, password, name);
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

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left side - branding */}
      <div className="hidden lg:flex flex-1 items-center justify-center relative overflow-hidden" style={{ background: 'var(--gradient-primary)' }}>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-64 h-64 bg-white rounded-full" />
          <div className="absolute bottom-20 right-20 w-48 h-48 bg-white rounded-full" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white rounded-full" />
        </div>
        <div className="relative z-10 text-center text-white px-12">
          <h1 className="text-5xl font-extrabold mb-4">💰 Finance Control</h1>
          <p className="text-xl opacity-90 font-medium">আপনার আর্থিক ব্যবস্থাপনার সেরা সমাধান</p>
          <p className="text-sm opacity-70 mt-2">Premium Money Manager by Robi</p>
        </div>
      </div>

      {/* Right side - form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="lg:hidden text-center mb-8">
            <h1 className="text-3xl font-extrabold gradient-text">💰 Finance Control</h1>
            <p className="text-sm text-muted-foreground mt-1">by Robi</p>
          </div>

          <div className="bg-card rounded-3xl p-8 shadow-xl border border-border">
            <h2 className="text-2xl font-bold mb-1">{isLogin ? 'Welcome Back!' : 'Create Account'}</h2>
            <p className="text-muted-foreground text-sm mb-6">
              {isLogin ? 'Sign in to your account' : 'Sign up to get started'}
            </p>

            {error && (
              <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-xl mb-4">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div className="relative">
                  <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    value={name} onChange={e => setName(e.target.value)}
                    placeholder="Full Name"
                    className="w-full pl-11 pr-4 py-3 bg-muted rounded-xl outline-none font-medium focus:ring-2 focus:ring-primary/30"
                  />
                </div>
              )}
              <div className="relative">
                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="Email address" required
                  className="w-full pl-11 pr-4 py-3 bg-muted rounded-xl outline-none font-medium focus:ring-2 focus:ring-primary/30"
                />
              </div>
              <div className="relative">
                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type={showPass ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="Password" required minLength={6}
                  className="w-full pl-11 pr-11 py-3 bg-muted rounded-xl outline-none font-medium focus:ring-2 focus:ring-primary/30"
                />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              <motion.button
                whileTap={{ scale: 0.97 }}
                type="submit" disabled={loading}
                className="w-full py-3 rounded-xl font-bold bg-primary text-primary-foreground shadow-lg disabled:opacity-50"
              >
                {loading ? '...' : isLogin ? 'Sign In' : 'Create Account'}
              </motion.button>
            </form>

            <div className="flex items-center gap-3 my-5">
              <div className="flex-1 h-px bg-border" />
              <span className="text-xs text-muted-foreground">OR</span>
              <div className="flex-1 h-px bg-border" />
            </div>

            <button
              onClick={handleGoogle}
              className="w-full py-3 rounded-xl font-semibold border border-border bg-card hover:bg-muted transition-colors flex items-center justify-center gap-3"
            >
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Sign in with Google
            </button>

            <button
              onClick={continueAsGuest}
              className="w-full py-3 mt-3 rounded-xl font-semibold text-muted-foreground hover:bg-muted transition-colors"
            >
              Continue as Guest
            </button>

            <p className="text-center text-sm text-muted-foreground mt-5">
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <button onClick={() => { setIsLogin(!isLogin); setError(''); }} className="text-primary font-semibold">
                {isLogin ? 'Sign Up' : 'Sign In'}
              </button>
            </p>
          </div>

          <p className="text-center text-xs text-muted-foreground mt-4">Developer: Robi · WhatsApp: 01726782512</p>
        </motion.div>
      </div>
    </div>
  );
}
