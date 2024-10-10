/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#0C756F',   
        secondary: '#FDCF6F',  
        whiteCustom: '#EFEADB', 
        blackCustom: '#000201', 
      }
    },
  },
  plugins: [],
}