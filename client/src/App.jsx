import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { 
  Music, 
  Heart, 
  Zap, 
  ArrowRight,
  Headphones,
  Globe,
  Code,
  Sparkles,
} from 'lucide-react'
import { cn } from './lib/utils'
import { AuthProvider } from './lib/AuthContext'
import { ThemeProvider, useTheme } from './lib/ThemeContext'
import Dashboard from './pages/Dashboard'
import AuthPage from './pages/AuthPage'
import HistoryPage from './pages/HistoryPage'
import FavoritesPage from './pages/FavoritesPage'
import ProfilePage from './pages/ProfilePage'
import './App.css'

function Navbar() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <nav className={cn(
      "fixed top-0 w-full z-50 transition-all duration-500 border-b px-6 py-4",
      scrolled ? "bg-[var(--glass)] backdrop-blur-md border-[var(--border)] py-3 shadow-sm" : "bg-transparent border-transparent"
    )}>
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2 cursor-pointer">
          <div className="bg-[var(--text-h)] p-2 rounded-lg">
            <Music className="w-5 h-5 text-[var(--bg)]" />
          </div>
          <span className="text-xl font-bold font-heading tracking-tight text-[var(--text-h)]">
            Tune<span className="text-[var(--text)] opacity-60">Tailor</span>
          </span>
        </div>
        
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-[var(--text)]">
          <a href="#about" className="hover:text-[var(--text-h)] transition-colors">About</a>
          <a href="#features" className="hover:text-[var(--text-h)] transition-colors">Features</a>
          <a href="#contact" className="hover:text-[var(--text-h)] transition-colors">Contact</a>
        </div>

        <a href="/login" className="bg-[var(--text-h)] text-[var(--bg)] px-5 py-2 rounded-md text-sm font-semibold hover:opacity-90 transition-all active:scale-95">
          Sign In
        </a>
      </div>
    </nav>
  )
}

