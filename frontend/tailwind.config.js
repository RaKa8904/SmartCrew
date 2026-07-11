/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    50: 'var(--primary-50)',
                    100: 'var(--primary-100)',
                    200: 'var(--primary-200)',
                    300: 'var(--primary-300)',
                    400: 'var(--primary-400)',
                    500: 'var(--primary-500)',
                    600: 'var(--primary-600)',
                    700: 'var(--primary-700)',
                    800: 'var(--primary-800)',
                    900: 'var(--primary-900)',
                    950: 'var(--primary-950)',
                },
                slate: {
                    50: 'var(--slate-50)',
                    100: 'var(--slate-100)',
                    200: 'var(--slate-200)',
                    300: 'var(--slate-300)',
                    400: 'var(--slate-400)',
                    500: 'var(--slate-500)',
                    600: 'var(--slate-600)',
                    700: 'var(--slate-700)',
                    800: 'var(--slate-800)',
                    900: 'var(--slate-900)',
                    950: 'var(--slate-950)',
                }
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
            },
            backdropBlur: {
                xs: '2px',
            }
        },
    },
    plugins: [],
}
