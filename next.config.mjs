import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ["ucarecdn.com", "res.cloudinary.com"],
  },
  env: {
    UPLOADCARE_PUBLIC_KEY: process.env.NEXT_PUBLIC_UPLOADCARE_PUBLIC_KEY,
  },
};

export default nextConfig;
