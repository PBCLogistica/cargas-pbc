import React, { useState, useEffect } from 'react';
import { supabase } from './integrations/supabase/client';
import { Session } from '@supabase/supabase-js';
import MainLayout from './components/MainLayout';
import Login from './pages/Login';

const App: React.FC = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setLoading(false);
    };

    getSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
        <div className="flex items-center justify-center h-screen bg-slate-50">
            <div className="text-slate-400">Carregando...</div>
        </div>
    )
  }

  if (!session) {
    return <Login />;
  } else {
    return <MainLayout supabase={supabase} user={session.user} />;
  }
};

export default App;