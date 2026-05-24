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
  image_Path: string;
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
