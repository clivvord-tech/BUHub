import { supabase } from "../lib/SupabaseClient";

export interface SearchResult {
  type: 'user' | 'post';
  id: string;
  content?: string;
  username?: string;
  name?: string;
  avatar_url?: string;
  image_url?: string;
  created_at?: string;
  is_owner?: boolean;
}

export async function searchAll(query: string): Promise<SearchResult[]> {
  if (!query.trim()) return [];

  const searchTerm = `%${query.trim()}%`;
  
  // Search users
  const { data: users } = await supabase
    .from('profiles')
    .select('id, username, name, avatar_url, is_owner')
    .or(`username.ilike.${searchTerm},name.ilike.${searchTerm}`)
    .limit(5);

  // Search posts
  const { data: posts } = await supabase
    .from('tweets')
    .select('id, content, image_url, created_at, user_id, profiles(username, name, avatar_url)')
    .ilike('content', searchTerm)
    .order('created_at', { ascending: false })
    .limit(5);

  const results: SearchResult[] = [];

  // Add users to results
  if (users) {
    users.forEach(user => {
      results.push({
        type: 'user',
        id: user.id,
        username: user.username,
        name: user.name,
        avatar_url: user.avatar_url,
        is_owner: user.is_owner
      });
    });
  }

  // Add posts to results
  if (posts) {
    posts.forEach((post: any) => {
      results.push({
        type: 'post',
        id: post.id,
        content: post.content,
        image_url: post.image_url,
        created_at: post.created_at,
        username: post.profiles?.username,
        name: post.profiles?.name,
        avatar_url: post.profiles?.avatar_url
      });
    });
  }

  return results;
}
