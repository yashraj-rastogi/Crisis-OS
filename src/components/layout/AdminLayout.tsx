import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Building2, Hotel, LayoutGrid, Users, Radio, LogOut, ShieldAlert } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { to: '/admin/setup/organization', label: 'Organization', icon: Building2 },
  { to: '/admin/setup/property',     label: 'Property',     icon: Hotel },
  { to: '/admin/setup/layout',       label: 'Layout',       icon: LayoutGrid },
  { to: '/admin/setup/guest-access', label: 'Guest Access', icon: Users },
  { to: '/admin/drill',              label: 'Drill Test',   icon: Radio },
];

export function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => { await logout(); navigate('/login'); };

  return (
    <div className="min-h-screen bg-slate-950 flex">
      {/* Sidebar */}
      <aside className="hidden md:flex w-64 flex-col border-r border-slate-800 bg-slate-900/50">
        <div className="p-5 border-b border-slate-800 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary-900/50 border border-primary-800 flex items-center justify-center">
            <ShieldAlert className="w-5 h-5 text-primary-400" />
          </div>
          <div>
            <p className="text-sm font-bold text-white">Crisis OS</p>
            <p className="text-2xs text-slate-500">Admin Setup</p>
          </div>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} className={({ isActive }) => cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
              isActive ? 'bg-primary-900/30 text-primary-400 border border-primary-800/50' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50',
            )}>
              <item.icon className="w-4 h-4" />
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="p-3 border-t border-slate-800">
          <div className="px-3 py-2 text-xs text-slate-500 mb-1">{user?.email}</div>
          <button onClick={handleLogout} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-400 hover:text-red-400 hover:bg-red-900/10 w-full transition-colors">
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile header */}
      <div className="flex-1 flex flex-col">
        <header className="md:hidden flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-900/50">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-primary-400" />
            <span className="text-sm font-bold text-white">Crisis OS</span>
          </div>
          <button onClick={handleLogout} className="text-slate-400 p-2"><LogOut className="w-4 h-4" /></button>
        </header>
        {/* Mobile nav tabs */}
        <nav className="md:hidden flex overflow-x-auto border-b border-slate-800 bg-slate-900/30 px-2">
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} className={({ isActive }) => cn(
              'flex-shrink-0 px-3 py-2.5 text-xs font-medium border-b-2 transition-colors',
              isActive ? 'border-primary-500 text-primary-400' : 'border-transparent text-slate-500 hover:text-slate-300',
            )}>
              {item.label}
            </NavLink>
          ))}
        </nav>
        <main className="flex-1 overflow-y-auto">
          <div className="page-container py-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
