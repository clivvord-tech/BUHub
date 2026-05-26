# Direct Messages Setup Guide

## 🚀 Quick Setup (5 minutes)

### Step 1: Install Dependencies
```bash
npm install date-fns
```

### Step 2: Run Database Migration
1. Go to Supabase Dashboard → SQL Editor
2. Copy and paste the entire content of `messages-migration.sql`
3. Click "Run" to execute

### Step 3: Create Storage Bucket
1. Go to Supabase Dashboard → Storage
2. Click "Create bucket"
3. Name: `messages`
4. Make it **Public**
5. Click "Create bucket"

### Step 4: Start Development Server
```bash
npm run dev
```

### Step 5: Test Messages
1. Open http://localhost:3000
2. Click "Messages" in the sidebar
3. Click the edit icon (✏️) to start a new conversation
4. Search for a user and select them
5. Send a message!

---

## ✨ Features Implemented

### 🔐 Security
- **RLS Policies**: Only conversation participants can see messages
- **Secure Storage**: Message images protected by RLS
- **Authentication**: All actions require authentication

### 💬 Messaging
- **Real-time Messages**: Instant delivery using Supabase Realtime
- **Typing Indicators**: See when someone is typing
- **Read Receipts**: Track when messages are read
- **Image Support**: Send images in messages
- **Unread Count**: Badge showing unread messages

### 🎨 UI/UX
- **Responsive Design**: Works on mobile, tablet, desktop
- **Split Layout**: Conversation list + chat window
- **Mobile Optimized**: Full-screen chat on mobile
- **Smooth Scrolling**: Auto-scroll to latest message
- **Image Preview**: Preview images before sending

### 🔍 Discovery
- **User Search**: Find users by name or username
- **Start Conversations**: One-click to start chatting
- **Conversation List**: See all your conversations
- **Last Message Preview**: Quick glance at recent messages

---

## 📊 Database Schema

### Tables Created
1. **conversations** - Stores conversation metadata
2. **conversation_participants** - Junction table for participants
3. **messages** - Stores all messages
4. **typing_indicators** - Real-time typing status

### Key Features
- Automatic timestamp updates
- Cascade deletes (delete conversation → delete messages)
- Unique constraints (prevent duplicate participants)
- Optimized indexes for performance

---

## 🔧 How It Works

### Starting a Conversation
1. User clicks "New Message" button
2. Searches for another user
3. System checks if conversation exists
4. If not, creates new conversation with both participants
5. Returns conversation ID

### Sending Messages
1. User types message and clicks send
2. Message saved to database
3. Supabase Realtime broadcasts to all participants
4. Other user receives message instantly
5. Conversation timestamp updated

### Typing Indicators
1. User starts typing
2. Typing indicator set to `true` in database
3. Other user sees "typing..." message
4. After 2 seconds of inactivity, indicator set to `false`

### Read Receipts
1. User opens conversation
2. `last_read_at` timestamp updated
3. Unread count calculated: messages after `last_read_at`
4. Badge shows unread count

---

## 🎯 File Structure

```
BUHub/
├── messages-migration.sql              # Database schema
├── services/
│   └── messages.ts                     # Server actions
├── src/
│   ├── app/
│   │   └── home/
│   │       └── messages/
│   │           └── page.tsx            # Messages page
│   └── components/
│       ├── MessagesClient.tsx          # Main container
│       ├── ConversationList.tsx        # List of conversations
│       ├── ChatWindow.tsx              # Chat interface
│       └── NewMessageModal.tsx         # Start new conversation
```

---

## 🧪 Testing Checklist

### Basic Functionality
- [ ] Click "Messages" in sidebar → Opens messages page
- [ ] Click "New Message" → Opens search modal
- [ ] Search for user → Shows results
- [ ] Select user → Creates/opens conversation
- [ ] Type message → Shows typing indicator to other user
- [ ] Send message → Appears instantly for both users
- [ ] Send image → Image displays in chat
- [ ] Open conversation → Marks as read
- [ ] Close and reopen → Unread count updates

### Real-time Features
- [ ] Open same conversation in two browsers
- [ ] Send message from browser 1 → Appears in browser 2
- [ ] Type in browser 1 → "typing..." shows in browser 2
- [ ] Stop typing → "typing..." disappears after 2 seconds

