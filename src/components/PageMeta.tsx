import { Helmet } from 'react-helmet-async';

interface PageMetaProps {
  title: string;
  description?: string;
  canonical?: string;
  ogImage?: string;
  ogType?: string;
}

export function PageMeta({
  title,
  description = 'Free interactive fintech education platform with 15 modules, trading simulators, and gamified learning.',
  canonical,
  ogImage = '/overlay-wealth.png',
  ogType = 'website',
}: PageMetaProps) {
  const fullTitle = `${title} — Overlay Wealth`;
  const baseUrl = 'https://overlay365.org';

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={canonical ? `${baseUrl}${canonical}` : baseUrl} />
      <meta property="og:image" content={`${baseUrl}${ogImage}`} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:card" content="summary_large_image" />
      {canonical && <link rel="canonical" href={`${baseUrl}${canonical}`} />}
    </Helmet>
  );
}
