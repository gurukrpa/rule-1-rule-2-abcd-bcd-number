/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  safelist: [
    // Button color classes used dynamically in components
    'bg-purple-500', 'bg-purple-600', 'hover:bg-purple-600', 'hover:bg-purple-700',
    'bg-blue-500', 'bg-blue-600', 'hover:bg-blue-600', 'hover:bg-blue-700',
    'bg-orange-500', 'bg-orange-600', 'hover:bg-orange-600', 'hover:bg-orange-700',
    'bg-green-500', 'bg-green-600', 'hover:bg-green-600', 'hover:bg-green-700',
    'bg-cyan-500', 'bg-cyan-600', 'hover:bg-cyan-600', 'hover:bg-cyan-700',
    'bg-red-500', 'bg-red-600', 'hover:bg-red-600', 'hover:bg-red-700',
    'bg-indigo-600', 'bg-indigo-700', 'hover:bg-indigo-700',
    'bg-teal-600', 'bg-teal-700', 'hover:bg-teal-700',
    'bg-gray-500', 'bg-gray-600', 'hover:bg-gray-600',
    
    // Text colors
    'text-purple-600', 'text-purple-900', 'hover:text-purple-900',
    'text-blue-600', 'text-blue-700', 'text-blue-800', 'text-blue-900',
    'text-orange-600', 'text-orange-900', 'hover:text-orange-900',
    'text-green-600', 'text-green-700', 'text-green-800',
    'text-cyan-600', 'text-cyan-700',
    'text-red-600', 'text-red-700', 'text-red-900', 'hover:text-red-900',
    'text-indigo-600', 'text-indigo-900', 'hover:text-indigo-900',
    
    // Background colors for status indicators
    'bg-blue-100', 'bg-blue-200', 'bg-blue-50',
    'bg-green-100', 'bg-green-200', 'bg-green-50',
    'bg-orange-100', 'bg-orange-200', 'bg-orange-50',
    'bg-red-100', 'bg-red-200', 'bg-red-50',
    'bg-purple-100', 'bg-purple-200', 'bg-purple-50',
    'bg-yellow-100', 'bg-yellow-200', 'bg-yellow-50',
    'bg-teal-100', 'bg-teal-200', 'bg-teal-50',
    
    // Border colors
    'border-blue-300', 'border-blue-400', 'border-blue-500',
    'border-green-300', 'border-green-400', 'border-green-500',
    'border-orange-300', 'border-orange-400', 'border-orange-500',
    'border-red-300', 'border-red-400', 'border-red-500',
    'border-purple-300', 'border-purple-400', 'border-purple-500',
    
    // Progress bar colors
    'bg-blue-600', 'bg-purple-600', 'bg-green-600', 'bg-orange-600',
    
    // Gradient classes for number boxes
    'bg-gradient-to-r', 'from-green-400', 'to-emerald-500',
    'from-blue-400', 'to-indigo-500',
    'from-orange-400', 'to-red-500',
    
    // Ring colors for focus states
    'ring-2', 'ring-blue-400', 'ring-green-400', 'ring-orange-400',
    'ring-red-400', 'ring-purple-400', 'ring-teal-500',
    
    // House group colors (custom hex colors)
    'bg-[#DCEDC1]', 'bg-[#FFD3B6]', 'bg-[#FFAAA5]',
    
    // Scale transforms
    'scale-105', 'hover:scale-[1.02]',
    
    // Shadow classes
    'shadow-md', 'shadow-lg', 'hover:shadow-md',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
