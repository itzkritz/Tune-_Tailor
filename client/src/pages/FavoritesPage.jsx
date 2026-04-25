import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSession } from '@/lib/AuthContext';
import AppNavbar from '@/components/AppNavbar';

export default function FavoritesPage() {
  const navigate = useNavigate();
  const { data: session, status } = useSession();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeMenuId, setActiveMenuId] = useState(null);

  // Bounce unauthorized directly out of the application
  useEffect(() => {
    if (status === 'unauthenticated') {
      navigate('/login', { replace: true });
    }
  }, [status, navigate]);

  // Load favorites securely mapped to the internal browser cache
  useEffect(() => {
    if (status === 'authenticated' && session?.user?.email) {
      const stored = JSON.parse(localStorage.getItem(`tt_favs_${session.user.email}`) || '[]');
      setFavorites(stored);
      setLoading(false);
    }
  }, [session, status]);

  const removeFavorite = (trackId) => {
    if (!session?.user?.email) return;
    const storageKey = `tt_favs_${session.user.email}`;
    const updated = favorites.filter(t => t.id !== trackId);
    localStorage.setItem(storageKey, JSON.stringify(updated));
    setFavorites(updated);
  };

  const toggleProfilePin = (e, track) => {
    e.preventDefault();
    e.stopPropagation();
    if (!session?.user?.email) return;
    
    const pinKey = `tt_profile_songs_${session.user.email}`;
    let pinned = JSON.parse(localStorage.getItem(pinKey) || '[]');
    
    const identifier = track.id || track.name;
    const isPinned = pinned.some(p => (p.id || p.name) === identifier);
    
    if (isPinned) {
      pinned = pinned.filter(p => (p.id || p.name) !== identifier);
      localStorage.setItem(pinKey, JSON.stringify(pinned));
      alert('Removed from Profile.');
    } else {
      if (pinned.length >= 4) {
        alert('You can only pin up to 4 tracks to your profile. Remove one first!');
        return;
      }
      pinned.push(track);
      localStorage.setItem(pinKey, JSON.stringify(pinned));
      alert('Pinned to your Profile!');
    }
    setActiveMenuId(null);
  };

  if (status === 'loading') return null;

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <AppNavbar />

      {/* Invisible Dropdown Dismiss Overlay */}
      {activeMenuId && (
        <div 
          className="fixed inset-0 z-10"
          onMouseDown={() => setActiveMenuId(null)}
        />
      )}

      <main className="pt-24 pb-16 px-6 flex flex-col items-center">
        <div className="text-center mb-12 animate-slide-up">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-[var(--text-h)] font-heading mb-4">
            Favorite Tracks
          </h1>
          <p className="text-lg text-[var(--text)]">
            Your hand-picked acoustic resonances.
          </p>
        </div>

        <div className="w-full max-w-3xl">
          {loading ? (
            <p className="text-center text-[var(--text)]">Loading favorites vault...</p>
          ) : favorites.length === 0 ? (
            <div className="p-8 bg-[var(--accent-bg)] border border-[var(--border)] rounded-2xl text-center">
              <p className="text-[var(--text-h)] text-lg font-semibold mb-2">Your favorites vault is completely empty.</p>
              <p className="text-[var(--text)]">Go hit the '❤️' icon on any track inside your Journal generator to save them forever!</p>
            </div>
          ) : (
            <div className="w-full animate-fade-in">
              {/* Spotify style header */}
              <div className="grid grid-cols-[40px_1.5fr_1fr_150px] px-4 py-3 border-b border-[var(--border)] text-xs font-bold tracking-wider uppercase text-[var(--text)]">
                <span>#</span>
                <span>Title</span>
                <span>Album</span>
                <span className="text-right pr-4">Actions</span>
              </div>

              {favorites.map((track, i) => {
                const pinKey = `tt_profile_songs_${session?.user?.email}`;
                const pinned = JSON.parse(localStorage.getItem(pinKey) || '[]');
                const isPinned = pinned.some(p => (p.id || p.name) === (track.id || track.name));

                return (
                  <div 
                    key={track.id + i} 
                    className="grid grid-cols-[40px_1.5fr_1fr_150px] items-center px-4 py-3 rounded-lg transition-colors hover:bg-[var(--accent-bg)] border-b border-[var(--border)]/30 group"
                    style={{ position: 'relative', zIndex: activeMenuId === track.id ? 100 : 1 }}
                  >
                    <span className="text-[var(--text)] text-sm">{i + 1}</span>
                    
                    <div className="flex items-center gap-3 overflow-hidden">
                      {track.image && <img src={track.image} className="w-10 h-10 rounded" alt="art" />}
                      <div className="flex flex-col overflow-hidden">
                        <span className="text-[var(--text-h)] font-semibold text-sm truncate">{track.name}</span>
                        <span className="text-[var(--text)] text-xs">{track.artist}</span>
                      </div>
                    </div>

                    <span className="text-[var(--text)] text-sm truncate">{track.album || 'Single'}</span>

                    <div className="flex gap-2 items-center justify-end">
                      <button 
                        onClick={() => {
                          if (track.external_url) {
                            window.open(track.external_url, '_blank');
                          } else {
                            window.open(`https://open.spotify.com/search/${encodeURIComponent(track.name + ' ' + track.artist)}`, '_blank');
                          }
                        }}
                        className="px-3 py-1 bg-[#1DB954] rounded-full text-[10px] font-bold text-black hover:bg-[#1ed760] transition-colors"
                      >
                        PLAY
                      </button>
                      
                      <button 
                        onClick={() => removeFavorite(track.id)}
                        className="text-lg hover:scale-110 transition-transform"
                        title="Remove"
                      >
                        💔
                      </button>
                      
                      {/* Ellipsis Options Menu */}
                      <div className="relative">
                        <button 
                          onClick={() => setActiveMenuId(activeMenuId === track.id ? null : track.id)}
                          className="text-[var(--text-h)] text-lg hover:opacity-70 transition-opacity"
                        >
                          ⋮
                        </button>
                        
                        {activeMenuId === track.id && (
                          <div className="absolute right-0 top-full mt-2 bg-[var(--bg)] border border-[var(--border)] rounded-xl p-2 w-44 z-[200] shadow-xl">
                            <button 
                              onMouseDown={(e) => toggleProfilePin(e, track)}
                              className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors hover:bg-[var(--accent-bg)] ${isPinned ? 'text-[var(--text-h)] font-semibold' : 'text-[var(--text)]'}`}
                            >
                              {isPinned ? '⭐ Shown on Profile' : '☆ Show on Profile'}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
