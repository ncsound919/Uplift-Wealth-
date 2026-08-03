import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { LanguageSwitcher } from './LanguageSwitcher';

vi.mock('motion/react', () => ({
  motion: { div: ({ children, ...props }: any) => <div {...props}>{children}</div> },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

const { mockSetLanguage, mockGetCurrentLanguage } = vi.hoisted(() => ({
  mockSetLanguage: vi.fn(),
  mockGetCurrentLanguage: vi.fn(() => 'en' as const),
}));

vi.mock('../lib/i18n', () => ({
  setLanguage: mockSetLanguage,
  getCurrentLanguage: mockGetCurrentLanguage,
  SUPPORTED_LANGUAGES: ['en', 'es', 'fr', 'de'],
  LANGUAGE_NAMES: { en: 'English', es: 'Español', fr: 'Français', de: 'Deutsch' },
}));

describe('LanguageSwitcher', () => {
  beforeEach(() => {
    mockSetLanguage.mockClear();
    mockGetCurrentLanguage.mockClear();
  });

  it('shows current language code', () => {
    render(<LanguageSwitcher />);
    expect(screen.getByText('en')).toBeInTheDocument();
  });

  it('shows Globe icon', () => {
    const { container } = render(<LanguageSwitcher />);
    expect(container.querySelector('.lucide-globe')).toBeInTheDocument();
  });

  it('shows ChevronDown icon', () => {
    const { container } = render(<LanguageSwitcher />);
    expect(container.querySelector('.lucide-chevron-down')).toBeInTheDocument();
  });

  it('opens dropdown on click', () => {
    render(<LanguageSwitcher />);
    fireEvent.click(screen.getByLabelText('Change language'));
    expect(screen.getByText('Español')).toBeInTheDocument();
    expect(screen.getByText('Français')).toBeInTheDocument();
    expect(screen.getByText('Deutsch')).toBeInTheDocument();
  });

  it('shows checkmark on current language', () => {
    render(<LanguageSwitcher />);
    fireEvent.click(screen.getByLabelText('Change language'));
    expect(screen.getByText('English')).toBeInTheDocument();
    const checkIcon = document.querySelector('.lucide-check');
    expect(checkIcon).toBeInTheDocument();
  });

  it('does not show checkmark on non-current language', () => {
    render(<LanguageSwitcher />);
    fireEvent.click(screen.getByLabelText('Change language'));
    const españolButton = screen.getByText('Español').closest('button')!;
    const checkIcon = españolButton.querySelector('.lucide-check');
    expect(checkIcon).not.toBeInTheDocument();
  });

  it('calls setLanguage and closes dropdown on language selection', () => {
    render(<LanguageSwitcher />);
    fireEvent.click(screen.getByLabelText('Change language'));
    fireEvent.click(screen.getByText('Español'));
    expect(mockSetLanguage).toHaveBeenCalledWith('es');
  });

  it('sets aria-expanded true when open', () => {
    render(<LanguageSwitcher />);
    const btn = screen.getByLabelText('Change language');
    expect(btn.getAttribute('aria-expanded')).toBe('false');
    fireEvent.click(btn);
    expect(btn.getAttribute('aria-expanded')).toBe('true');
  });

  it('calls getCurrentLanguage on mount', () => {
    render(<LanguageSwitcher />);
    expect(mockGetCurrentLanguage).toHaveBeenCalled();
  });

  it('closes dropdown when clicking outside the component', () => {
    render(<LanguageSwitcher />);
    fireEvent.click(screen.getByLabelText('Change language'));
    expect(screen.getByText('Español')).toBeInTheDocument();
    fireEvent.mouseDown(document.body);
    expect(screen.queryByText('Español')).not.toBeInTheDocument();
  });
});
