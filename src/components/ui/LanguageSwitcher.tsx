// ============================================================
// Crisis OS — LanguageSwitcher Component
// Lets guests pick their preferred language for broadcast
// instructions. Persists choice in localStorage.
// ============================================================

import { useState, useEffect } from 'react';
import { Languages } from 'lucide-react';
import type { SupportedLanguage } from '@/lib/types';
import { LANGUAGE_LABELS } from '@/lib/types';

const STORAGE_KEY = 'crisis_os_lang';

export function useGuestLanguage(): [SupportedLanguage, (l: SupportedLanguage) => void] {
  const [lang, setLangState] = useState<SupportedLanguage>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return (stored as SupportedLanguage) ?? 'en';
  });

  const setLang = (l: SupportedLanguage) => {
    localStorage.setItem(STORAGE_KEY, l);
    setLangState(l);
  };

  return [lang, setLang];
}

interface LanguageSwitcherProps {
  value: SupportedLanguage;
  onChange: (lang: SupportedLanguage) => void;
  className?: string;
}

const LANGUAGES: SupportedLanguage[] = ['en', 'hi', 'es', 'fr'];

export function LanguageSwitcher({ value, onChange, className = '' }: LanguageSwitcherProps) {
  const [open, setOpen] = useState(false);

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!open) return;
    const handler = () => setOpen(false);
    window.addEventListener('click', handler);
    return () => window.removeEventListener('click', handler);
  }, [open]);

  return (
    <div className={`relative ${className}`}>
      <button
        type="button"
        aria-label="Switch language"
        aria-expanded={open}
        onClick={(e) => { e.stopPropagation(); setOpen(o => !o); }}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-700 
                   bg-slate-800/70 text-slate-300 text-sm hover:border-slate-600 hover:text-white
                   transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500"
      >
        <Languages className="w-4 h-4" />
        <span>{LANGUAGE_LABELS[value]}</span>
      </button>

      {open && (
        <div
          className="absolute right-0 top-full mt-1 z-50 w-44 rounded-xl border border-slate-700
                     bg-slate-900 shadow-xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {LANGUAGES.map((lang) => (
            <button
              key={lang}
              type="button"
              onClick={() => { onChange(lang); setOpen(false); }}
              className={`w-full text-left px-4 py-2.5 text-sm transition-colors
                ${value === lang
                  ? 'bg-primary-900/40 text-primary-400 font-semibold'
                  : 'text-slate-300 hover:bg-slate-800'
                }`}
            >
              {LANGUAGE_LABELS[lang]}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
