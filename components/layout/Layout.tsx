import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar.tsx';
import { User } from '../../types.ts';

const Layout: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem('war-room-user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      navigate('/login');
    }
    setLoading(false);
  }, [navigate]);

  if (loading || !user) {
    return <div className="flex justify-center items-center h-screen bg-background text-primary-text">Loading user profile...</div>;
  }

  return (
    <div className="flex h-screen bg-background text-primary-text">
      <Sidebar user={user} />
      <main className="flex-1 ml-64 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;