function Turntable() {
  const { isDarkMode, toggleDarkMode } = useTheme()

  return (
    <div className="relative w-80 h-64 md:w-[500px] md:h-[400px] flex items-center justify-center animate-fade-in">
      {/* Rectangular Turntable Base (Plinth) */}
      <div className="absolute inset-0 bg-[#c0c0c0] border border-slate-400 rounded-lg shadow-[0_15px_40px_rgba(0,0,0,0.3)] overflow-hidden">
        {/* Brushed Metal Effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-100/30 via-transparent to-black/10"></div>
        
        {/* Corner Screws */}
        <div className="absolute top-3 left-3 w-3 h-3 bg-slate-400 rounded-full border border-slate-500 flex items-center justify-center">
          <div className="w-1 h-1 bg-slate-600 rounded-full"></div>
        </div>
        <div className="absolute top-3 right-3 w-3 h-3 bg-slate-400 rounded-full border border-slate-500 flex items-center justify-center">
          <div className="w-1 h-1 bg-slate-600 rounded-full"></div>
        </div>
        <div className="absolute bottom-3 left-3 w-3 h-3 bg-slate-400 rounded-full border border-slate-500 flex items-center justify-center">
          <div className="w-1 h-1 bg-slate-600 rounded-full"></div>
        </div>
        <div className="absolute bottom-3 right-3 w-3 h-3 bg-slate-400 rounded-full border border-slate-500 flex items-center justify-center">
          <div className="w-1 h-1 bg-slate-600 rounded-full"></div>
        </div>

        {/* Pitch Slider (Right) */}
        <div className="absolute top-20 right-8 w-6 h-40 bg-slate-300/50 rounded shadow-inner flex flex-col items-center py-2">
           {/* Slider Groove */}
           <div className="w-1 h-full bg-slate-500/30 rounded-full relative">
              {/* Slider Knob */}
              <div className="absolute top-1/2 -translate-y-1/2 -left-1.5 w-4 h-8 bg-slate-200 border border-slate-400 rounded shadow-md group cursor-pointer hover:bg-white transition-colors">
                 <div className="absolute top-1/2 -translate-y-1/2 left-0.5 right-0.5 h-[1px] bg-slate-400"></div>
              </div>
           </div>
        </div>

        {/* Power / Light on Right bottom */}
        <div className="absolute bottom-12 right-10 flex flex-col items-center gap-2">
           <button 
             onClick={toggleDarkMode}
             className={cn(
               "w-12 h-12 rounded-full border-2 transition-all flex items-center justify-center shadow-lg",
               isDarkMode ? "bg-black border-slate-700 text-white" : "bg-slate-100 border-white text-black"
             )}
           >
             {isDarkMode ? <Sparkles className="w-5 h-5 animate-pulse" /> : <Zap className="w-5 h-5" />}
           </button>
           <span className="text-[8px] font-bold tracking-tighter text-slate-500 uppercase">MODE</span>
        </div>

        {/* Start / Stop Button (Left bottom) */}
        <div className="absolute bottom-8 left-8">
           <div className="w-10 h-10 rounded-full bg-gradient-to-b from-slate-100 to-slate-300 border border-slate-400 shadow-md flex items-center justify-center group cursor-pointer active:scale-95 transition-all">
              <div className="w-7 h-7 rounded-full bg-slate-200 shadow-inner"></div>
           </div>
           <div className="mt-1 text-[8px] font-bold text-center text-slate-500 tracking-widest uppercase">POWER</div>
        </div>
      </div>

      {/* Stroboscopic Ring (Dotted Pattern) */}
      <div className="absolute left-8 md:left-12 w-64 h-64 md:w-[320px] md:h-[320px] rounded-full border-[10px] border-[#111] z-0 flex items-center justify-center">
         <div className="absolute inset-[-4px] rounded-full border-[2px] border-dashed border-white/20 opacity-40 animate-[spin_20s_linear_infinite]"></div>
      </div>

      {/* Rotating Vinyl Record Image */}
      <div className="absolute left-8 md:left-12 w-60 h-60 md:w-[300px] md:h-[300px] rounded-full animate-spin-slow vinyl-shadow flex items-center justify-center border-[8px] border-[#000] z-10 shadow-[0_0_20px_rgba(0,0,0,0.5)] overflow-hidden bg-[#050505]">
          <img src="/vinyl-label.png" alt="Vinyl Label" className="w-full h-full object-cover" />
      </div>

      {/* Accurate Tone Arm */}
      <div className="absolute top-0 right-10 md:right-24 w-40 h-80 z-20 pointer-events-none rotate-[15deg] origin-top">
         {/* Arm Pivot Base */}
         <div className="absolute top-10 right-0 w-24 h-24 bg-gradient-to-br from-slate-300 to-slate-500 rounded-full shadow-xl flex items-center justify-center border border-slate-400/50">
           <div className="w-18 h-18 bg-slate-400 rounded-full border border-slate-500/30 flex items-center justify-center">
              <div className="w-12 h-12 bg-slate-300 rounded-full shadow-inner flex items-center justify-center">
                 <div className="w-4 h-4 bg-slate-500 rounded-full"></div>
              </div>
           </div>
         </div>
         {/* Counterweight */}
         <div className="absolute top-0 right-6 w-10 h-10 bg-slate-600 rounded-full border border-black/20 shadow-md"></div>
         
         {/* The Arm Pipe */}
         <div className="absolute top-16 right-10 w-2 md:w-3 h-48 md:h-60 bg-gradient-to-r from-slate-400 via-slate-200 to-slate-500 rounded-full shadow-lg origin-top transform rotate-[-5deg]"></div>
         
         {/* Headshell */}
         <div className="absolute bottom-[-10px] right-2 md:right-0 w-12 h-16 bg-slate-700 rounded-lg shadow-2xl rotate-[-20deg] border border-black/20 flex flex-col p-1.5 gap-1 pt-3 items-center">
           <div className="flex gap-1">
             <div className="w-1 h-1 bg-slate-400 rounded-full"></div>
             <div className="w-1 h-1 bg-slate-400 rounded-full"></div>
           </div>
           <div className="flex gap-1">
             <div className="w-1 h-1 bg-slate-400 rounded-full"></div>
             <div className="w-1 h-1 bg-slate-400 rounded-full"></div>
           </div>
           <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-400 rounded-full"></div>
         </div>
      </div>
    </div>
  )
}

function Hero() {
  return (
    <section className="relative pt-32 pb-20 px-6 min-h-[90vh] flex flex-col items-center justify-center overflow-hidden">
      <div className="max-w-7xl mx-auto w-full grid md:grid-cols-2 lg:grid-cols-5 items-center gap-12 lg:gap-20">
        
        {/* Left Content */}
        <div className="lg:col-span-3 text-left z-10 space-y-8 animate-slide-up">
          <h1 className="text-6xl md:text-8xl font-bold tracking-tight text-[var(--text-h)] leading-[0.9]">
            Music that <br /> 
            feels like you.
          </h1>
          
          <p className="text-xl md:text-2xl text-[var(--text)] max-w-xl leading-relaxed">
            Advanced Neural Engine designed to generate hyper-personalized 
            soundtracks by tracking your daily emotional variances.
          </p>

          <div className="flex flex-wrap gap-4 pt-4">
            <a href="/login" className="bg-[var(--text-h)] text-[var(--bg)] px-8 py-4 rounded-full font-bold text-lg hover:opacity-90 transition-all flex items-center gap-2 group shadow-xl hover:shadow-2xl">
              Launch Engine
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </a>
            <a href="#about" className="bg-[var(--bg)] text-[var(--text-h)] border border-[var(--border)] px-8 py-4 rounded-full font-bold text-lg hover:border-[var(--text-h)] transition-all flex items-center gap-2">
              Learn More
            </a>
          </div>

        </div>

        {/* Right Content - Turntable */}
        <div className="lg:col-span-2 flex justify-center lg:justify-end animate-fade-in animate-delay-200">
          <Turntable />
        </div>

      </div>
    </section>
  )
}

