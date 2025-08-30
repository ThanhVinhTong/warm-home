'use client';

import { Language } from '../page';

interface LanguageSelectorProps {
  currentLanguage: Language;
  onLanguageChange: (language: Language) => void;
}

export function LanguageSelector({ currentLanguage, onLanguageChange }: LanguageSelectorProps) {
  const languages = [
    { code: 'en' as Language, name: 'English', flag: '🇺🇸' },
    { code: 'zh' as Language, name: '中文', flag: '🇨🇳' },
    { code: 'vi' as Language, name: 'Tiếng Việt', flag: '🇻🇳' },
    { code: 'ar' as Language, name: 'العربية', flag: '🇸🇦' },
    { code: 'hi' as Language, name: 'हिन्दी', flag: '🇮🇳' },
    { code: 'id' as Language, name: 'Bahasa', flag: '🇮🇩' },
  ];

  return (
    <div className="relative">
      <select
        value={currentLanguage}
        onChange={(e) => onLanguageChange(e.target.value as Language)}
        className="bg-blue-500 border border-blue-400 text-white rounded px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
      >
        {languages.map((lang) => (
          <option key={lang.code} value={lang.code} className="bg-white text-black">
            {lang.flag} {lang.name}
          </option>
        ))}
      </select>
    </div>
  );
}