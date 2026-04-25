// Crisis OS — Global Loading Screen
import { ShieldAlert } from 'lucide-react';

export function LoadingScreen() {
  return (
    <div className="fixed inset-0 bg-slate-950 flex flex-col items-center justify-center z-50">
      <div className="relative mb-6">
        <div className="absolute inset-0 rounded-full bg-primary-600/20 animate-ping" />
        <div className="relative w-16 h-16 rounded-full bg-primary-900/50 border border-primary-700 flex items-center justify-center">
          <ShieldAlert className="w-8 h-8 text-primary-400" />
        </div>
      </div>
      <p className="text-slate-400 text-sm tracking-widest uppercase animate-pulse">
        Crisis OS
      </p>
    </div>
  );
}
