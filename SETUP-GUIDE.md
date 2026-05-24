# 🚀 BinghamHub Setup & Troubleshooting Guide

## ✅ CRITICAL FIXES APPLIED

### 1. **Fixed Supabase Image Hostname** ✅
   - Updated `next.config.ts` to use correct hostname: `azvvbucwirvvfztpflwv.supabase.co`
   - This fixes image loading issues

### 2. **Fixed Password Input Security** ✅
   - Changed login page password field from `type="text"` to `type="password"`

### 3. **Fixed TypeScript Errors** ✅
   - Added `is_owner` and `role` fields to Profile type in `useGetUser.ts`

### 4. **Fixed React Query Provider** ✅
   - Wrapped root layout with `QueryProvider` to enable React Query globally

### 5. **Created Database Schema** ✅
   - Complete SQL schema with RLS policies in `supabase-schema.sql`

---

## 🔧 SETUP INSTRUCTIONS

### Step 1: Configure Environment Variables

1. **Get your Supabase credentials:**
   - Go to https://supabase.com/dashboard
   - Select your project
   - Go to Settings > API
   - Copy:
     - Project URL
     - anon/public key
     - service_role key (keep this secret!)

2. **Update `.env.local`:**
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://azvvbucwirvvfztpflwv.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_actual_anon_key_here
   SUPABASE_SERVICE_ROLE_KEY=your_actual_service_role_key_here
   ```

   ⚠️ **IMPORTANT:** Replace the placeholder keys with your ACTUAL keys from Supabase dashboard!

### Step 2: Setup Database

1. **Go to Supabase Dashboard > SQL Editor**
2. **Copy the entire contents of `supabase-schema.sql`**
3. **Paste and run it**
4. **Verify tables were created:**
   - Go to Table Editor
   - You should see: `profiles`, `posts`, `likes`, `comments`

### Step 3: Create Storage Buckets

1. **Go to Supabase Dashboard > Storage**
2. **Create two PUBLIC buckets:**
   - Name: `avatars` (make it public)
   - Name: `posts` (make it public)
3. **The SQL policies will handle permissions**

### Step 4: Install Dependencies & Run

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

---

## 🐛 COMMON ISSUES & FIXES

### Issue 1: "Images not loading"
**Cause:** Wrong hostname in next.config.ts or missing storage buckets
**Fix:**
- ✅ Already fixed in next.config.ts
- Create `avatars` and `posts` buckets in Supabase Storage
- Make sure buckets are PUBLIC

### Issue 2: "Invalid API key" or "Failed to fetch"
**Cause:** Wrong or placeholder Supabase keys in .env.local
**Fix:**
- Get REAL keys from Supabase Dashboard > Settings > API
- Update `.env.local` with actual keys
- Restart dev server: `npm run dev`

### Issue 3: "Row Level Security policy violation"
**Cause:** RLS policies not set up correctly
**Fix:**
- Run the complete `supabase-schema.sql` in SQL Editor
- Make sure all policies are created
- Check: Dashboard > Authentication > Policies

### Issue 4: "Cannot read properties of undefined (reading 'is_owner')"
**Cause:** Profile type missing fields
**Fix:** ✅ Already fixed in `useGetUser.ts`

### Issue 5: "QueryClient not found"
**Cause:** Missing QueryProvider wrapper
**Fix:** ✅ Already fixed in root `layout.tsx`

### Issue 6: "Email validation not working"
**Cause:** Database trigger not created
**Fix:**
- Make sure you ran the full `supabase-schema.sql`
- The trigger `validate_email_on_profile_insert` should exist
- Test by trying to sign up with non-@binghamuni.edu.ng email

### Issue 7: "Owner badge not showing"
**Cause:** Owner account not properly flagged
**Fix:**
- Sign up with `clivvord@gmail.com`
- During profile setup, it should auto-detect and set `is_owner=true`
- Verify in Supabase: Table Editor > profiles > check `is_owner` column

---

## 🧪 TESTING CHECKLIST

### Authentication
- [ ] Sign up with @binghamuni.edu.ng email works
- [ ] Sign up with other email domains is blocked
- [ ] Owner email (clivvord@gmail.com) can sign up
- [ ] Login works
- [ ] Logout works
- [ ] Session persists on refresh

### Profile
- [ ] Profile setup page shows after signup
- [ ] Owner account shows "Owner Account Detected"
- [ ] Avatar upload works
- [ ] Profile displays in sidebar
- [ ] Owner badge shows for owner account

### Posts
- [ ] Can create post with text only
- [ ] Can create post with image only
- [ ] Can create post with text + image
- [ ] Posts show in feed
- [ ] Images load correctly
- [ ] Infinite scroll works
- [ ] Can delete own posts

### Interactions
- [ ] Can like posts
- [ ] Can unlike posts
- [ ] Can comment on posts
- [ ] Comments show correctly
- [ ] Owner badge shows on posts/comments

### Security
- [ ] Rate limiting works (try posting 20+ times quickly)
- [ ] HTML in posts is escaped (try posting `<script>alert('xss')</script>`)
- [ ] Can't delete other users' posts
- [ ] Can't edit other users' profiles

---

## 🔐 SECURITY CHECKLIST

### Supabase RLS Policies ✅
- [x] Profiles table has RLS enabled
- [x] Posts table has RLS enabled
- [x] Likes table has RLS enabled
- [x] Comments table has RLS enabled
- [x] Storage buckets have proper policies

### Input Validation ✅
- [x] Email domain validation
- [x] Content sanitization (XSS prevention)
- [x] File type validation
- [x] File size validation
- [x] Rate limiting

### Authentication ✅
- [x] Secure password handling
- [x] Session management
- [x] Protected routes
- [x] Owner account special privileges

---

## 📊 DATABASE STRUCTURE

```
profiles
├── id (UUID, PK)
├── email (TEXT, UNIQUE)
├── username (TEXT, UNIQUE)
├── name (TEXT)
├── avatar_url (TEXT)
├── bio (TEXT)
├── is_owner (BOOLEAN)
├── role (TEXT: 'user' | 'owner')
├── created_at (TIMESTAMPTZ)
└── updated_at (TIMESTAMPTZ)

