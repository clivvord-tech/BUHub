# ⚡ QUICK START - DO THIS NOW!

## 🚨 CRITICAL: 3 Steps to Get BinghamHub Running

### ✅ STEP 1: Update Supabase Keys (2 minutes)

1. Open https://supabase.com/dashboard
2. Click your project
3. Go to **Settings** → **API**
4. Copy these values:

```
Project URL: https://azvvbucwirvvfztpflwv.supabase.co
anon/public key: eyJhbGc... (long string)
service_role key: eyJhbGc... (different long string)
```

5. Open `.env.local` in VS Code
6. Replace with YOUR actual keys:

```env
NEXT_PUBLIC_SUPABASE_URL=https://azvvbucwirvvfztpflwv.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=paste_your_actual_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=paste_your_actual_service_role_key_here
```

7. Save the file

---

### ✅ STEP 2: Setup Database (3 minutes)

1. Open https://supabase.com/dashboard
2. Click your project
3. Go to **SQL Editor**
4. Click **New Query**
5. Open `supabase-schema.sql` in VS Code
6. Copy EVERYTHING (Ctrl+A, Ctrl+C)
7. Paste into Supabase SQL Editor
8. Click **Run** (or press Ctrl+Enter)
9. Wait for "Success" message

**Verify it worked:**
- Go to **Table Editor**
- You should see: `profiles`, `posts`, `likes`, `comments`

---

### ✅ STEP 3: Create Storage Buckets (1 minute)

1. In Supabase Dashboard, go to **Storage**
2. Click **New bucket**
3. Name: `avatars`
4. **Make it PUBLIC** ✅
5. Click Create

6. Click **New bucket** again
7. Name: `posts`
8. **Make it PUBLIC** ✅
9. Click Create

---

## 🎉 DONE! Now Test It

```bash
# In VS Code terminal:
npm run dev
```

Open http://localhost:3000

### Test Signup:
1. Try email: `test@gmail.com` → Should be BLOCKED ✅
2. Try email: `student@binghamuni.edu.ng` → Should WORK ✅
3. Try email: `clivvord@gmail.com` → Should WORK (owner) ✅

### Test Owner Account:
1. Sign up with `clivvord@gmail.com`
2. Should see "Owner Account Detected" ✅
3. Name auto-fills to "Nnamani Daniel" ✅
4. Upload avatar, enter username, submit
5. Should see gold star badge in sidebar ✅

### Test Posts:
1. Create a post with text
2. Create a post with image
3. Like/unlike posts
4. Comment on posts
5. Scroll down → more posts load automatically

---

## 🐛 If Something Breaks

### "Invalid API key" error?
→ Your Supabase keys are wrong. Go back to Step 1.

### "relation 'profiles' does not exist" error?
→ Database schema not applied. Go back to Step 2.

### Images not uploading?
→ Storage buckets missing. Go back to Step 3.

### Still stuck?
→ Read `SETUP-GUIDE.md` for detailed troubleshooting

---

## 📚 Documentation Files

- **FIXES-SUMMARY.md** - What was fixed and why
- **SETUP-GUIDE.md** - Detailed setup and troubleshooting
- **supabase-schema.sql** - Database schema (already used in Step 2)
- **.env.example** - Environment variables template

---

## ✨ What You'll Have After This

✅ Secure authentication (email domain restricted)
✅ Owner account with special badge
✅ Post creation (text + images)
✅ Like/unlike posts
✅ Comments
✅ Infinite scroll feed
✅ Beautiful X/Twitter-like UI
✅ Mobile responsive
✅ Production-ready security

---

**Time to complete:** ~6 minutes
**Difficulty:** Easy (just copy/paste)
**Result:** Fully working BinghamHub! 🎉
