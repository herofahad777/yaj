# Yuj - Professional Altruism & Emergency Mobilization Platform

A real-time platform that unifies doctors, engineers, lawyers, government servants, and volunteers to respond to emergencies and social welfare needs instantly.

## Tech Stack

- **Frontend**: React 18 + Vite
- **Styling**: Tailwind CSS v4 + shadcn/ui
- **Animations**: GSAP + ScrollTrigger
- **State Management**: Zustand + TanStack Query
- **Routing**: React Router DOM v6
- **Forms**: React Hook Form + Zod
- **Auth**: Supabase Auth (Google OAuth)
- **Database**: Supabase Postgres with RLS
- **Storage**: Supabase Storage
- **Realtime**: Supabase Realtime

## Quick Start

### Prerequisites

- Node.js 18+
- npm or pnpm
- Supabase account

### Setup

1. **Install dependencies**

```bash
npm install
```

2. **Set up Supabase**

Create a new project at [supabase.com](https://supabase.com) and run the schema:

```bash
# Copy the schema file
cp supabase/schema.sql.example supabase/schema.sql

# Run in Supabase SQL Editor
# (paste the contents of supabase/schema.sql)
```

3. **Configure environment variables**

```bash
cp .env.example .env
```

Edit `.env` with your Supabase credentials:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_RAZORPAY_KEY_ID=your-razorpay-key
```

4. **Start development server**

```bash
npm run dev
```

5. **Build for production**

```bash
npm run build
```

## Project Structure

```
src/
├── components/
│   ├── ui/              # Base components (Button, Card, etc.)
│   ├── common/          # Shared components (Navbar, Footer, ProblemCard)
│   └── features/        # Feature components (AddProblemModal)
├── features/            # Zustand stores (authStore, problemsStore)
├── pages/               # Page components (Dashboard, ProblemDetail, Onboarding)
├── lib/                 # Utilities (supabaseClient, utils, animations)
├── types/               # TypeScript types
└── App.tsx              # Main app with routing
```

## Features

### User Roles
- **Beneficiary**: Users in need of help
- **Professional Helper**: Doctors, Engineers, Lawyers, Teachers, Government Servants
- **Volunteer**: Community volunteers

### Problem Types
- **Public Problems**: Medical, education, personal crises
- **Disasters**: Natural disasters, emergencies with live community chat

### Core Functionality
- Google OAuth authentication
- Mandatory profile completion onboarding
- Multi-step "Start a Cause" flow
- Problem cards with progress tracking
- Yuj Verified badge system
- Real-time updates via Supabase
- Disaster live chat
- Donation system (Razorpay integration ready)

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run typecheck` | Type check with TypeScript |

## Environment Variables

| Variable | Description |
|----------|-------------|
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase anonymous key |
| `VITE_RAZORPAY_KEY_ID` | Razorpay key for payments |

## License

MIT
