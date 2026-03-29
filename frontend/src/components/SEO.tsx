import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  canonical?: string;
  ogImage?: string;
  ogType?: 'website' | 'article' | 'software';
  twitterHandle?: string;
  children?: React.ReactNode;
}

export function SEO({ 
  title, 
  description, 
  canonical, 
  ogImage = '/logo/social_preview.png', 
  ogType = 'website',
  twitterHandle = '@despesago',
  children 
}: SEOProps) {
  const siteName = 'DespesaGo';
  const fullTitle = title ? `${title} | ${siteName}` : siteName;
  const defaultDescription = 'DespesaGo: A maneira mais rápida de gerenciar reembolsos e despesas corporativas usando Inteligência Artificial.';
  const metaDescription = description || defaultDescription;
  const url = window.location.href;

  return (
    <Helmet>
      {/* Título e Meta Descrição */}
      <title>{fullTitle}</title>
      <meta name="description" content={metaDescription} />
      {canonical && <link rel="canonical" href={canonical} />}

      {/* Open Graph / Facebook */}
      <meta property="og:site_name" content={siteName} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={metaDescription} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content={ogType} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={metaDescription} />
      <meta name="twitter:image" content={ogImage} />
      {twitterHandle && <meta name="twitter:site" content={twitterHandle} />}

      {/* Informações de Mobile e App */}
      <meta name="theme-color" content="#10B981" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      <meta name="apple-mobile-web-app-title" content="DespesaGo" />

      {children}
    </Helmet>
  );
}
