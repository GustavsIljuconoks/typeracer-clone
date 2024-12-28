const defaultConfig = require('tailwindcss/defaultConfig');

/** @type {import('tailwindcss/types').Config} */
const config = {
  content: ['/.index.html', 'src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    fontFamily: {
      sans: ['Inter', ...defaultConfig.theme.fontFamily.sans],
    },
    extend: {
      colors: {
        'main-blue': '#67ACEC',
        'deep-blue': '#1863A8',
        'blue-10': '#b7d6f6',
        'blue-40': '#C2DEF7',
        gray: '#F6F4F4',
      },
    },
  },
};
module.exports = config;
