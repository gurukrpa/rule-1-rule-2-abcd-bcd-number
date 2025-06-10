import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// --- Added ML Functions ---

export async function startTraining() {
  try {
    // Assuming 'train_sentiment_model' is the name of your PostgreSQL function
    const { data, error } = await supabase.rpc('train_sentiment_model');

    if (error) {
      console.error('Error starting training:', error);
      // Handle error in UI (e.g., show notification)
      throw error; // Re-throw error for caller to handle if needed
    } else {
      console.log('Training response:', data);
      // Handle success in UI (e.g., show a message)
      return data;
    }
  } catch (err) {
    console.error('RPC call failed:', err);
    // Handle unexpected errors
    throw err; // Re-throw error
  }
}

export async function getPrediction(textToAnalyze) {
  try {
    // Assuming 'predict_sentiment' is the name of your PostgreSQL function
    // and it accepts an argument named 'review_text'
    const { data, error } = await supabase.rpc('predict_sentiment', {
      review_text: textToAnalyze // Argument name must match the SQL function parameter name
    });

    if (error) {
      console.error('Error getting prediction:', error);
      // Handle error in UI
      return null; // Or throw error depending on how you want to handle failures
    } else {
      console.log('Prediction result:', data);
      // Handle prediction data in UI
      return data;
    }
  } catch (err) {
    console.error('RPC call failed:', err);
    // Handle unexpected errors
    return null; // Or throw error
  }
}

// --- Example usage in a component (kept commented for reference) ---
// import { startTraining, getPrediction } from './supabaseClient'; // Import the functions
// import React, { useState } from 'react';
//
// const MyComponent = () => {
//   const [prediction, setPrediction] = useState(null);
//   const [inputText, setInputText] = useState('');
//
//   const handlePredictClick = async () => {
//     const result = await getPrediction(inputText);
//     setPrediction(result);
//   };
//
//   return (
//     <div>
//       <button onClick={startTraining}>Train Model</button>
//       <textarea value={inputText} onChange={(e) => setInputText(e.target.value)} />
//       <button onClick={handlePredictClick}>Predict Sentiment</button>
//       {prediction && <pre>{JSON.stringify(prediction, null, 2)}</pre>}
//     </div>
//   );
// };
// --- End Added ML Functions ---