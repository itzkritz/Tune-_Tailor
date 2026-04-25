import { useRef, useState, useEffect } from 'react';
import html2canvas from 'html2canvas';
import { useSession } from '@/lib/AuthContext';

export default function MoodCard({ mood, playlist }) {
  const cardRef = useRef(null);
  const { data: session } = useSession();
  const [favorites, setFavorites] = useState([]);

  // Load favorites securely mapped to the user environment
  useEffect(() => {
    if (session?.user?.email) {
      const stored = JSON.parse(localStorage.getItem(`tt_favs_${session.user.email}`) || '[]');
      setFavorites(stored);
    }
  }, [session]);

  const toggleFavorite = (track) => {
    if (!session?.user?.email) return;
    const storageKey = `tt_favs_${session.user.email}`;
    let currentFavs = JSON.parse(localStorage.getItem(storageKey) || '[]');
    
    const identifier = track.id || track.name;
    // Check if track is already bounded by strict identifier
    if (currentFavs.find(t => (t.id || t.name) === identifier)) {
      currentFavs = currentFavs.filter(t => (t.id || t.name) !== identifier);
    } else {
      currentFavs.push({
        id: track.id || track.name,
        name: track.name,
        artist: track.artists?.[0]?.name,
        album: track.album?.name,
        image: track.album?.images?.[0]?.url,
        preview_url: track.preview_url,
        external_url: track.external_urls?.spotify
      });
    }
    
    localStorage.setItem(storageKey, JSON.stringify(currentFavs));
    setFavorites(currentFavs);
  };

  // Dynamically map target Valence (Positivity) and Energy (Intensity) to CSS Gradients
  const getGradient = () => {
    const v = mood?.target_valence || 0.5;
    const e = mood?.target_energy || 0.5;

    // High Energy, High Valence (Happy/Dance)
    if (v >= 0.5 && e >= 0.5) return 'linear-gradient(135deg, #FF6B6B 0%, #FFD93D 100%)';
    // Low Energy, High Valence (Chill/Acoustic)
    if (v >= 0.5 && e < 0.5) return 'linear-gradient(135deg, #A8E6CF 0%, #3D84A8 100%)';
    // High Energy, Low Valence (Angry/Metal/Rock)
    if (v < 0.5 && e >= 0.5) return 'linear-gradient(135deg, #2B2E4A 0%, #E84545 100%)';
    // Low Energy, Low Valence (Sad/Lofi)
    return 'linear-gradient(135deg, #2C3E50 0%, #000000 100%)';
  };

  const downloadCard = async () => {
    if (!cardRef.current) return;
    try {
      const canvas = await html2canvas(cardRef.current, { backgroundColor: null, scale: 2 });
      const image = canvas.toDataURL("image/png");
      const link = document.createElement('a');
      link.href = image;
      link.download = `MoodMosaic-${mood?.predicted_genre || 'Playlist'}.png`;
      link.click();
    } catch (error) {
      console.error("Failed to capture image:", error);
    }
  };

  const genreLabel = mood?.predicted_genre === 'edm' ? 'EDM' : 
    mood?.predicted_genre === 'r&b' ? 'R&B' : 
    (mood?.predicted_genre || 'Generated');

  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-lg animate-fade-in">
      {/* Main Card */}
      <div 
        ref={cardRef}
        className="w-full rounded-2xl p-8 relative overflow-hidden text-white shadow-2xl border border-white/15"
        style={{ background: getGradient() }}
      >
        {/* Noise Overlay */}
        <div className="absolute inset-0 opacity-10 mix-blend-overlay pointer-events-none"
          style={{ backgroundImage: "url('https://www.transparenttextures.com/patterns/stardust.png')" }}
        />
        <div className="absolute inset-0 rounded-2xl border-2 border-white/10 pointer-events-none" />

        {/* Header */}
        <div className="relative z-10 mb-6">
          <h2 className="text-4xl font-bold capitalize tracking-tight drop-shadow-lg font-heading">
            {genreLabel}
          </h2>
          <div className="flex gap-3 mt-3 flex-wrap">
            <span className="text-sm bg-black/20 backdrop-blur-sm px-3 py-1 rounded-full text-white/90">
              Positivity: {Math.round((mood?.target_valence || 0) * 100)}%
            </span>
            <span className="text-sm bg-black/20 backdrop-blur-sm px-3 py-1 rounded-full text-white/90">
              Energy: {Math.round((mood?.target_energy || 0) * 100)}%
            </span>
          </div>
        </div>

        {/* Playlist */}
        <div className="relative z-10">
          <h3 className="text-xs font-bold tracking-widest uppercase mb-3 text-white/80">
            Your Curated Soundtrack
          </h3>
          <div className="flex flex-col gap-1">
            {playlist?.slice(0, 10).map((track, i) => {
              const identifier = track.id || track.name;
              const isFav = favorites.find(t => (t.id || t.name) === identifier);
              return (
                <div key={identifier + i} className="flex items-center justify-between w-full group hover:bg-white/10 rounded-lg px-2 py-1.5 transition-colors">
                  <div className="flex items-center gap-3 overflow-hidden min-w-0 flex-1">
                    <span className="text-white/40 font-bold text-sm w-6 text-right shrink-0">
                      {(i + 1).toString().padStart(2, '0')}
                    </span>
                    <div className="flex flex-col min-w-0">
                      <span className="text-sm font-semibold truncate">{track.name}</span>
                      <span className="text-xs text-white/60 truncate">{track.artists[0]?.name}</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => toggleFavorite(track)}
                    className="ml-3 shrink-0 transition-all"
                    title="Save to Favorites"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" 
                      fill={isFav ? "currentColor" : "none"} 
                      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                      className={isFav ? "text-red-400" : "text-white/40 hover:text-white/70"}
                    >
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l8.84-8.84 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                    </svg>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 w-full">
        <button 
          onClick={downloadCard}
          className="flex-1 py-3 rounded-xl bg-[var(--bg)] text-[var(--text-h)] border border-[var(--border)] font-semibold text-sm hover:shadow-lg hover:border-[var(--text-h)] transition-all active:scale-95"
        >
          Save Image ✨
        </button>
        <button 
          onClick={() => window.open('https://open.spotify.com/', '_blank')}
          className="flex-1 py-3 rounded-xl bg-[#1DB954] text-black font-semibold text-sm hover:bg-[#1ed760] transition-all active:scale-95"
        >
          Open Spotify 🎧
        </button>
      </div>
    </div>
  );
}
