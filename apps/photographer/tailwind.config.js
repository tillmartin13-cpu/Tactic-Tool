import preset from '../../packages/ui/tailwind-preset.js';

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
    '../../packages/ui/src/**/*.{js,ts,jsx,tsx}',
    '../../packages/map/src/**/*.{js,ts,jsx,tsx}',
  ],
  presets: [preset],
  theme: {
    extend: {},
  },
  plugins: [],
};
