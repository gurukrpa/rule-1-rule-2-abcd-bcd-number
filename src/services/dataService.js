import { supabase } from '../supabaseClient';

export const fetchUserData = async (userId) => {
  // Fetch user data
  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

  if (userError) throw userError;

  // Fetch HR data
  const { data: hrData, error: hrError } = await supabase
    .from('hr_data')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: true });

  if (hrError) throw hrError;

  return {
    user: userData,
    hrData: hrData || []
  };
};

export const saveUserData = async (userId, newData) => {
  if (newData.length === 0) return;

  // Delete existing data for this page's date range
  const dates = [...new Set(newData.map(d => d.date))];
  if (dates.length > 0) {
    const { error: deleteError } = await supabase
      .from('hr_data')
      .delete()
      .eq('user_id', userId)
      .in('date', dates);

    if (deleteError) throw deleteError;
  }

  // Insert new data
  const { error: insertError } = await supabase
    .from('hr_data')
    .insert(newData);

  if (insertError) throw insertError;

  // Wait a moment for the database to process the changes
  await new Promise(resolve => setTimeout(resolve, 500));
};