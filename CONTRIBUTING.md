# Contributing to OpenMindWell

Thank you for your interest in contributing to OpenMindWell! 

## About This Project

OpenMindWell is a **self-hosted, open-source** mental health support platform built by Team ZenYukti.

**Important**: There is **no central hosted instance** of OpenMindWell. Each deployment is independent:
- Users deploy their own instances with their own infrastructure  
- Each instance uses its own Supabase database and HuggingFace API keys
- Users maintain full control over their data and deployment
- No shared public demo exists - this is intentional for privacy and security

### Ways to Contribute

- 🐛 **Bug Reports**: Open GitHub issues
- ✨ **Feature Requests**: Use issue templates
- 📝 **Documentation**: Improve this guide
- 💻 **Code**: Submit pull requests
- 🎨 **Design**: UI/UX improvements
- 🌍 **Localization**: Translate to other languages

### Development Workflow

1. **Fork** the repository
2. **Clone** your fork: `git clone https://github.com/yourusername/openmindwell.git`
3. **Create branch**: `git checkout -b feature/your-feature`
4. **Make changes** and test locally
5. **Commit**: `git commit -m "feat: add new feature"`
6. **Push**: `git push origin feature/your-feature`
7. **Open Pull Request** on GitHub

**Note:**
```bash
Please wait for maintainer confirmation or assignment before starting work on an issue. Pull requests opened without prior discussion or assignment may be closed if they do not align with the approved scope, technical approach, or current project priorities.
```

### Commit Message Convention

Use [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style (formatting, no logic change)
- `refactor:` - Code restructuring
- `test:` - Adding tests
- `chore:` - Maintenance tasks

Examples:
```
feat: add breathing exercise timer
fix: resolve WebSocket reconnection bug
docs: update deployment guide for Railway
```

### Prerequisites
- Node.js 18+
- Supabase account (free tier)
- HuggingFace account (free tier)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/YOUR_USERNAME/OpenMindWell.git
cd OpenMindWell
```

2. **Install dependencies**
```bash
npm install
cd backend && npm install && cd ..
cd frontend && npm install && cd ..
```

3. **Set up Supabase**
   - Create a free account at [supabase.com](https://supabase.com)
   - Create a new project
   - Go to SQL Editor and run `database/schema.sql`
   - Enable Anonymous authentication: Authentication → Providers → Anonymous (toggle ON)
   - Disable CAPTCHA for development: Authentication → Settings → Disable CAPTCHA

4. **Configure environment variables**

**Backend** (`backend/.env`):
```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_KEY=your_service_role_key
HUGGINGFACE_API_KEY=your_hf_token
FRONTEND_URL=http://localhost:3000
PORT=3001
```

**Frontend** (`frontend/.env`):
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_API_BASE_URL=http://localhost:3001
VITE_WS_URL=ws://localhost:3001
```

5. **Get API keys**
   - **Supabase**: Project Settings → API (URL, anon key, service_role key)
   - **HuggingFace**: [huggingface.co/settings/tokens](https://huggingface.co/settings/tokens) → New Token (Read access)

6. **Run the application**
```bash
# From root directory
npm run dev
```

- Frontend: http://localhost:3000
- Backend: http://localhost:3001

## Deployment

OpenMindWell is a **self-hosted application**. Each deployment requires:
- Your own Supabase account (free tier available)
- Your own HuggingFace API token (free tier available)
- Hosting platform of your choice

### Recommended Deployment Options:

**Option 1: Cloud Hosting (Recommended for production)**
- **Frontend**: [Vercel](https://vercel.com) (free tier)
  1. Import GitHub repository
  2. Add environment variables from `frontend/.env.example`
  3. Deploy automatically from main branch
  
- **Backend**: [Render](https://render.com) or [Railway](https://railway.app) (free tier)
  1. Connect GitHub repository
  2. Set build command: `cd backend && npm install && npm run build`
  3. Set start command: `cd backend && npm start`
  4. Add environment variables from `backend/.env.example`

**Option 2: Self-Hosted (Full control)**
- Deploy on your own VPS (DigitalOcean, AWS, etc.)
- Use Docker containers (Dockerfile included in backend)
- Run with PM2 or systemd for process management

**Option 3: Local Network**
- Run on local machine for personal use
- Great for testing and development

**Important Notes:**
- Each user maintains their own database and API keys
- No central hosted instance exists
- All infrastructure costs are borne by the deployer
- You control data privacy and security

See [Project_Guide.md](Project_Guide.md) for detailed deployment instructions.


---

**Connect with Team ZenYukti:**
- [zenyukti.in](https://zenyukti.in)
- [LinkedIn](https://linkedin.com/company/zenyukti)
- [Twitter/X](https://x.com/zenyukti)
- [Discord Community](https://go.zenyukti.in/discord)
- [Instagram](https://instagram.com/zenyukti)
