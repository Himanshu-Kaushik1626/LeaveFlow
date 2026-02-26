/** @type {import('tailwindcss').Config} */
export default {
    content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                primary: {
                    50: '#f0f4ff',
                    100: '#dde8ff',
                    200: '#c3d4fe',
                    300: '#9db7fc',
                    400: '#7491f9',
                    500: '#5168f4',
                    600: '#3a44e9',
                    700: '#3134d0',
                    800: '#292da8',
                    900: '#282d85',
                    950: '#191a4f',
                },
                surface: {
                    light: '#ffffff',
                    dark: '#0f1117',
                },
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
            },
            animation: {
                'fade-in': 'fadeIn 0.3s ease-in-out',
                'slide-in': 'slideIn 0.3s ease-out',
                'bounce-in': 'bounceIn 0.4s ease-out',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                slideIn: {
                    '0%': { opacity: '0', transform: 'translateY(-10px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                bounceIn: {
                    '0%': { opacity: '0', transform: 'scale(0.9)' },
                    '70%': { transform: 'scale(1.02)' },
                    '100%': { opacity: '1', transform: 'scale(1)' },
                },
            },
        },
    },
    plugins: [],
}
