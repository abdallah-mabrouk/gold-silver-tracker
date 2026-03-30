/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // Support for RTL (Arabic)
  i18n: {
    locales: ['ar'],
    defaultLocale: 'ar',
  },
  
  // Optimize images
  images: {
    domains: ['supabase.co'],
  },
  
  // Environment variables available to the browser
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  },
  
  // Disable powered by header
  poweredByHeader: false,
  
  // Compress responses
  compress: true,
}

module.exports = nextConfig
