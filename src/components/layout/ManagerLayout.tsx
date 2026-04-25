import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { LayoutDashboard, Plus, LogOut, ShieldAlert } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';

export function ManagerLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const handleLogout = async () => { await logout(); navigate('/login'); };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      {/* Top navbar */}
      <header className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-30">
        <div className="flex items-center gap-4">
          <NavLink to="/manager/dashboard" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary-900/50 border border-primary-800 flex items-center justify-center">
              <ShieldAlert className="w-4 h-4 text-primary-400" />
            </div>
            <span className="text-sm font-bold text-white hidden sm:block">Crisis OS</span>
          </NavLink>
          <nav className="hidden sm:flex items-center gap-1 ml-4">
            <NavLink to="/manager/dashboard" className={({ isActive }) => cn(
              'px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
              isActive ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200',
            )}>
              <LayoutDashboard className="w-4 h-4 inline mr-1.5" />Dashboard
            </NavLink>
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <Button size="sm" icon={<Plus className="w-4 h-4" />} onClick={() => navigate('/manager/incidents/new')}>
            New Incident
          </Button>
          <div className="hidden sm:block text-xs text-slate-500">{user?.displayName || user?.email}</div>
          <button onClick={handleLogout} className="text-slate-400 hover:text-red-400 p-2 transition-colors" aria-label="Sign out">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>
      <main className="flex-1 overflow-y-auto">
        <div className="page-container py-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
