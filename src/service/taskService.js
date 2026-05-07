import { supabase } from "../config/supabase.js";

export const getTasks = async () => {
  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Supabase Get Error:", error);
    throw error;
  }
  return data;
};

export const createTask = async (task) => {
  console.log("Creating Task Data:", task);
  const { data, error } = await supabase
    .from("tasks")
    .insert([task])
    .select();

  if (error) {
    console.error("Supabase Create Error:", error);
    throw error;
  }
  return data[0];
};

export const updateTask = async (id, updates) => {
  const { data, error } = await supabase
    .from("tasks")
    .update(updates)
    .eq("id", id)
    .select();

  if (error) {
    console.error("Supabase Update Error:", error);
    throw error;
  }
  return data[0];
};

export const deleteTask = async (id) => {
  const { error } = await supabase
    .from("tasks")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Supabase Delete Error:", error);
    throw error;
  }
};