function FeatureCard({ icon: Icon, title, description }) {
  return (
    <div className="group p-8 rounded-2xl bg-[var(--accent-bg)] hover:bg-[var(--bg)] hover:shadow-2xl hover:shadow-[var(--text-h)]/5 transition-all duration-500 border border-transparent hover:border-[var(--border)]">
      <div className="w-12 h-12 bg-[var(--text-h)] rounded-lg flex items-center justify-center mb-6">
        <Icon className="w-6 h-6 text-[var(--bg)]" />
      </div>
      <h3 className="text-xl font-bold mb-3 text-[var(--text-h)]">{title}</h3>
      <p className="text-[var(--text)] leading-relaxed">
        {description}
      </p>
    </div>
  )
}

function About() {
  return (
    <section id="about" className="py-24 px-6">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-4xl md:text-5xl font-bold mb-8 tracking-tight text-[var(--text-h)]">About Tune Tailor</h2>
        <p className="text-lg text-[var(--text)] leading-relaxed max-w-3xl mx-auto">
          Tune Tailor is an advanced emotional sentiment translation engine. We understand that human emotion 
          rarely fits into simple boxes. Sometimes you are feeling a complex mix of nostalgia, heavy energy, and subtle hope. 
          By typing out a complete braindump of your current mental state, our proprietary Natural Language Processing model 
          deconstructs your linguistic patterns mathematically. We map those parameters along a geometric Euclidean space 
          and instantly retrieve exactly 10 Spotify tracks that acoustically and emotionally resonate with your exact wavelength.
        </p>
      </div>
    </section>
  )
}

function Features() {
  return (
    <section id="features" className="py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-left mb-20 max-w-2xl">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight text-[var(--text-h)]">Curation for the conscious listener</h2>
          <p className="text-[var(--text)] text-lg">Standard algorithms use genres. We use soul.</p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          <FeatureCard 
            icon={Heart}
            title="Emotional Intelligence"
            description="Our AI doesn't just look for 'happy' or 'sad'. It understands nuance, nostalgia, and complex human vibes."
          />
          <FeatureCard 
            icon={Zap}
            title="Instant Curation"
            description="Generate high-quality playlists in seconds. Connected directly to your favorite streaming services."
          />
          <FeatureCard 
            icon={Headphones}
            title="Lossless Discovery"
            description="Discover underground tracks and hidden gems that algorithmic radios usually miss."
          />
        </div>
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer id="contact" className="py-12 px-6 border-t border-[var(--border)]">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
        <div className="flex items-center gap-2">
          <div className="bg-[var(--text-h)] p-1.5 rounded-md">
            <Music className="w-4 h-4 text-[var(--bg)]" />
          </div>
          <span className="font-bold text-[var(--text-h)] tracking-tight">TuneTailor</span>
        </div>

        <div className="flex gap-8 text-sm text-[var(--text)] font-medium">
          <a href="mailto:kritikamishra4000@gmail.com" className="hover:text-[var(--text-h)] transition-colors">kritikamishra4000@gmail.com</a>
          <a href="https://www.linkedin.com/in/kritika-mishra-84a18728a" target="_blank" rel="noopener noreferrer" className="hover:text-[var(--text-h)] transition-colors">LinkedIn</a>
          <a href="#" className="hover:text-[var(--text-h)] transition-colors">Privacy</a>
        </div>
      </div>
      <div className="text-center mt-8 text-xs text-[var(--text)] opacity-60 uppercase tracking-widest font-bold flex flex-col gap-2">
        <span>© 2026 TuneTailor</span>
        <span>Created by Kritika Mishra</span>
      </div>
    </footer>
  )
}

function LandingPage() {
  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] transition-colors duration-500 selection:bg-slate-200">
      <Navbar />
      <main>
        <Hero />
        <About />
        <Features />
      </main>
      <Footer />
    </div>
  )
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<AuthPage />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="/favorites" element={<FavoritesPage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
