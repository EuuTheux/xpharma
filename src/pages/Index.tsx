import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Login from '@/components/Login';
import MainApp from '@/components/MainApp';
import { Loader2 } from 'lucide-react';

const Index = () => {
  const { usuario, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return usuario ? <MainApp /> : <Login />;
};

export default Index;
