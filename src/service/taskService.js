import { supabase } from "../config/supabase.js";

export const getTasks = async (page = 1, pageSize = 5) => {
  const start = (page - 1) * pageSize;
  const end = start + pageSize - 1;

  const { data, error, count } = await supabase
    .from("tasks")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(start, end);

  if (error) {
    console.error("Supabase Get Error:", error);
    throw error;
  }
  return { data, count };
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
