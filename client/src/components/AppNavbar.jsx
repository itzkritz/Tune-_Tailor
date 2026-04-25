import { useNavigate, useLocation } from 'react-router-dom';
import { Music } from 'lucide-react';
import { useSession } from '@/lib/AuthContext';
import { cn } from '@/lib/utils';

export default function AppNavbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { data: session, signOut } = useSession();

  const links = [
    { label: 'Journal', path: '/dashboard' },
    { label: 'History', path: '/history' },
    { label: 'Favorites', path: '/favorites' },
  ];

  const displayAvatar = session?.user?.image || 
    (session?.user?.email ? `https://api.dicebear.com/7.x/avataaars/svg?seed=${session.user.email}` : '');

  const handleSignOut = () => {
    signOut();
    navigate('/');
  };

  return (
    <nav className="fixed top-0 w-full z-50 transition-all duration-500 border-b bg-[var(--glass)] backdrop-blur-md border-[var(--border)] px-6 py-3 shadow-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
          <div className="bg-[var(--text-h)] p-2 rounded-lg">
            <Music className="w-5 h-5 text-[var(--bg)]" />
          </div>
          <span className="text-xl font-bold font-heading tracking-tight text-[var(--text-h)]">
            Tune<span className="text-[var(--text)] opacity-60">Tailor</span>
          </span>
        </div>

        {/* Center Nav Links */}
        <div className="hidden md:flex items-center gap-8 text-sm font-medium">
          {links.map(link => (
            <button
              key={link.path}
              onClick={() => navigate(link.path)}
              className={cn(
                "transition-colors font-semibold",
                location.pathname === link.path 
                  ? "text-[var(--text-h)]" 
                  : "text-[var(--text)] hover:text-[var(--text-h)]"
              )}
            >
              {link.label}
            </button>
          ))}
          <button
            onClick={handleSignOut}
            className="text-red-400 hover:text-red-300 transition-colors font-medium"
          >
            Log Out
          </button>
        </div>

        {/* Profile Avatar */}
        {session?.user && displayAvatar && (
          <img 
            src={displayAvatar}
            className="w-10 h-10 rounded-full border-2 border-[var(--text-h)] object-cover cursor-pointer hover:scale-105 transition-transform" 
            alt="Profile" 
            onClick={() => navigate('/profile')}
          />
        )}
      </div>
    </nav>
  );
}
