// Quick diagnostic script to check what's happening
// Run this in the browser console to see the current state

console.log('=== App Diagnostic ===');
console.log('Environment variables:', {
  SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
  SUPABASE_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY ? 'Present' : 'Missing',
  ENVIRONMENT: import.meta.env.VITE_ENVIRONMENT
});

// Check if root element exists
const root = document.getElementById('root');
console.log('Root element:', root);
console.log('Root content:', root?.innerHTML?.substring(0, 200));

// Check React mount
console.log('React version:', React?.version || 'Not found');

// Check for errors
console.log('Any console errors? Check Network tab and Console tab');

// Test basic Supabase connection
import { supabase } from './src/supabaseClient.js';
supabase.from('users').select('count').then(result => {
  console.log('Supabase test result:', result);
}).catch(err => {
  console.error('Supabase test error:', err);
});
