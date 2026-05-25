export type UserRole = "user" | "owner";

export type Profile = {
  id: string;
  email: string;
  name: string;
  username: string;
  avatar_url: string;
  bio?: string;
  is_owner: boolean;
  role: UserRole;
  created_at: string;
};

export type Tweet = {
  id: string;
  user_id: string;
  content: string;
  image_url: string;
  created_at: string;
  image_path: string;
  is_pinned?: boolean;
  profiles: {
    id: string;
    avatar_url: string;
    name: string;
    username: string;
    is_owner: boolean;
    role: UserRole;
  };
};

export type Comment = {
  id:string,
  user_id:string,
  tweet_id:string,
  content:string,
  created_at:string,
   profiles: {
    id: string;
    avatar_url: string;
    name: string;
    username: string;
    is_owner: boolean;
    role: UserRole;
  };
}

export type Follow = {
  id: string;
  follower_id: string;
  following_id: string;
  created_at: string;
};

export type Notification = {
  id: string;
  user_id: string;
  actor_id: string;
  type: 'like' | 'comment' | 'follow' | 'repost';
  post_id?: string;
  comment_id?: string;
  is_read: boolean;
  created_at: string;
  actor: {
    id: string;
    name: string;
    username: string;
    avatar_url: string;
    is_owner: boolean;
  };
  post?: {
    id: string;
    content: string;
  };
};

export type ProfileStats = {
  id: string;
  username: string;
  name: string;
  avatar_url: string;
  bio?: string;
  is_owner: boolean;
  role: UserRole;
  followers_count: number;
  following_count: number;
  posts_count: number;
};
