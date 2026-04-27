import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send, Image as ImageIcon } from 'lucide-react';
import axios from 'axios';
import { saveMoodEntry } from '@/lib/supabase';
import { useSession } from '@/lib/AuthContext';
import MoodCard from '@/components/MoodCard';
import AppNavbar from '@/components/AppNavbar';

export default function Dashboard() {
  const navigate = useNavigate();
  const { data: session, status } = useSession();
  const [text, setText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedCard, setGeneratedCard] = useState(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      navigate('/login', { replace: true });
    }
  }, [status, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    setIsGenerating(true);

    try {
      // Call our Custom ML Model Node.js Backend
      const response = await axios.post('http://localhost:5000/api/recommendations/text', { text });
      
      const newCard = {
        mood: response.data.mood, 
        playlist: response.data.playlist,
        ml_confidence: response.data.ml_confidence
      };
      
      setGeneratedCard(newCard);
      // Attempt to save to database silently
      const activeUserId = session?.user?.id || session?.user?.email;
      saveMoodEntry(text, newCard.mood, newCard.playlist, activeUserId);
    } catch (error) {
      console.error("AI Generation failed:", error);
      alert("Failed to analyze mood. Is the local Node.js server running?");
    } finally {
      setIsGenerating(false);
    }
  };

  if (status === 'loading') return null;

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <AppNavbar />

      <main className="pt-24 pb-16 px-6 flex flex-col items-center">
        {!generatedCard ? (
          <div className="max-w-2xl w-full text-center animate-slide-up">
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-[var(--text-h)] leading-[0.95] mb-6 font-heading">
              How are you <br />feeling today?
            </h1>
            <p className="text-lg text-[var(--text)] max-w-lg mx-auto mb-12">
              Write your thoughts, feelings, or just brain-dump your day. Our AI will analyze your mood and generate your soundtrack.
            </p>

            <form onSubmit={handleSubmit} className="bg-[var(--bg)] border border-[var(--border)] rounded-2xl overflow-hidden shadow-lg transition-all focus-within:border-[var(--text-h)]/30 focus-within:shadow-xl">
              <textarea 
                placeholder="Type your feelings here..." 
                value={text} 
                onChange={(e) => setText(e.target.value)} 
                rows={5}
                autoFocus
                className="w-full bg-transparent px-6 py-5 text-[var(--text-h)] text-lg resize-none focus:outline-none placeholder:text-[var(--text)]/40"
              />
              <div className="flex justify-between items-center px-4 py-3 border-t border-[var(--border)] bg-[var(--accent-bg)]">
                <button type="button" className="p-3 rounded-full text-[var(--text)] hover:text-[var(--text-h)] hover:bg-[var(--border)] transition-all" title="Upload Image Instead">
                  <ImageIcon size={20} />
                </button>
                <button 
                  type="submit" 
                  disabled={isGenerating || !text.trim()}
                  className="p-3 rounded-full bg-[var(--text-h)] text-[var(--bg)] hover:opacity-90 transition-all disabled:opacity-30 disabled:cursor-not-allowed active:scale-95"
                >
                  {isGenerating ? (
                    <span className="text-sm font-medium px-2">Analyzing...</span>
                  ) : (
                    <Send size={18} />
                  )}
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="flex flex-col items-center animate-fade-in">
            <button 
              className="text-[var(--text)] hover:text-[var(--text-h)] transition-colors mb-8 font-medium text-sm"
              onClick={() => setGeneratedCard(null)}
            >
              ← Write Another Entry
            </button>
            <MoodCard mood={generatedCard.mood} playlist={generatedCard.playlist} />
          </div>
        )}
      </main>
    </div>
  );
}
