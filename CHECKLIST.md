# ✅ BinghamHub Setup Checklist

Use this checklist to track your progress setting up BinghamHub.

## 📋 Pre-Setup (Understanding)

- [ ] Read QUICK-START.md
- [ ] Read FIXES-SUMMARY.md
- [ ] Understand what was fixed
- [ ] Have Supabase account ready
- [ ] Have VS Code open with project

---

## 🔧 Step 1: Environment Variables

- [ ] Opened Supabase Dashboard
- [ ] Navigated to Settings > API
- [ ] Copied Project URL
- [ ] Copied anon/public key
- [ ] Copied service_role key
- [ ] Opened .env.local in VS Code
- [ ] Pasted NEXT_PUBLIC_SUPABASE_URL
- [ ] Pasted NEXT_PUBLIC_SUPABASE_ANON_KEY
- [ ] Pasted SUPABASE_SERVICE_ROLE_KEY
- [ ] Saved .env.local file
- [ ] Verified no placeholder values remain

**Status:** ⬜ Not Started | ⏳ In Progress | ✅ Complete

---

## 🗄️ Step 2: Database Setup

- [ ] Opened Supabase Dashboard
- [ ] Navigated to SQL Editor
- [ ] Clicked "New Query"
- [ ] Opened supabase-schema.sql in VS Code
- [ ] Copied entire file contents (Ctrl+A, Ctrl+C)
- [ ] Pasted into Supabase SQL Editor
- [ ] Clicked "Run" button
- [ ] Saw "Success" message
- [ ] Navigated to Table Editor
- [ ] Verified `profiles` table exists
- [ ] Verified `posts` table exists
- [ ] Verified `likes` table exists
- [ ] Verified `comments` table exists
- [ ] Checked Authentication > Policies
- [ ] Verified multiple policies exist

**Status:** ⬜ Not Started | ⏳ In Progress | ✅ Complete

---

## 📦 Step 3: Storage Buckets

- [ ] Opened Supabase Dashboard
- [ ] Navigated to Storage
- [ ] Clicked "New bucket"
- [ ] Created bucket named `avatars`
- [ ] Made `avatars` bucket PUBLIC
- [ ] Clicked "New bucket" again
- [ ] Created bucket named `posts`
- [ ] Made `posts` bucket PUBLIC
- [ ] Verified both buckets show in Storage list

**Status:** ⬜ Not Started | ⏳ In Progress | ✅ Complete

---

## 🚀 Step 4: Run Development Server

- [ ] Opened terminal in VS Code
- [ ] Ran `npm install`
- [ ] Waited for installation to complete
- [ ] Ran `npm run dev`
- [ ] Saw "Ready" message
- [ ] Opened http://localhost:3000
- [ ] Saw BinghamHub login page

**Status:** ⬜ Not Started | ⏳ In Progress | ✅ Complete

---

## 🧪 Step 5: Test Authentication

### Test Email Validation
- [ ] Clicked "Sign up"
- [ ] Tried email: `test@gmail.com`
- [ ] Got blocked with error message ✅
- [ ] Tried email: `student@binghamuni.edu.ng`
- [ ] Signup form accepted it ✅
- [ ] Completed signup with university email
- [ ] Redirected to profile setup

### Test Profile Setup
- [ ] Saw profile setup page
- [ ] Entered username
- [ ] Uploaded avatar image
- [ ] Clicked "Continue"
- [ ] Redirected to /home
- [ ] Saw feed page

**Status:** ⬜ Not Started | ⏳ In Progress | ✅ Complete

---

## 👑 Step 6: Test Owner Account

- [ ] Logged out (if logged in)
- [ ] Clicked "Sign up"
- [ ] Entered email: `clivvord@gmail.com`
- [ ] Entered password (min 6 chars)
- [ ] Clicked "Continue"
- [ ] Saw "Owner Account Detected" message ✅
- [ ] Name auto-filled to "Nnamani Daniel" ✅
- [ ] Entered username
- [ ] Uploaded avatar
- [ ] Clicked "Continue"
- [ ] Redirected to /home
- [ ] Saw gold star (★) badge in sidebar ✅
- [ ] Hovered over star, saw tooltip ✅

