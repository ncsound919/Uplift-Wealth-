import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import en from '../../public/locales/en/common.json';
import es from '../../public/locales/es/common.json';
import fr from '../../public/locales/fr/common.json';

export const SUPPORTED_LANGUAGES = ['en', 'es', 'fr'] as const;
export type SupportedLanguage = typeof SUPPORTED_LANGUAGES[number];

export const LANGUAGE_NAMES: Record<SupportedLanguage, string> = {
  en: 'English',
  es: 'Español',
  fr: 'Français',
};

export const resources = {
  en: { common: en },
  es: { common: es },
  fr: { common: fr },
} as const;

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    supportedLngs: SUPPORTED_LANGUAGES as unknown as string[],
    defaultNS: 'common',
    ns: ['common'],
    debug: false,
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      lookupLocalStorage: 'fintech_lang',
      caches: ['localStorage'],
    },
    react: {
      useSuspense: false,
    },
  });

export default i18n;

export function setLanguage(lang: SupportedLanguage) {
  i18n.changeLanguage(lang);
  localStorage.setItem('fintech_lang', lang);
  document.documentElement.lang = lang;
}

export function getCurrentLanguage(): SupportedLanguage {
  const lang = i18n.language;
  if (SUPPORTED_LANGUAGES.includes(lang as SupportedLanguage)) {
    return lang as SupportedLanguage;
  }
  const short = lang.split('-')[0] as SupportedLanguage;
  if (SUPPORTED_LANGUAGES.includes(short)) {
    return short;
  }
  return 'en';
}
