import { describe, it, expect, beforeEach, vi } from 'vitest';
import i18n from './i18n';
import { getCurrentLanguage, setLanguage, SUPPORTED_LANGUAGES, LANGUAGE_NAMES, resources } from './i18n';

describe('i18n', () => {
  beforeEach(async () => {
    localStorage.clear();
    await i18n.changeLanguage('en');
  });

  it('exports three supported languages', () => {
    expect(SUPPORTED_LANGUAGES).toEqual(['en', 'es', 'fr']);
  });

  it('has names for all supported languages', () => {
    expect(LANGUAGE_NAMES.en).toBe('English');
    expect(LANGUAGE_NAMES.es).toBe('Español');
    expect(LANGUAGE_NAMES.fr).toBe('Français');
  });

  it('defaults to English', () => {
    expect(getCurrentLanguage()).toBe('en');
  });

  it('switches language via setLanguage', async () => {
    await setLanguage('es');
    expect(getCurrentLanguage()).toBe('es');
    expect(localStorage.getItem('fintech_lang')).toBe('es');
  });

  it('persists language choice to localStorage', async () => {
    await setLanguage('fr');
    expect(localStorage.getItem('fintech_lang')).toBe('fr');
  });

  it('updates document lang attribute', async () => {
    await setLanguage('es');
    expect(document.documentElement.lang).toBe('es');
  });

  it('loads translations for the active language', async () => {
    await i18n.changeLanguage('en');
    const translation = i18n.t('nav.profile');
    expect(translation).toBeTruthy();
    expect(translation.length).toBeGreaterThan(0);
  });

  it('falls back to English for unknown language', async () => {
    await i18n.changeLanguage('de');
    expect(getCurrentLanguage()).toBe('en');
  });

  it('handles region-specific language codes', async () => {
    Object.defineProperty(i18n, 'language', { value: 'es-MX', configurable: true, writable: true });
    expect(getCurrentLanguage()).toBe('es');
  });

  it('handles unsupported region code that falls through', async () => {
    Object.defineProperty(i18n, 'language', { value: 'zu-ZA', configurable: true, writable: true });
    expect(getCurrentLanguage()).toBe('en');
  });

  it('translation keys exist in all three languages', async () => {
    const key = 'nav.profile';
    await i18n.changeLanguage('en');
    const en = i18n.t(key);
    await i18n.changeLanguage('es');
    const es = i18n.t(key);
    await i18n.changeLanguage('fr');
    const fr = i18n.t(key);
    expect(en).not.toBe(key);
    expect(es).not.toBe(key);
    expect(fr).not.toBe(key);
  });

  it('resources contains all three languages', () => {
    expect(resources).toHaveProperty('en');
    expect(resources).toHaveProperty('es');
    expect(resources).toHaveProperty('fr');
  });

  it('getCurrentLanguage returns exact match for fr', async () => {
    await i18n.changeLanguage('fr');
    expect(getCurrentLanguage()).toBe('fr');
  });

  it('setLanguage without await still updates localStorage', () => {
    setLanguage('fr');
    expect(localStorage.getItem('fintech_lang')).toBe('fr');
    expect(document.documentElement.lang).toBe('fr');
  });

  it('handles empty string language fallback', async () => {
    await i18n.changeLanguage('');
    expect(getCurrentLanguage()).toBe('en');
  });
});
