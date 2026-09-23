/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Clean "white family" canvas (light cool gray) with a vivid indigo
        // accent. The `cream` token is named for historical reasons but now
        // holds a neutral cool-gray ramp: page background, hairline borders,
        // and control/input borders. The `clay` token likewise drives the
        // indigo accent — buttons, links, input focus borders, nav highlight,
        // number badges. Indigo pairs cleanly with the light cool gray. `ink`
        // (near-black) is reserved for body text and the brand mark.
        cream: {
          DEFAULT: '#F3F6F9', // page background — soft cool gray, a touch darker than white (was #F8FAFC)
          100: '#F8FAFC',
          200: '#E2E8F0', // hairline borders & dividers (slate-200)
          300: '#CBD5E1', // control / input borders (slate-300)
        },
        clay: {
          50: '#EEF2FF', // active nav / number-badge background
          100: '#E0E7FF', // focus ring / badge hover background
          200: '#C7D2FE',
          300: '#A5B4FC', // card hover border
          400: '#6366F1', // input focus border
          500: '#5457EC',
          600: '#4F46E5', // buttons / links / spinner — vivid indigo base
          700: '#4338CA', // hover / active — deeper indigo
        },
        ink: '#1B1A17', // warm near-black
      },
    },
  },
  plugins: [],
}