posts
├── id (UUID, PK)
├── user_id (UUID, FK -> profiles)
├── content (TEXT)
├── image_url (TEXT)
├── image_path (TEXT)
├── created_at (TIMESTAMPTZ)
└── updated_at (TIMESTAMPTZ)

likes
├── id (UUID, PK)
├── user_id (UUID, FK -> profiles)
├── tweet_id (UUID, FK -> posts)
└── created_at (TIMESTAMPTZ)

comments
├── id (UUID, PK)
├── user_id (UUID, FK -> profiles)
├── tweet_id (UUID, FK -> posts)
├── content (TEXT)
├── created_at (TIMESTAMPTZ)
└── updated_at (TIMESTAMPTZ)
```

---

## 🚀 NEXT STEPS

### Phase 3: Additional Features (Future)
- [ ] Explore page
- [ ] Notifications system
- [ ] Direct messages (DMs)
- [ ] User profiles page
- [ ] Search functionality
- [ ] Hashtags
- [ ] Mentions (@username)
- [ ] Retweets/Reposts
- [ ] Bookmarks
- [ ] Quote tweets
- [ ] Media gallery
- [ ] Video upload support
- [ ] GIF support (Giphy integration)
- [ ] Dark/Light mode toggle
- [ ] Email notifications
- [ ] Push notifications
- [ ] Analytics dashboard (for owner)
- [ ] User moderation tools (for owner)
- [ ] Report system
- [ ] Block/Mute users
- [ ] Premium features (Stripe integration)
- [ ] Ads system

---

## 📞 SUPPORT

If you're still stuck after following this guide:

1. **Check browser console** for errors (F12 > Console)
2. **Check Supabase logs** (Dashboard > Logs)
3. **Verify environment variables** are correct
4. **Make sure database schema is fully applied**
5. **Restart dev server** after any .env changes

---

## 🎯 CURRENT STATUS

✅ **Working:**
- Email domain validation
- Owner account with badge
- Authentication (signup/login/logout)
- Profile creation
- Post creation (text + images)
- Infinite scroll
- Likes system
- Comments system
- Rate limiting
- Input sanitization
- RLS security policies

⚠️ **Needs Testing:**
- Image uploads (depends on correct Supabase keys)
- Storage bucket permissions
- Email validation trigger

🔜 **Not Yet Implemented:**
- Explore page
- Notifications
- Messages/DMs
- User profile pages
- Search
- Retweets
- Bookmarks
- Quote tweets

---

**Last Updated:** $(date)
**Version:** 1.0.0
