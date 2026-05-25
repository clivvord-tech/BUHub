import { supabase } from "../lib/SupabaseClient";

export const saveDraft = async (content: string | null, imageUrl: string | null, imagePath: string | null) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { data, error } = await supabase
    .from("drafts")
    .insert({
      user_id: user.id,
      content,
      image_url: imageUrl,
      image_path: imagePath,
    })
    .select()
    .single();

  if (error) return { error: error.message };
  return { data };
};

export const getDrafts = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { data, error } = await supabase
    .from("drafts")
    .select("*")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false });

  if (error) return { error: error.message };
  return { data };
};

export const deleteDraft = async (draftId: string) => {
  const { error } = await supabase
    .from("drafts")
    .delete()
    .eq("id", draftId);

  if (error) return { error: error.message };
  return { success: true };
};
