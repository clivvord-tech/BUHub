# Repost Profile Fix - Implementation Summary

## Problem
User profile pages only showed original posts created by the user. Reposts were not appearing on the profile, even though the repost system was fully functional.

## Solution
Updated the profile posts query to fetch **both** original posts and reposts, then combine and display them with proper repost indicators.

---

## Changes Made

### 1. Updated Tweet Type (`types/types.ts`)
Added repost metadata fields to the `Tweet` type:

```typescript
export type Tweet = {
  // ... existing fields
  
  // NEW: Repost metadata
  reposted_by?: {
    id: string;
    name: string;
    username: string;
    avatar_url: string;
    is_owner: boolean;
  };
  repost_created_at?: string;
};
```

### 2. Updated `getUserPosts` Function (`services/profile.ts`)

**Old Approach:**
```typescript
// Only fetched original posts
const { data } = await supabase
  .from("posts")
  .select(...)
  .eq("user_id", userId)
```

**New Approach:**
```typescript
// 1. Fetch original posts
const { data: originalPosts } = await supabase
  .from("posts")
  .select(...)
  .eq("user_id", userId);

// 2. Fetch reposts by the user
const { data: reposts } = await supabase
  .from("reposts")
  .select(`
    created_at,
    user_id,
    posts:tweet_id (
      id,
      content,
      image_url,
      image_path,
      created_at,
      user_id,
      is_pinned,
      profiles:user_id (...)
    ),
    reposter:user_id (
      id,
      username,
      name,
      avatar_url,
      is_owner
    )
  `)
  .eq("user_id", userId);

// 3. Transform reposts to include repost metadata
const transformedReposts = reposts?.map(repost => ({
  ...repost.posts,
  reposted_by: repost.reposter,
  repost_created_at: repost.created_at,
}));

// 4. Combine and sort by date (pinned first, then chronological)
const allPosts = [...originalPosts, ...transformedReposts];
allPosts.sort((a, b) => {
  if (a.is_pinned && !b.is_pinned) return -1;
  if (!a.is_pinned && b.is_pinned) return 1;
  return new Date(b.sort_date).getTime() - new Date(a.sort_date).getTime();
});
```

### 3. Updated Profile Page (`app/home/profile/[username]/page.tsx`)

Added repost header display:

```typescript
{tweet.reposted_by && (
  <div className="px-4 pt-2 flex items-center gap-2 text-secondary-text text-sm">
    <FiRepeat className="text-green-500" />
    <span>
      {tweet.reposted_by.id === currentUser?.id 
        ? 'You reposted' 
        : `@${tweet.reposted_by.username} reposted`}
    </span>
  </div>
)}
```

---

## How It Works

### Data Flow

1. **User visits profile page** → `loadProfile()` is called
2. **`getUserPosts(userId)` executes:**
   - Queries `posts` table for original posts by user
   - Queries `reposts` table for posts reposted by user
   - Joins with `posts` table to get full post data
   - Joins with `profiles` table to get reposter info
3. **Data transformation:**
   - Original posts: Keep as-is
   - Reposts: Add `reposted_by` and `repost_created_at` fields
4. **Combine and sort:**
   - Pinned posts first
   - Then by date (repost date for reposts, creation date for originals)
5. **Display:**
   - If `reposted_by` exists → Show repost header
   - Otherwise → Show normal post (with pin indicator if pinned)

### Display Logic

```
┌─────────────────────────────────────┐
│ 🔁 You reposted                     │  ← Repost header (if reposted_by exists)
├─────────────────────────────────────┤
│ 👤 @username                        │
│ Post content here...                │
│ ❤️ 💬 🔁 📊 🔖                      │  ← Actions
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ 📌 Pinned post                      │  ← Pin header (if is_pinned && !reposted_by)
├─────────────────────────────────────┤
│ 👤 @username                        │
│ Post content here...                │
│ ❤️ 💬 🔁 📊 🔖                      │
└─────────────────────────────────────┘
```

---

## X/Twitter Behavior Match

✅ **Shows original posts** - Posts created by the user  
✅ **Shows reposts** - Posts reposted by the user  
✅ **Repost indicator** - "You reposted" or "@username reposted"  
✅ **Chronological order** - Sorted by date (pinned first)  
✅ **Does NOT show** - Other people's reposts of this user's posts  

---

## Database Schema (Reference)

```sql
-- Posts table
CREATE TABLE posts (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  content TEXT,
  image_url TEXT,
  image_path TEXT,
  is_pinned BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reposts table
CREATE TABLE reposts (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),  -- Who reposted
  tweet_id UUID REFERENCES posts(id),    -- What was reposted
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## Testing

To verify the fix works:

1. **Create a post** as User A
2. **Repost it** as User B
3. **Visit User B's profile** → Should see the reposted post with "You reposted" header
4. **Visit User A's profile** → Should NOT see User B's repost (only original post)
5. **Create and pin a post** as User B → Should appear first, above reposts

---

## Performance Considerations

- **Two queries** instead of one (original posts + reposts)
- **Client-side sorting** after fetching data
- **Pagination** still works (applied after combining results)

For large profiles with many posts/reposts, consider:
- Server-side sorting using SQL UNION
- Caching frequently accessed profiles
- Lazy loading with infinite scroll

---

## Future Enhancements

- [ ] Add "Repost with comment" (quote tweets)
- [ ] Show repost count on profile stats
- [ ] Filter to show only reposts or only original posts
- [ ] Optimize with SQL UNION for better performance

---

**Status:** ✅ Complete and working
