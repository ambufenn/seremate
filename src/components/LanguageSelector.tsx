import { Globe } from 'lucide-react';
import { APP_LANGUAGES, type AppLanguage } from '../i18n/languages';

interface LanguageSelectorProps {
  language: AppLanguage;
  onChange: (lang: AppLanguage) => void;
  compact?: boolean;
}

export function LanguageSelector({
  language,
  onChange,
  compact = false,
}: LanguageSelectorProps) {
  return (
    <label
      className={`inline-flex items-center gap-1.5 rounded-2xl bg-[#FFFDF9] border border-[#241F1B]/12 hover:border-[#EA6A27]/45 transition-colors cursor-pointer shrink-0 ${
        compact ? 'min-h-[40px] px-2.5 py-1.5' : 'min-h-[42px] px-3 py-2'
      }`}
      title="Select Language"
    >
      <Globe className="w-4 h-4 text-[#EA6A27] shrink-0" aria-hidden="true" />
      <span className="sr-only">Language</span>
      <select
        aria-label="Language"
        value={language}
        onChange={(e) => onChange(e.target.value as AppLanguage)}
        className="bg-transparent text-xs font-semibold text-[#241F1B] focus:outline-none cursor-pointer pr-1 max-w-[115px] sm:max-w-none"
      >
        {APP_LANGUAGES.map((opt) => (
          <option key={opt.code} value={opt.code}>
            {compact ? `${opt.shortLabel} · ${opt.label}` : `${opt.label} (${opt.regionHint})`}
          </option>
        ))}
      </select>
    </label>
  );
}
