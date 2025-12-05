/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        './pages/**/*.{js,ts,jsx,tsx,mdx}',
        './components/**/*.{js,ts,jsx,tsx,mdx}',
        './app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        extend: {
            colors: {
                youtube: {
                    red: '#FF0000',
                    'dark-bg': '#0F0F0F',
                    'light-bg': '#FFFFFF',
                },
            },
            fontFamily: {
                roboto: ['Roboto', 'sans-serif'],
            },
        },
    },
    plugins: [],
}
