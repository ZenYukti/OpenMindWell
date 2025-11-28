# 🧠 OpenMindWell

> A free, anonymous, privacy-first mental health peer support platform.

![React](https://img.shields.io/badge/React-18.2-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC)
![Supabase](https://img.shields.io/badge/Supabase-Backend-green)

## ✨ Features

### 🔐 Privacy First
- **Anonymous Authentication** - No email, no password, no tracking
- **Encrypted Data** - Your journal entries are private and secure
- **No Personal Data Collection** - We don't know who you are

### 💬 Peer Support Chat
- Join topic-based chat rooms (Anxiety, Depression, Stress, etc.)
- Real-time messaging with fellow community members
- Safe, moderated environment
- Create your own support rooms

### 📔 Private Journal
- Express your thoughts freely
- Daily prompts to guide your writing
- Search and organize entries
- Only you can access your journal

### 🎯 Habit Tracking
- Create and track healthy habits
- Visual progress indicators
- Daily check-ins with streak tracking
- Customizable habit emojis

### 📊 Mood Tracking
- Log your mood with simple emoji scale
- Track energy and anxiety levels
- Add notes for context
- View mood trends over time

### 🆘 Crisis Support
- One-click access to crisis helplines
- Automatic crisis keyword detection
- US and India helpline numbers
- IASP international resources

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account (free tier works!)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/openmindwell.git
cd openmindwell/frontend
```

2. **Install dependencies**
```bash
npm install
```

3. **Setup Supabase**
   - Create a new project at [supabase.com](https://supabase.com)
   - Go to **SQL Editor** and run the schema from `supabase/schema.sql`
   - Enable **Anonymous Authentication** in Authentication > Providers
   - Copy your project URL and anon key

4. **Configure environment**
```bash
cp .env.example .env
```
Edit `.env`:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

5. **Start development server**
```bash
npm run dev
```

Visit `http://localhost:5173` 🎉

## 📁 Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── layout/
│   │   │   └── DashboardLayout.tsx    # Main app layout
│   │   └── CrisisModal.tsx            # Crisis resources modal
│   ├── lib/
│   │   ├── supabase.ts                # Supabase client & helpers
│   │   ├── database.types.ts          # TypeScript types
│   │   └── utils.ts                   # Utility functions
│   ├── pages/
│   │   ├── Landing.tsx                # Homepage
│   │   ├── Dashboard.tsx              # User dashboard
│   │   ├── ChatRooms.tsx              # Chat room list
│   │   ├── ChatRoom.tsx               # Individual chat room
│   │   ├── Journal.tsx                # Journal entries
│   │   ├── Habits.tsx                 # Habit tracker
│   │   ├── Mood.tsx                   # Mood tracker
│   │   └── Resources.tsx              # Mental health resources
│   ├── store/
│   │   ├── authStore.ts               # Auth state (Zustand)
│   │   └── uiStore.ts                 # UI state (Zustand)
│   ├── App.tsx                        # Routes & main app
│   ├── main.tsx                       # Entry point
│   └── index.css                      # Global styles
├── supabase/
│   └── schema.sql                     # Database schema
└── package.json
```

## 🛠️ Tech Stack

| Technology | Purpose |
|------------|---------|
| React 18 | UI Framework |
| TypeScript | Type Safety |
| Vite | Build Tool |
| Tailwind CSS | Styling |
| Supabase | Backend (Auth, DB, Realtime) |
| Zustand | State Management |
| React Router | Routing |
| Lucide React | Icons |

## 🤝 Contributing

Contributions are welcome! Please read our contributing guidelines first.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📜 License

This project is open source and available under the [MIT License](LICENSE).

## 💚 Support

If you find this project helpful, please consider:
- ⭐ Starring the repository
- 🐛 Reporting bugs
- 💡 Suggesting features
- 🤝 Contributing code

## 🆘 Crisis Resources

If you or someone you know is in crisis:

**United States**
- 988 Suicide & Crisis Lifeline: Call or text **988**
- Crisis Text Line: Text **HOME** to **741741**

**India**
- KIRAN Helpline: **1800-599-0019** (24/7, free)
- Vandrevala Foundation: **1860-2662-345**

**International**
- [IASP Crisis Centres](https://www.iasp.info/resources/Crisis_Centres/)

---

Built with 💚 for mental health awareness
