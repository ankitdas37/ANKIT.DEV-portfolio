import React from 'react';
import { Helmet } from 'react-helmet-async';

const SEO = ({ title, description, keywords, url, image }) => {
  const siteTitle = 'Ankit Das — Full Stack Developer | ANKIT.DEV';
  const fullTitle = title ? `${title} | ANKIT.DEV` : siteTitle;
  const defaultDescription = 'Ankit Das is a Diploma Computer Engineering student and passionate developer building modern, interactive and responsive web experiences.';
  const defaultKeywords = 'Ankit Das, Web Developer, Full Stack Developer, React, Node.js, Portfolio, ANKIT.DEV';
  const defaultImage = '/og-image.jpg';
  const siteUrl = 'https://ankit.dev';
  
  return (
    <Helmet>
      {/* Standard Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description || defaultDescription} />
      <meta name="keywords" content={keywords || defaultKeywords} />
      <meta name="author" content="Ankit Das" />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={`${siteUrl}${url || ''}`} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description || defaultDescription} />
      <meta property="og:image" content={image || defaultImage} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={`${siteUrl}${url || ''}`} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description || defaultDescription} />
      <meta name="twitter:image" content={image || defaultImage} />
    </Helmet>
  );
};

export default SEO;
