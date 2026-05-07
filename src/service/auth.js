import { supabase } from "../config/supabase.js";

export const signup = async ({ email, password }) => {
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) {
    throw error;
  }

  return { user: data.user, data };
};

export const login = async ({ email, password }) => {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    throw error;
  }

  return { user: data.user, data };
};

export const logout = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) {
    throw error;
  }
};

export const getCurrentUser = async () => {
  const { data, error } = await supabase.auth.getSession();
  if (error) {
    return null;
  }

  return data.session?.user ?? null;
};