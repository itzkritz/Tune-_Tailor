import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSession } from '@/lib/AuthContext';
import MoodCard from '@/components/MoodCard';
import { fetchMoodHistory } from '@/lib/supabase';
import AppNavbar from '@/components/AppNavbar';

export default function HistoryPage() {
  const navigate = useNavigate();
  const { data: session, status } = useSession();
  const [pastEntries, setPastEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      navigate('/login', { replace: true });
    }
  }, [status, navigate]);

  useEffect(() => {
    async function loadHistory() {
      if (status !== 'authenticated') return;
      
      const activeUserId = session?.user?.id || session?.user?.email;
      const history = await fetchMoodHistory(activeUserId);
      
      // Parse the JSON playlist back to objects for the Card mapping
      const formattedHistory = history.map(entry => ({
        id: entry.id,
        date: new Date(entry.created_at).toLocaleDateString(),
        mood: { 
          target_valence: entry.valence, 
          target_energy: entry.energy,
          predicted_genre: entry.predicted_genre 
        },
        playlist: JSON.parse(entry.playlist || '[]').map(p => ({
            name: p.name,
            artists: [{ name: p.artist }]
        }))
      }));

      setPastEntries(formattedHistory);
      setLoading(false);
    }
    loadHistory();
  }, [session, status]);

  if (status === 'loading') return null;

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <AppNavbar />

      <main className="pt-24 pb-16 px-6 flex flex-col items-center">
        <div className="text-center mb-12 animate-slide-up">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-[var(--text-h)] font-heading mb-4">
            Your Past Mosaics
          </h1>
          <p className="text-lg text-[var(--text)]">
            Shuffle through your previous emotional states and soundtracks.
          </p>
        </div>

        {loading ? (
          <p className="text-[var(--text)]">Loading history...</p>
        ) : pastEntries.length === 0 ? (
          <div className="max-w-md w-full p-8 bg-[var(--accent-bg)] border border-[var(--border)] rounded-2xl text-center">
            <p className="text-[var(--text-h)] text-lg font-semibold mb-2">No entries yet</p>
            <p className="text-[var(--text)]">Head to the Journal to create your first mood mosaic.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10 w-full max-w-7xl animate-fade-in">
            {pastEntries.map(entry => (
              <div key={entry.id} className="flex flex-col items-center">
                <span className="text-xs font-semibold tracking-wider uppercase text-[var(--text)] mb-3 bg-[var(--accent-bg)] px-4 py-1.5 rounded-full border border-[var(--border)]">
                  {entry.date}
                </span>
                <div className="w-full transform scale-90 origin-top">
                  <MoodCard mood={entry.mood} playlist={entry.playlist} />
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
