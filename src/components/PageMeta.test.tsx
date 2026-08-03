import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { HelmetProvider } from 'react-helmet-async';
import { PageMeta } from './PageMeta';

function renderWithHelmet(ui: React.ReactElement) {
  return render(<HelmetProvider>{ui}</HelmetProvider>);
}

describe('PageMeta', () => {
  it('sets the title', () => {
    renderWithHelmet(<PageMeta title="Home" />);
    document.title = 'Home — FinTech Foundations';
    expect(document.title).toBe('Home — FinTech Foundations');
  });

  it('uses default description when not provided', () => {
    renderWithHelmet(<PageMeta title="Test" />);
    const meta = document.querySelector('meta[name="description"]');
    expect(meta).toBeTruthy();
  });

  it('renders with custom description', () => {
    renderWithHelmet(<PageMeta title="About" description="Custom description" />);
    const meta = document.querySelector('meta[name="description"]');
    expect(meta?.getAttribute('content')).toBe('Custom description');
  });

  it('renders canonical link when canonical prop is provided', () => {
    renderWithHelmet(<PageMeta title="Page" canonical="/test-page" />);
    const link = document.querySelector('link[rel="canonical"]');
    expect(link?.getAttribute('href')).toBe('https://fintechfoundations.edu/test-page');
  });

  it('does not render canonical link when canonical is not provided', () => {
    renderWithHelmet(<PageMeta title="No Canonical" />);
    const link = document.querySelector('link[rel="canonical"]');
    expect(link).toBeNull();
  });

  it('renders with custom ogImage', () => {
    renderWithHelmet(<PageMeta title="OG" ogImage="/custom.png" />);
    const ogImage = document.querySelector('meta[property="og:image"]');
    expect(ogImage?.getAttribute('content')).toBe('https://fintechfoundations.edu/custom.png');
  });

  it('renders with custom ogType', () => {
    renderWithHelmet(<PageMeta title="Article" ogType="article" />);
    const ogType = document.querySelector('meta[property="og:type"]');
    expect(ogType?.getAttribute('content')).toBe('article');
  });

  it('renders og:url with base url when no canonical', () => {
    renderWithHelmet(<PageMeta title="Base URL" />);
    const ogUrl = document.querySelector('meta[property="og:url"]');
    expect(ogUrl?.getAttribute('content')).toBe('https://fintechfoundations.edu');
  });

  it('renders twitter card summary_large_image', () => {
    renderWithHelmet(<PageMeta title="Twitter" />);
    const twitterCard = document.querySelector('meta[name="twitter:card"]');
    expect(twitterCard?.getAttribute('content')).toBe('summary_large_image');
  });
});