### Mobile Responsiveness
- [ ] Resize to mobile → Conversation list full width
- [ ] Select conversation → Chat full screen
- [ ] Click back arrow → Returns to conversation list

### Security
- [ ] Try accessing conversation you're not in → Blocked by RLS
- [ ] Try sending message to conversation you're not in → Blocked
- [ ] Try viewing other user's messages → Blocked

---

## 🐛 Troubleshooting

### Messages not appearing in real-time
1. Check Supabase Realtime is enabled
2. Go to Supabase Dashboard → Database → Replication
3. Enable replication for `messages` and `typing_indicators` tables

### "Not authenticated" error
1. Make sure you're logged in
2. Check `.env.local` has correct Supabase credentials
3. Verify Supabase project is active

### Images not uploading
1. Check `messages` bucket exists in Supabase Storage
2. Verify bucket is set to **Public**
3. Check storage policies are created (run migration again)

### Typing indicator not working
1. Check `typing_indicators` table exists
2. Verify Realtime is enabled for the table
3. Check browser console for errors

### Conversation not created
1. Check `get_or_create_conversation` function exists
2. Run the migration SQL again
3. Check browser console for errors

---

## 🚀 Next Steps (Future Enhancements)

### Phase 1 - Core Features
- [ ] Delete messages
- [ ] Edit messages
- [ ] Message reactions (❤️, 👍, 😂)
- [ ] Voice messages
- [ ] Video messages

### Phase 2 - Group Chats
- [ ] Create group conversations (3+ people)
- [ ] Group names and avatars
- [ ] Add/remove participants
- [ ] Group admin roles

### Phase 3 - Advanced Features
- [ ] Message search
- [ ] Pin conversations
- [ ] Archive conversations
- [ ] Mute notifications
- [ ] Block users
- [ ] Report messages

### Phase 4 - Rich Media
- [ ] GIF support
- [ ] Sticker support
- [ ] File attachments (PDF, docs)
- [ ] Link previews
- [ ] Location sharing

### Phase 5 - Notifications
- [ ] Push notifications
- [ ] Email notifications
- [ ] Desktop notifications
- [ ] Sound alerts

---

## 📝 API Reference

### Server Actions

#### `getConversations()`
Returns all conversations for the current user with participants, last message, and unread count.

#### `getMessages(conversationId: string)`
Returns all messages in a conversation, ordered by creation time.

#### `sendMessage(conversationId: string, content: string, imageFile?: File)`
Sends a new message to a conversation. Optionally includes an image.

#### `markAsRead(conversationId: string)`
Marks all messages in a conversation as read by updating `last_read_at`.

#### `startConversation(otherUserId: string)`
Creates a new conversation with another user or returns existing conversation ID.

#### `searchUsers(query: string)`
Searches for users by username or name. Returns up to 10 results.

#### `updateTypingIndicator(conversationId: string, isTyping: boolean)`
Updates the typing status for the current user in a conversation.

---

## 🎨 Customization

### Change Message Bubble Colors
Edit `ChatWindow.tsx`:
```tsx
// Own messages
className="bg-blue-600"  // Change to your color

// Other user messages
className="bg-gray-800"  // Change to your color
```

### Change Unread Badge Color
Edit `ConversationList.tsx`:
```tsx
className="bg-blue-500"  // Change to your color
```

### Change Typing Indicator Text
Edit `ChatWindow.tsx`:
```tsx
<span className="text-gray-400">typing...</span>
// Change to your preferred text
```

---

## 🔒 Security Best Practices

1. **Never expose service role key** - Only use anon key in client
2. **Always use RLS** - All tables have RLS enabled
3. **Validate inputs** - Server actions validate user authentication
4. **Sanitize content** - Use existing sanitization service
5. **Rate limiting** - Consider adding rate limits for messages

---

## 📞 Support

If you encounter issues:
1. Check this guide first
2. Check browser console for errors
3. Check Supabase logs in Dashboard
4. Verify all migration steps completed
5. Test with a fresh browser/incognito window

---

**Made with ❤️ for BinghamHub**
