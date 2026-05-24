# BinghamHub 🎓

<img width="1280" height="720" alt="BinghamHub - University Social Network" src="https://github.com/user-attachments/assets/0231560c-2914-49a8-bffe-01b69ecbe405" />

A private, university-only social network for **Bingham University students and staff**. Built with Next.js 15, Supabase, TypeScript, and Tailwind CSS v4.

## 🚀 Quick Start

**New to this project? Start here:** 👉 [QUICK-START.md](./QUICK-START.md)

It takes only **6 minutes** to get BinghamHub running!

## ✨ Features

### 🔐 Security & Access Control
- **Email Domain Restriction:** Only @binghamuni.edu.ng emails can sign up
- **Owner Account:** Special account (clivvord@gmail.com) with founder badge
- **Row Level Security:** Supabase RLS policies on all tables
- **Input Sanitization:** XSS prevention on all user inputs
- **Rate Limiting:** Prevents spam (20 posts/min, 30 comments/min, 60 likes/min)
- **File Validation:** Type and size checks on uploads

### 👤 User Features
- **Authentication:** Secure signup/login with Supabase Auth
- **Profile System:** Avatar, bio, username, display name
- **Owner Badge:** Gold star (★) for the founder account

### 📝 Post Features
- **Create Posts:** Text, images, or both
- **Infinite Scroll:** Auto-loads more posts as you scroll
- **Like/Unlike:** Heart posts you enjoy
- **Comments:** Reply to any post
- **Delete:** Remove your own posts
- **Image Upload:** Supabase Storage integration

### 🎨 Design
- **X/Twitter-like UI:** Familiar, clean interface
- **Dark Mode:** Easy on the eyes
- **Responsive:** Works on mobile, tablet, and desktop
- **Optimistic Updates:** Instant feedback on actions

## 🛠️ Tech Stack

- **Frontend:** React 19, Next.js 16, TypeScript
- **Styling:** Tailwind CSS v4
- **Backend:** Supabase (Postgres + Auth + Storage)
- **State Management:** React Query (TanStack Query)
- **Icons:** React Icons
- **Deployment:** Vercel-ready

## 📚 Documentation

- **[QUICK-START.md](./QUICK-START.md)** - Get running in 6 minutes ⚡
- **[SETUP-GUIDE.md](./SETUP-GUIDE.md)** - Detailed setup and troubleshooting 📖
- **[FIXES-SUMMARY.md](./FIXES-SUMMARY.md)** - What was fixed and why 🔧
- **[OWNER-ACCOUNT.md](./OWNER-ACCOUNT.md)** - Owner account setup 👑
- **[supabase-schema.sql](./supabase-schema.sql)** - Database schema 🗄️

## 🎯 Project Status

### ✅ Completed Features
- Email domain validation (@binghamuni.edu.ng)
- Owner account with special badge
- Authentication (signup/login/logout)
- Profile creation with avatar upload
- Post creation (text + images)
- Infinite scroll feed
- Like/Unlike system
- Comments system
- Delete own posts
- Rate limiting
- Input sanitization
- RLS security policies
- Responsive design
- Dark mode UI

### 🔜 Future Features
- Explore page
- Notifications system
- Direct messages (DMs)
- User profile pages
- Search functionality
- Hashtags
- Mentions (@username)
- Retweets/Reposts
- Bookmarks
- Quote tweets
- Video uploads
- GIF support
- Light mode
- Email notifications
- Analytics dashboard (owner)
- User moderation tools (owner)
- Report system
- Block/Mute users
- Premium features

## 🔒 Security Features

### Database Level
- Row Level Security (RLS) on all tables
- Email domain validation trigger
- Foreign key constraints
- Unique constraints
- Cascade deletes

### Application Level
- Input sanitization (XSS prevention)
- Rate limiting (spam prevention)
- File validation (type + size)
- Session management
- Protected routes
- Secure password handling

### Storage Level
- Public buckets with RLS policies
- User-specific upload permissions
- User-specific delete permissions

## 📦 Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd BUHub

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env.local
# Edit .env.local with your Supabase credentials

# Run database schema
# Copy supabase-schema.sql and run in Supabase SQL Editor

# Create storage buckets
# Create 'avatars' and 'posts' buckets in Supabase Storage (make them public)

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 🧪 Testing

### Test Email Validation
```
test@gmail.com → ❌ Blocked
student@binghamuni.edu.ng → ✅ Allowed
clivvord@gmail.com → ✅ Allowed (owner)
```

### Test Owner Badge
1. Sign up with `clivvord@gmail.com`
2. Complete profile setup
3. Check sidebar → Should show gold star (★)
4. Create a post → Should show owner badge

### Test Security
- Try posting 20+ times quickly → Rate limited
- Try posting `<script>alert('xss')</script>` → Escaped as text
- Try uploading 50MB image → Rejected
- Try uploading PDF as image → Rejected

## 🚀 Deployment

### Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Environment Variables in Vercel

Add these in Vercel Dashboard > Settings > Environment Variables:
```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
```

## 📊 Database Schema

```
profiles (users)
├── id (UUID, PK)
├── email (TEXT, UNIQUE)
├── username (TEXT, UNIQUE)
├── name (TEXT)
├── avatar_url (TEXT)
├── bio (TEXT)
├── is_owner (BOOLEAN)
└── role (TEXT)

posts (tweets)
├── id (UUID, PK)
├── user_id (UUID, FK)
├── content (TEXT)
├── image_url (TEXT)
└── image_path (TEXT)

likes
├── id (UUID, PK)
├── user_id (UUID, FK)
└── tweet_id (UUID, FK)

comments
├── id (UUID, PK)
├── user_id (UUID, FK)
├── tweet_id (UUID, FK)
└── content (TEXT)
```

## 🤝 Contributing

This is a private university project. Contributions are welcome from Bingham University students and staff.

## 📄 License

Private project for Bingham University.

## 👨‍💻 Owner

**Nnamani Daniel**  
Email: clivvord@gmail.com  
Role: Founder & Owner of BinghamHub

## 🙏 Credits

Based on the Twitter Clone tutorial by [egbontech](https://github.com/egbontech/twitter-clone-egbontech)

## 📞 Support

For issues or questions:
1. Check [SETUP-GUIDE.md](./SETUP-GUIDE.md)
2. Check [FIXES-SUMMARY.md](./FIXES-SUMMARY.md)
3. Check browser console for errors
4. Verify Supabase setup is complete

---

**Made with ❤️ for Bingham University**  
