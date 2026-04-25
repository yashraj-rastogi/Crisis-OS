import { Outlet } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';

export function GuestLayout() {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      <header className="flex items-center justify-center px-4 py-3 border-b border-slate-800 bg-slate-900/50">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-primary-400" />
          <span className="text-sm font-bold text-white">Crisis OS</span>
          <span className="text-2xs text-slate-500 ml-1">Guest Safety</span>
        </div>
      </header>
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-lg mx-auto px-4 py-4">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
