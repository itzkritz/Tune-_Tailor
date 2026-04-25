import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Music } from 'lucide-react';
import { useSession } from '@/lib/AuthContext';

export default function AuthPage() {
  const navigate = useNavigate();
  const { signIn, register, signInWithGoogle } = useSession();
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    // Format username securely to act as an invisible email for the database uniqueness
    const formattedUsername = username.trim();
    if (formattedUsername.length < 3) {
      setErrorMsg("Username must be at least 3 characters.");
      setIsLoading(false);
      return;
    }

    const systemEmail = `${formattedUsername.toLowerCase().replace(/[^a-z0-9]/g, '')}@tunetailor.local`;

    if (isLogin) {
      try {
        await signIn(systemEmail, password);
        navigate('/dashboard');
      } catch (err) {
        setErrorMsg("Invalid username or password. Please try again.");
      }
    } else {
      try {
        await register(systemEmail, password, formattedUsername);
        // Immediately log them in after a successful register
        await signIn(systemEmail, password);
        navigate('/dashboard');
      } catch(err) {
        setErrorMsg(err.message || "Something went wrong. Please try again.");
      }
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center px-6">
      <div className="w-full max-w-md animate-slide-up">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-12 cursor-pointer" onClick={() => navigate('/')}>
          <div className="bg-[var(--text-h)] p-2 rounded-lg">
            <Music className="w-5 h-5 text-[var(--bg)]" />
          </div>
          <span className="text-xl font-bold font-heading tracking-tight text-[var(--text-h)]">
            Tune<span className="text-[var(--text)] opacity-60">Tailor</span>
          </span>
        </div>

        {/* Card */}
        <div className="bg-[var(--bg)] border border-[var(--border)] rounded-2xl p-8 shadow-lg">
          <h2 className="text-3xl font-bold text-[var(--text-h)] font-heading mb-2">
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h2>
          <p className="text-[var(--text)] mb-8">
            {isLogin ? 'Sign in to view your mood history.' : 'Start tracking your daily moods.'}
          </p>

          {errorMsg && (
            <div className="bg-red-500/10 text-red-400 border border-red-500/20 rounded-lg px-4 py-3 mb-6 text-sm">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <input 
              type="text" 
              placeholder="Username" 
              value={username} 
              onChange={(e) => setUsername(e.target.value)} 
              required 
              className="w-full bg-[var(--accent-bg)] border border-[var(--border)] rounded-xl px-4 py-3.5 text-[var(--text-h)] placeholder:text-[var(--text)]/40 focus:outline-none focus:border-[var(--text-h)]/30 transition-colors"
            />
            <input 
              type="password" 
              placeholder="Password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
              className="w-full bg-[var(--accent-bg)] border border-[var(--border)] rounded-xl px-4 py-3.5 text-[var(--text-h)] placeholder:text-[var(--text)]/40 focus:outline-none focus:border-[var(--text-h)]/30 transition-colors"
            />
            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-[var(--text-h)] text-[var(--bg)] py-3.5 rounded-xl font-bold text-sm hover:opacity-90 transition-all active:scale-[0.98] disabled:opacity-50"
            >
              {isLoading ? 'Processing...' : (isLogin ? 'Sign In' : 'Sign Up')}
            </button>
          </form>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[var(--border)] opacity-30"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-[var(--bg)] px-2 text-[var(--text)] opacity-40 font-bold tracking-wider">Or</span>
            </div>
          </div>

          <button 
            type="button" 
            onClick={() => signInWithGoogle()}
            className="w-full bg-[var(--accent-bg)] border border-[var(--border)] text-[var(--text-h)] py-3.5 rounded-xl font-bold text-sm hover:border-[var(--text-h)]/30 transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>

          <p className="text-center mt-6 text-sm text-[var(--text)]">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button 
              onClick={() => { setIsLogin(!isLogin); setErrorMsg(''); }}
              className="text-[var(--text-h)] font-semibold hover:underline"
            >
              {isLogin ? 'Sign Up' : 'Log In'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
