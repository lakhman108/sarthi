import React from 'react';
import { Helmet } from 'react-helmet-async';

const MetaTags = ({
    title = "Sarthi - Online Learning Platform",
    description = "Interactive online learning platform connecting students and teachers through video lectures, notes, and collaborative features.",
    keywords = "online learning, education, video lectures, classroom, students, teachers, e-learning",
    image = "https://sarthi-zeta.vercel.app/logo512.png",
    url = "https://sarthi-zeta.vercel.app",
    type = "website"
}) => {
    return (
        <Helmet>
            {/* Basic Meta Tags */}
            <title>{title}</title>
            <meta name="description" content={description} />
            <meta name="keywords" content={keywords} />
            <meta name="author" content="Sarthi Team" />
            <meta name="robots" content="index, follow" />
            <link rel="canonical" href={url} />

            {/* Open Graph Meta Tags */}
            <meta property="og:title" content={title} />
            <meta property="og:description" content={description} />
            <meta property="og:image" content={image} />
            <meta property="og:url" content={url} />
            <meta property="og:type" content={type} />
            <meta property="og:site_name" content="Sarthi" />

            {/* Twitter Card Meta Tags */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={title} />
            <meta name="twitter:description" content={description} />
            <meta name="twitter:image" content={image} />

            {/* Additional SEO Tags */}
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <meta httpEquiv="Content-Type" content="text/html; charset=utf-8" />
            <meta name="language" content="English" />
            <meta name="theme-color" content="#3B82F6" />
        </Helmet>
    );
};

export default MetaTags;
