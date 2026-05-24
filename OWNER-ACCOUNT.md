# 👑 Owner Account Setup

## Owner Account Details

**Email:** `clivvord@gmail.com`  
**Full Name:** Nnamani Daniel (auto-filled during profile setup)  
**Role:** Owner  
**Badge:** Gold star (★) with tooltip "This account belongs to the founder of BinghamHub"

---

## 🔐 Setting Up Your Owner Account

### Step 1: Sign Up

1. Go to http://localhost:3000
2. Click "Sign up"
3. Enter:
   - **Email:** `clivvord@gmail.com`
   - **Password:** Choose a strong password (min 6 characters)
   - Example: `BUHub2024!` or `MySecurePass123`
4. Click "Continue"

### Step 2: Profile Setup

After signup, you'll be redirected to profile setup:

1. **Full Name:** Already filled as "Nnamani Daniel" (locked)
2. **Username:** Choose your username (e.g., `daniel`, `nnamani`, `buhub_founder`)
3. **Profile Picture:** Upload your photo
4. Click "Continue"

### Step 3: Verify Owner Badge

After profile setup, you should see:
- Gold star (★) badge next to your name in the sidebar
- Hover over the star → tooltip: "This account belongs to the founder of BinghamHub"
- Your posts will show the owner badge
- Your comments will show the owner badge

---

## 🎯 Owner Account Features

### Current Features:
- ✅ Special gold star badge
- ✅ Bypasses email domain restriction
- ✅ Marked as `is_owner: true` in database
- ✅ Role set to `owner` in database
- ✅ Full access to all features

### Future Admin Features (Not Yet Implemented):
- 🔜 User moderation dashboard
- 🔜 Delete any user's posts
- 🔜 Ban/suspend users
- 🔜 View analytics
- 🔜 Manage reported content
- 🔜 Send announcements
- 🔜 Verify other users
- 🔜 Access admin panel

---

## 🔒 Security Notes

### Password Recommendations:
- Minimum 6 characters (enforced)
- Use a mix of letters, numbers, and symbols
- Don't use common passwords
- Examples of strong passwords:
  - `BinghamHub2024!`
  - `MySecure@Pass123`
  - `Owner#BUHub99`

### Account Security:
- This is the ONLY owner account
- No one else can have owner privileges
- Keep your password secure
- Enable 2FA in Supabase (optional but recommended)

---

## 🧪 Testing Owner Features

### 1. Test Owner Badge Visibility

**In Sidebar:**
```
[Profile Picture]
Nnamani Daniel ★
@your_username
```

**In Posts:**
```
Nnamani Daniel ★ @your_username · 2m
This is my first post as owner!
```

**In Comments:**
```
Nnamani Daniel ★
Great post!
```

### 2. Test Email Bypass

Try creating another account:
- `test@gmail.com` → ❌ Blocked
- `student@binghamuni.edu.ng` → ✅ Allowed
- `clivvord@gmail.com` → ✅ Allowed (owner)

### 3. Test Database Flags

Check in Supabase Dashboard > Table Editor > profiles:
```
id: [your-uuid]
email: clivvord@gmail.com
name: Nnamani Daniel
username: [your-username]
is_owner: true ✅
role: owner ✅
```

---

## 🐛 Troubleshooting

### Owner badge not showing?

**Check 1:** Verify in database
1. Go to Supabase Dashboard
2. Table Editor > profiles
3. Find your account
4. Check `is_owner` column → should be `true`
5. Check `role` column → should be `owner`

**Check 2:** Clear cache and refresh
1. Press Ctrl+Shift+R (hard refresh)
2. Or clear browser cache
3. Log out and log back in

**Check 3:** Verify email
- Make sure you signed up with exactly: `clivvord@gmail.com`
- Email is case-insensitive, so `CLIVVORD@gmail.com` also works

### Can't sign up with owner email?

**Possible causes:**
1. Email already registered → Try logging in instead
2. Database trigger not applied → Run `supabase-schema.sql` again
3. Wrong email → Make sure it's `clivvord@gmail.com`

### Profile setup not auto-filling name?

**Fix:**
1. Check `services/emailValidation.ts` → `OWNER_EMAIL` should be `clivvord@gmail.com`
2. Check `src/app/auth/callback/page.tsx` → should have owner detection logic
3. If still not working, manually type "Nnamani Daniel"

---

## 📊 Owner Account in Database

Your profile will look like this in the database:

```sql
-- profiles table
{
  id: "uuid-here",
  email: "clivvord@gmail.com",
  username: "your_chosen_username",
  name: "Nnamani Daniel",
  avatar_url: "https://...supabase.co/storage/v1/object/public/avatars/...",
  bio: null,
  is_owner: true,
  role: "owner",
  created_at: "2024-01-01T00:00:00Z",
  updated_at: "2024-01-01T00:00:00Z"
}
```

---

## 🎨 Owner Badge Styling

The badge uses these styles:
- **Background:** Gradient from yellow-400 to yellow-600
- **Icon:** ★ (Unicode star)
- **Size:** Small (16px), Medium (20px), Large (24px)
- **Tooltip:** Appears on hover
- **Border:** Subtle yellow glow on tooltip

---

## 🚀 Next Steps After Setup

1. **Create your first post** to test the owner badge
2. **Invite university students** to join (they need @binghamuni.edu.ng emails)
3. **Test all features** (posts, likes, comments)
4. **Customize your profile** (add bio, change avatar)
5. **Plan future features** (see FIXES-SUMMARY.md for ideas)

---

## 📞 Support

If you have issues with the owner account:
1. Check this guide first
2. Read SETUP-GUIDE.md for general troubleshooting
3. Check browser console for errors (F12)
4. Verify database schema was applied correctly
5. Make sure Supabase keys are correct in .env.local

---

**Remember:** You are the ONLY owner. This account has special privileges and will eventually have admin features. Keep it secure! 🔐
