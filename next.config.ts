import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  images: {
    domains: ['example.com', 'images.unsplash.com'], // додай потрібні домени
  },

  webpack(config, { isServer }) {
    // 🔹 Ігноруємо системні шляхи Windows, які не можна читати
    config.watchOptions = {
      ignored: [
        '**/node_modules',
        '**/.next',
        '**/public',
        'C:/Users/User/Application Data',
        'C:/Users/User/Cookies',
      ],
    };

    // 🔹 Обмежуємо контекст лише поточним проектом (дуже важливо!)
    config.context = path.resolve(__dirname);

    return config;
  },
};

export default nextConfig;
