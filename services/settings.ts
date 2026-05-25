import { supabase } from "../lib/SupabaseClient";

export const getUserSettings = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { data, error } = await supabase
    .from("user_settings")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (error && error.code === 'PGRST116') {
    // No settings found, create default
    const { data: newSettings, error: insertError } = await supabase
      .from("user_settings")
      .insert({ user_id: user.id })
      .select()
      .single();
    
    if (insertError) return { error: insertError.message };
    return { data: newSettings };
  }

  if (error) return { error: error.message };
  return { data };
};

export const updateUserSettings = async (settings: {
  likes_public?: boolean;
  allow_dms_from?: 'everyone' | 'following' | 'none';
  email_notifications?: boolean;
  push_notifications?: boolean;
}) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase
    .from("user_settings")
    .update({ ...settings, updated_at: new Date().toISOString() })
    .eq("user_id", user.id);

  if (error) return { error: error.message };
  return { success: true };
};
