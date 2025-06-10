import { supabase } from '../supabaseClient';

export class UserModel {
  constructor(userId) {
    this.userId = userId;
  }

  async fetch() {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', this.userId)
      .single();

    if (error) throw error;
    if (!data) throw new Error('User not found');

    return data;
  }
}