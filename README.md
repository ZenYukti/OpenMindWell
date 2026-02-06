# OpenMindWell 🌱

![Landing Page Glimpse for OpenMindWell](image.png)

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)
![Built by](https://img.shields.io/badge/Built%20by-Team%20ZenYukti-purple)
![Self-Hosted](https://img.shields.io/badge/deployment-self--hosted-orange)

**A compassionate, AI-powered mental health support platform**

> **Self-Hosted Project**: OpenMindWell is designed to be deployed by each user with their own infrastructure. There is no central hosted instance - users maintain full control of their data and deployment.

> **IMPORTANT DISCLAIMER**: OpenMindWell is NOT a substitute for professional mental health care. If you are in crisis, please contact emergency services or a crisis hotline immediately.

## Features

- **Anonymous Chat Rooms** - Join peer support groups without revealing identity
- **AI Crisis Detection** - Automatic detection of concerning messages with resource suggestions
- **Private Journaling** - Track mood, thoughts, and personal reflections
- **Habit Tracking** - Build positive daily habits with streak tracking
- **Resource Library** - Curated mental health resources, hotlines, and exercises
- **Volunteer Moderation** - Community-driven safety and support

## Quick Start

```bash
# Clone the repository
git clone https://github.com/yourusername/openmindwell.git
cd openmindwell

# Install dependencies
npm install

# Set up environment variables
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
# Edit .env files with your credentials

# Run both servers
npm run dev
```

Visit http://localhost:3000

For deatailed guide, read [Contributing Guidelines](CONTRIBUTING.md) first.

## Documentation

**READ THIS FIRST:** [OPENMINDWELL_PROJECT_GUIDE.md](./OPENMINDWELL_PROJECT_GUIDE.md)

This comprehensive guide contains:
- Complete setup instructions
- Free service account creation
- Deployment guides
- Security considerations

## Tech Stack

**100% Free Services:**
- **Frontend**: React 18, Vite, React Router, TypeScript, Tailwind CSS → Vercel/Netlify
- **Backend**: Node.js, Express, WebSocket, TypeScript → Render/Railway
- **Database**: Supabase (PostgreSQL + Auth)
- **AI**: HuggingFace Inference API (emotion detection)

## Architecture Overview

```
┌─────────────┐
│    USER     │ (Browser)
└──────┬──────┘
       │
       ├─────────────────────────────────────┐
       │                                     │
       ▼                                     ▼
┌─────────────┐                      ┌─────────────┐
│  FRONTEND   │◄────WebSocket───────►│   BACKEND   │
│ (React/Vite)│                      │  (Express)  │
└──────┬──────┘                      └──────┬──────┘
       │                                     │
       │ Supabase Auth                       ├──────────┐
       │ (Anonymous)                         │          │
       │                                     ▼          ▼
       │                              ┌──────────┐ ┌───────────┐
       └─────────────────────────────►│ SUPABASE │ │HuggingFace│
                                      │(Database)│ │   (AI)    │
                                      └──────────┘ └───────────┘
```

**Key Interactions:**
- **User → Frontend**: Browse, chat, journal, track habits
- **Frontend ↔ Backend**: REST API (journal, habits) + WebSocket (real-time chat)
- **Frontend → Supabase**: Anonymous authentication, direct queries
- **Backend → Supabase**: Store messages, validate users, fetch data
- **Backend → HuggingFace**: Analyze chat messages for crisis detection

## Project Structure

```
openmindwell/
├── backend/           # Express API + WebSocket server
├── frontend/          # React + Vite application
├── OPENMINDWELL_PROJECT_GUIDE.md
├── CONTRIBUTING.md
└── package.json       # Monorepo scripts
```

## Safety Features

- Prominent crisis disclaimers throughout the app
- AI-powered crisis detection on all messages
- Automatic resource suggestions
- User reporting and moderation system
- Anonymous/pseudonymous accounts only
- Row-level security on all data

## Contributing

We welcome contributions! See [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

Perfect for:
- GSoC, Hacktoberfest, WoC programs
- Portfolio projects
- Making a social impact

## Crisis Resources

**If you're in crisis:**

**🇺🇸 United States:**
- **988 Suicide & Crisis Lifeline**: Call/Text 988
- **Crisis Text Line**: Text HOME to 741741

**🇮🇳 India:**
- **iCall Psychosocial Helpline**: 9152987821 (Mon-Sat, 8 AM - 10 PM IST)
- **KIRAN Mental Health Helpline**: 1800-599-0019 (24/7, Toll-free)

**International**: [findahelpline.com](https://findahelpline.com)

## License

MIT License - See [LICENSE](./LICENSE) for details

## Ethical Use

This platform is designed to:
- Provide peer support and community
- Share coping strategies and resources
- Reduce stigma around mental health

This platform is NOT:
- A replacement for therapy or medical treatment
- Qualified to diagnose or treat mental health conditions
- A crisis intervention service

---

## 💜 Built by Team ZenYukti

**[ZenYukti](https://zenyukti.in)** - Building innovative solutions for mental wellness and personal growth.

**Connect with us:**
- Website: [zenyukti.in](https://zenyukti.in)
- LinkedIn: [linkedin.com/company/zenyukti](https://linkedin.com/company/zenyukti)
- Twitter/X: [@zenyukti](https://x.com/zenyukti)
- Discord: [Join our community](https://go.zenyukti.in/discord)
- Instagram: [@zenyukti](https://instagram.com/zenyukti)

---

*Remember: Seeking professional help is a sign of strength, not weakness.* 💙