**Status:** ⬜ Not Started | ⏳ In Progress | ✅ Complete

---

## 📝 Step 7: Test Posts

### Create Posts
- [ ] Clicked in "what's happening?" box
- [ ] Typed test message
- [ ] Clicked "Post"
- [ ] Post appeared in feed ✅
- [ ] Owner badge shows on post ✅

### Upload Images
- [ ] Clicked photo icon
- [ ] Selected image file
- [ ] Image preview appeared
- [ ] Clicked "Post"
- [ ] Post with image appeared in feed ✅
- [ ] Image loaded correctly ✅

### Delete Posts
- [ ] Found own post
- [ ] Clicked trash icon
- [ ] Post disappeared ✅

**Status:** ⬜ Not Started | ⏳ In Progress | ✅ Complete

---

## ❤️ Step 8: Test Interactions

### Likes
- [ ] Found a post
- [ ] Clicked heart icon
- [ ] Heart turned red ✅
- [ ] Like count increased ✅
- [ ] Clicked heart again
- [ ] Heart turned gray ✅
- [ ] Like count decreased ✅

### Comments
- [ ] Clicked on a post
- [ ] Saw post detail page
- [ ] Typed comment
- [ ] Clicked "Reply"
- [ ] Comment appeared ✅
- [ ] Owner badge shows on comment (if owner) ✅

**Status:** ⬜ Not Started | ⏳ In Progress | ✅ Complete

---

## 🔒 Step 9: Test Security

### Rate Limiting
- [ ] Tried posting 20+ times quickly
- [ ] Got rate limit error ✅

### XSS Prevention
- [ ] Posted: `<script>alert('xss')</script>`
- [ ] Text displayed as-is (not executed) ✅

### File Validation
- [ ] Tried uploading 50MB image
- [ ] Got file size error ✅
- [ ] Tried uploading PDF as image
- [ ] Got file type error ✅

**Status:** ⬜ Not Started | ⏳ In Progress | ✅ Complete

---

## 📱 Step 10: Test Responsive Design

- [ ] Opened browser DevTools (F12)
- [ ] Clicked device toolbar (mobile view)
- [ ] Tested on iPhone size
- [ ] Tested on iPad size
- [ ] Tested on desktop size
- [ ] All layouts look good ✅

**Status:** ⬜ Not Started | ⏳ In Progress | ✅ Complete

---

## 🎉 Final Verification

- [ ] All authentication flows work
- [ ] Owner badge displays correctly
- [ ] Posts can be created and deleted
- [ ] Images upload and display
- [ ] Likes work
- [ ] Comments work
- [ ] Infinite scroll works
- [ ] Rate limiting works
- [ ] XSS prevention works
- [ ] Mobile responsive
- [ ] No console errors
- [ ] No TypeScript errors

**Status:** ⬜ Not Started | ⏳ In Progress | ✅ Complete

---

## 🐛 Troubleshooting (If Needed)

If something doesn't work, check:

- [ ] Read SETUP-GUIDE.md troubleshooting section
- [ ] Checked browser console for errors
- [ ] Checked terminal for errors
- [ ] Verified .env.local has correct keys
- [ ] Verified database schema was fully applied
- [ ] Verified storage buckets exist and are public
- [ ] Restarted dev server
- [ ] Cleared browser cache
- [ ] Deleted .next folder and restarted

---

## 📊 Overall Progress

**Setup Progress:** ___/10 steps complete

**Testing Progress:** ___/10 tests passed

**Overall Status:** 
- ⬜ Not Started
- ⏳ In Progress  
- ✅ Complete and Working!

---

## 🎯 Next Steps After Completion

- [ ] Read OWNER-ACCOUNT.md for owner features
- [ ] Invite university students to test
- [ ] Plan future features
- [ ] Consider deployment to Vercel
- [ ] Set up custom domain (optional)
- [ ] Enable Supabase 2FA (recommended)

---

## 📝 Notes

Use this space to track any issues or observations:

```
Issue 1: 
Solution: 

Issue 2:
Solution:

Issue 3:
Solution:
```

---

**Last Updated:** $(date)
**Time to Complete:** ~30-60 minutes (including testing)
**Difficulty:** Easy to Medium
