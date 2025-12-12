

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    

    theme: {
        extend: {
            colors: {
                brand: {

                    50: 'var(--color-bg-light, #FEEAC9)', 
                    100: 'var(--color-brand-100, #FFCDC9)', 
                    200: 'var(--color-brand-200, #FDACAC)', 
                    300: 'var(--color-brand-primary, #FD7979)', 
                   
                }
            }
        },
    },
    plugins: [],
}