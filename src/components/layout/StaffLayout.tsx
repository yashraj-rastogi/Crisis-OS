import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Home, FileWarning, LogOut, ShieldAlert } from 'lucide-react';
import { cn } from '@/lib/utils';

const tabs = [
  { to: '/staff/home',   label: 'Home',   icon: Home },
  { to: '/staff/report', label: 'Report', icon: FileWarning },
];

export function StaffLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const handleLogout = async () => { await logout(); navigate('/login'); };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      {/* Mobile header */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-900/50">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-primary-400" />
          <span className="text-sm font-bold text-white">Crisis OS</span>
          <span className="text-2xs text-slate-500 ml-1">Staff</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 hidden sm:block">{user?.displayName}</span>
          <button onClick={handleLogout} className="text-slate-400 p-2"><LogOut className="w-4 h-4" /></button>
        </div>
      </header>
      <main className="flex-1 overflow-y-auto pb-20">
        <div className="page-container py-4">
          <Outlet />
        </div>
      </main>
      {/* Bottom tab navigation (mobile-first) */}
      <nav className="fixed bottom-0 left-0 right-0 bg-slate-900/90 backdrop-blur-md border-t border-slate-800 flex items-center z-30">
        {tabs.map((tab) => (
          <NavLink key={tab.to} to={tab.to} className={({ isActive }) => cn(
            'flex-1 flex flex-col items-center gap-1 py-3 text-xs font-medium transition-colors no-tap-highlight',
            isActive ? 'text-primary-400' : 'text-slate-500 active:text-slate-300',
          )}>
            <tab.icon className="w-5 h-5" />
            {tab.label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
