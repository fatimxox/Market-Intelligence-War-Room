import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { User, UserRole } from '../../types.ts';
// FIX: Corrected icon import path
import { LogOut, Target, BarChart3, FileText, Zap, Shield, Users, Crown, Settings } from '../../src/components/icons.tsx';

interface SidebarProps {
  user: User;
}

const Sidebar: React.FC<SidebarProps> = ({ user }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('war-room-user');
    navigate('/login');
  };

  const navLinks = user.role === UserRole.ADMIN
    ? [
        { name: 'Dashboard', path: '/dashboard', icon: BarChart3 },
        { name: 'Mission Hub', path: '/admin/mission-hub', icon: Zap },
        { name: 'Users', path: '/admin/users', icon: Users },
        { name: 'Rules & Roles', path: '/rules', icon: FileText },
        { name: 'Settings', path: '/settings', icon: Settings },
      ]
    : [
        { name: 'Dashboard', path: '/dashboard', icon: BarChart3 },
        { name: 'My Career', path: '/my-career', icon: Target },
        { name: 'Rules & Roles', path: '/rules', icon: FileText },
        { name: 'Settings', path: '/settings', icon: Settings },
      ];

  const getWinRate = () => {
    if (!user.total_missions || user.total_missions === 0) return '0%';
    return `${Math.round(((user.missions_won || 0) / user.total_missions) * 100)}%`;
  };

  return (
    <aside className="w-64 bg-panel border-r border-panel-border flex flex-col p-4 fixed h-full">
      <div className="flex items-center gap-3 mb-10 px-2">
        <div className="w-10 h-10 bg-accent rounded-md flex items-center justify-center">
            <Target className="w-6 h-6 text-background"/>
        </div>
        <div>
            <h1 className="text-lg font-bold text-primary-text">Intel Wars</h1>
            <p className="text-xs text-gray-400">Market Intelligence</p>
        </div>
      </div>

      <nav className="flex-grow">
        <h2 className="text-xs font-semibold text-gray-500 uppercase px-2 mb-2">Navigation</h2>
        <ul className="space-y-1">
          {navLinks.map((link) => (
            <li key={link.path}>
              <NavLink
                to={link.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                    isActive
                      ? 'bg-accent text-background font-semibold'
                      : 'text-gray-300 hover:bg-secondary'
                  }`
                }
              >
                <link.icon className="w-5 h-5" />
                <span>{link.name}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="mt-auto">
         <h2 className="text-xs font-semibold text-gray-500 uppercase px-2 mb-2">Agent Profile</h2>
         <div className="p-3 bg-secondary rounded-lg">
            <div className="flex items-center gap-3">
                <img src={user.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`} alt="avatar" className="w-10 h-10 rounded-full bg-accent/20"/>
                <div>
                    <h4 className="font-semibold">{user.displayName}</h4>
                    <p className="text-xs text-gray-400 capitalize flex items-center gap-1">
                      {user.role === UserRole.ADMIN ? <Crown className="w-3 h-3 text-accent"/> : <Shield className="w-3 h-3 text-green-400"/>}
                      {user.role}
                    </p>
                </div>
            </div>
            <div className="flex justify-between text-xs mt-3 pt-3 border-t border-panel-border">
                <div className="text-center">
                    <p className="font-bold">{user.total_missions || 0}</p>
                    <p className="text-gray-400">Missions</p>
                </div>
                <div className="text-center">
                    <p className="font-bold">{getWinRate()}</p>
                    <p className="text-gray-400">Win Rate</p>
                </div>
            </div>
         </div>
         <button onClick={handleLogout} className="w-full mt-3 flex items-center justify-center gap-2 text-sm py-2 rounded-md text-gray-400 hover:bg-secondary hover:text-red-400 transition-colors">
            <LogOut className="w-4 h-4" />
            Sign Out
         </button>
      </div>
    </aside>
  );
};

export default Sidebar;