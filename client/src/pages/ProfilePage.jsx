import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSession } from '@/lib/AuthContext';
import { useTheme } from '@/lib/ThemeContext';
import { supabase } from '@/lib/supabase';
import { Moon, Sun } from 'lucide-react';
import AppNavbar from '@/components/AppNavbar';

export default function ProfilePage() {
  const navigate = useNavigate();
  const { data: session, status } = useSession();
  const { isDarkMode, toggleDarkMode } = useTheme();
  
  const [username, setUsername] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [customBanner, setCustomBanner] = useState('');
  const [featuredSongs, setFeaturedSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  // Bounce unauthorized directly out of the application
  useEffect(() => {
    if (status === 'unauthenticated') {
      navigate('/login', { replace: true });
    }
  }, [status, navigate]);

  // Read native Supabase data 
  useEffect(() => {
    async function loadProfile() {
      if (status !== 'authenticated' || !session?.user?.email) return;

      try {
        const { data: userRow } = await supabase
          .from('users')
          .select('*')
          .eq('email', session.user.email)
          .single();

        if (userRow) {
          setUsername(userRow.username || '');
          setAvatarUrl(userRow.avatar_url || '');
          if (userRow.banner_url) {
            setCustomBanner(userRow.banner_url);
          } else {
            setCustomBanner(localStorage.getItem('tt_banner') || '');
          }
        } else if (session?.user) {
          setUsername(session.user.name || session.user.email?.split('@')[0]);
          setAvatarUrl(session.user.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${session.user.email}`);
          setCustomBanner(localStorage.getItem('tt_banner') || '');
        }
        
        // Fetch globally pinned songs (Migrate older single-song if exists)
        const pinnedList = localStorage.getItem(`tt_profile_songs_${session.user.email}`);
        if (pinnedList) {
          setFeaturedSongs(JSON.parse(pinnedList));
        } else {
          const oldPinned = localStorage.getItem(`tt_profile_song_${session.user.email}`);
          if (oldPinned) setFeaturedSongs([JSON.parse(oldPinned)]);
        }

      } catch (err) {
        console.error("Failed fetching Supabase user:", err);
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, [session, status]);

  const handleSave = async () => {
    if (!session?.user?.email) return;
    setSaving(true);
    try {
      // First attempt to save all metrics into Supabase natively
      const { error } = await supabase
        .from('users')
        .update({ username, avatar_url: avatarUrl, banner_url: customBanner })
        .eq('email', session.user.email);
        
      if (error) throw error;
      
    } catch (err) {
      // Graceful fallback: The Postgres 'banner_url' schema column likely doesn't exist yet!
      console.warn("Banner column missing in DB, caching locally...", err);
      localStorage.setItem('tt_banner', customBanner);
      
      // Execute secondary failsafe update for core columns only
      await supabase
        .from('users')
        .update({ username, avatar_url: avatarUrl })
        .eq('email', session.user.email);
    } finally {
      setIsEditing(false);
      setSaving(false);
    }
  };

  const fallbackAvatar = session?.user?.email ? `https://api.dicebear.com/7.x/avataaars/svg?seed=${session.user.email}` : '';
  const displayAvatar = avatarUrl || session?.user?.image || fallbackAvatar;
  const displayName = username || session?.user?.name || 'Authorized User';

  if (status === 'loading' || loading) return null;

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <AppNavbar />

      <main className="pt-20 pb-16 px-6 flex flex-col items-center">
        <div className="w-full max-w-3xl animate-fade-in">
          {/* Banner */}
          <div className="w-full h-56 rounded-t-2xl overflow-hidden relative border border-[var(--border)] border-b-0"
            style={!customBanner ? { background: 'linear-gradient(135deg, var(--text-h), var(--border))' } : {}}
          >
            {customBanner && <img src={customBanner} alt="Banner" className="w-full h-full object-cover" />}
          </div>
          
          {/* Profile Info Card */}
          <div className="bg-[var(--bg)] border border-[var(--border)] border-t-0 rounded-b-2xl p-8 flex flex-col md:flex-row items-start justify-between gap-6 relative shadow-lg">
            {/* Avatar */}
            <div className="flex flex-col gap-4">
              <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-[var(--bg)] shadow-2xl -mt-20 bg-[var(--accent-bg)]">
                <img src={displayAvatar} alt="Avatar" className="w-full h-full object-cover" />
              </div>
              
              {/* Details */}
              {isEditing ? (
                <div className="flex flex-col gap-4 w-80">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold tracking-wider uppercase text-[var(--text)]">Username</label>
                    <input 
                      type="text" value={username} onChange={(e) => setUsername(e.target.value)} 
                      placeholder="Your Username"
                      className="bg-[var(--accent-bg)] border border-[var(--border)] rounded-lg px-4 py-3 text-[var(--text-h)] focus:outline-none focus:border-[var(--text-h)]/30 transition-colors"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold tracking-wider uppercase text-[var(--text)]">Profile Picture URL</label>
                    <input 
                      type="url" value={avatarUrl} onChange={(e) => setAvatarUrl(e.target.value)} 
                      placeholder="Avatar Image URL"
                      className="bg-[var(--accent-bg)] border border-[var(--border)] rounded-lg px-4 py-3 text-[var(--text-h)] focus:outline-none focus:border-[var(--text-h)]/30 transition-colors"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold tracking-wider uppercase text-[var(--text)]">Banner Image URL</label>
                    <input 
                      type="url" value={customBanner} onChange={(e) => setCustomBanner(e.target.value)} 
                      placeholder="Banner Image URL"
                      className="bg-[var(--accent-bg)] border border-[var(--border)] rounded-lg px-4 py-3 text-[var(--text-h)] focus:outline-none focus:border-[var(--text-h)]/30 transition-colors"
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <h2 className="text-3xl font-bold text-[var(--text-h)] font-heading">{displayName}</h2>
                  <span className="text-[var(--text)] text-sm">⋆⁺₊⋆ ☾ ⋆⁺₊⋆</span>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-3 mt-4 md:mt-0">
              {isEditing ? (
                <>
                  <button 
                    onClick={handleSave} disabled={saving}
                    className="bg-[var(--text-h)] text-[var(--bg)] px-5 py-2.5 rounded-lg text-sm font-semibold hover:opacity-90 transition-all active:scale-95"
                  >
                    {saving ? 'Saving...' : 'Save Profile'}
                  </button>
                  <button 
                    onClick={() => setIsEditing(false)}
                    className="bg-[var(--accent-bg)] text-[var(--text-h)] border border-[var(--border)] px-5 py-2.5 rounded-lg text-sm font-semibold hover:border-[var(--text-h)]/30 transition-all"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <div className="flex gap-2">
                  <button 
                    onClick={toggleDarkMode}
                    className="bg-[var(--accent-bg)] text-[var(--text-h)] border border-[var(--border)] p-2.5 rounded-lg hover:border-[var(--text-h)]/30 transition-all flex items-center justify-center shadow-sm"
                    title="Toggle Theme"
                  >
                    {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                  </button>
                  <button 
                    onClick={() => setIsEditing(true)}
                    className="bg-[var(--accent-bg)] text-[var(--text-h)] border border-[var(--border)] px-5 py-2.5 rounded-lg text-sm font-semibold hover:border-[var(--text-h)]/30 transition-all shadow-sm"
                  >
                    ⚙️ Edit Profile
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* FEATURED SOUNDTRACK LIST */}
          {!isEditing && featuredSongs.length > 0 && (
            <div className="mt-10 bg-[var(--accent-bg)] border border-[var(--border)] p-8 rounded-2xl shadow-lg">
              <h3 className="text-xs font-bold tracking-widest uppercase text-[var(--text)] mb-6 flex items-center gap-3 justify-center">
                <span className="h-px flex-1 bg-gradient-to-r from-transparent to-[var(--border)]" />
                Featured Soundtrack
                <span className="h-px flex-1 bg-gradient-to-l from-transparent to-[var(--border)]" />
              </h3>

              {/* Spotify style header */}
              <div className="grid grid-cols-[40px_1.5fr_1fr_120px] px-4 py-2 border-b border-[var(--border)] text-xs font-bold tracking-wider uppercase text-[var(--text)] mb-3">
                <span>#</span>
                <span>Title</span>
                <span>Album</span>
                <span className="text-right">Actions</span>
              </div>
              
              <div className="flex flex-col gap-1">
                {featuredSongs.map((track, idx) => (
                  <div 
                    key={idx} 
                    className="grid grid-cols-[40px_1.5fr_1fr_120px] items-center px-4 py-3 rounded-lg transition-colors hover:bg-[var(--bg)] border-b border-[var(--border)]/20 group"
                  >
                    <span className="text-[var(--text)]/30 text-sm font-bold">{idx + 1}</span>

                    <div className="flex flex-col overflow-hidden">
                      <span className="text-[var(--text-h)] font-semibold text-sm truncate">{track.name}</span>
                      <span className="text-[var(--text)] text-xs">{track.artist}</span>
                    </div>

                    <span className="text-[var(--text)] text-sm truncate">
                      {track.album && track.album !== "Unknown Album" ? track.album : track.artist}
                    </span>

                    <div className="flex gap-3 justify-end items-center">
                      <button 
                        onClick={() => {
                          if (track.external_url) {
                            window.open(track.external_url, '_blank');
                          } else {
                            window.open(`https://open.spotify.com/search/${encodeURIComponent(track.name + ' ' + track.artist)}`, '_blank');
                          }
                        }}
                        className="w-8 h-8 bg-[#1DB954] rounded-full flex items-center justify-center hover:bg-[#1ed760] transition-colors"
                      >
                        <span className="text-black text-sm">▶</span>
                      </button>
                      <button 
                        onClick={() => {
                          const updated = featuredSongs.filter((_, i) => i !== idx);
                          localStorage.setItem(`tt_profile_songs_${session.user.email}`, JSON.stringify(updated));
                          setFeaturedSongs(updated);
                        }}
                        className="text-[var(--text)] hover:text-[var(--text-h)] transition-colors text-sm opacity-50 hover:opacity-100"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
