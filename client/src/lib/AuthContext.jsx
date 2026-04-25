import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import bcrypt from 'bcryptjs';

const AuthContext = createContext(null);

export function useSession() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useSession must be used within AuthProvider');
  return ctx;
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [status, setStatus] = useState('loading');

  // Handle Session Persistence & OAuth Redirect Sync
  useEffect(() => {
    async function checkSession() {
      // 1. Check local storage first (manual login)
      const stored = localStorage.getItem('tt_session');
      if (stored) {
        setSession(JSON.parse(stored));
        setStatus('authenticated');
        return;
      }

      // 2. Check Supabase Auth (Google Redirect)
      const { data: { session: sbSession } } = await supabase.auth.getSession();
      
      if (sbSession?.user) {
        const user = sbSession.user;
        const sessionData = { 
          user: { 
            id: user.id, 
            email: user.email, 
            name: user.user_metadata.full_name || user.email.split('@')[0], 
            image: user.user_metadata.avatar_url 
          } 
        };

        // Sync Google user to our custom table automatically
        try {
          await supabase.from('users').upsert({
            email: user.email,
            username: sessionData.user.name,
            avatar_url: sessionData.user.image,
            password_hash: 'GOOGLE_OAUTH_PROXY'
          }, { onConflict: 'email' });
        } catch (err) {
          console.error("Sync error:", err);
        }

        localStorage.setItem('tt_session', JSON.stringify(sessionData));
        setSession(sessionData);
        setStatus('authenticated');
      } else {
        setStatus('unauthenticated');
      }
    }
    
    checkSession();
  }, []);

  const signIn = async (email, password) => {
    // 1. Find user by email in Supabase
    const { data: user } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (!user || !user.password_hash) {
      throw new Error('Invalid email or password');
    }

    // 2. Validate Password against hashed DB record
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    
    if (!isPasswordValid) {
      throw new Error('Invalid email or password');
    }

    // 3. Set session
    const sessionData = { user: { id: user.id, email: user.email, name: user.username, image: user.avatar_url } };
    localStorage.setItem('tt_session', JSON.stringify(sessionData));
    setSession(sessionData);
    setStatus('authenticated');
    return sessionData;
  };

  const register = async (email, password, username) => {
    if (!username || !password || password.length < 6) {
      throw new Error('Password must be at least 6 characters long.');
    }

    // 1. Check if user already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (existingUser) {
      throw new Error('This Username is already taken!');
    }

    // 2. Hash the password heavily
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 3. Save to Supabase custom users table
    const { data, error } = await supabase
      .from('users')
      .insert([{ email, username, password_hash: hashedPassword }])
      .select();

    if (error) {
      throw new Error('Database error occurred during registration.');
    }

    return data[0];
  };

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin + '/dashboard'
      }
    });
    if (error) throw error;
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem('tt_session');
    setSession(null);
    setStatus('unauthenticated');
  };

  return (
    <AuthContext.Provider value={{ data: session, status, signIn, register, signInWithGoogle, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
