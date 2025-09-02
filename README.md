# Cross Write - Multi-platform Writing & Publishing App

Cross Write is a modern, AI-assisted writing and publishing application that helps content creators write once and publish everywhere. Built with Next.js 15, TypeScript, and DaisyUI, it provides a seamless experience for managing content across multiple platforms.

## 🚀 Deployment Modes & Keys (ENV-ONLY)

Cross Write supports two deployment modes with environment-only API key management:

### HOSTED Mode

For hosted deployments (free & paid plans):

```bash
CROSSWRITE_DEPLOYMENT_MODE=HOSTED
OPENAI_API_KEY_APP=sk-hosted-...  # Cross Write's server app key
```

### SELF_HOST Mode

For self-hosted deployments:

```bash
CROSSWRITE_DEPLOYMENT_MODE=SELF_HOST
OPENAI_API_KEY=sk-selfhost-...    # Instance admin-provided key
```

**Key Features:**

- **No client-side secrets**: All API keys stay server-side
- **No in-app BYOK forms**: Keys are managed via environment variables only
- **Automatic key selection**: Server picks the appropriate key based on deployment mode
- **Client key rejection**: Any client-supplied keys are rejected with 400 error

**Why ENV-ONLY?**

- Enhanced security through server-side key management
- Simplified deployment and configuration
- No risk of key exposure in browser
- Consistent behavior across all deployment scenarios

## 🚀 Features

- **AI-Assisted Editor**: Get real-time writing suggestions and improvements
- **Multi-Platform Publishing**: Support for Dev.to and Hashnode
- **Smart Scheduling**: Schedule posts for optimal publishing times

- **Command Palette**: Quick access to all features with keyboard shortcuts
- **Responsive Design**: Works beautifully on desktop, tablet, and mobile

## 🛠 Tech Stack

- **Framework**: Next.js 15 (App Router, TypeScript, edge-safe)
- **Authentication**: Auth.js (NextAuth.js v5) with Drizzle adapter
- **Database**: Neon Postgres with Drizzle ORM
- **Styling**: Tailwind CSS v4 + DaisyUI (peachsorbet theme)
- **Icons**: lucide-react
- **State Management**: Zustand
- **Validation**: Zod
- **Notifications**: react-hot-toast
- **AI Integration**: OpenAI
- **Email**: Resend
- **Animations**: CSS transitions and micro-interactions

## 📦 Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd cross-write
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:
   Create a `.env.local` file with the following variables:

```bash
DATABASE_URL=your_neon_postgres_url
AUTH_SECRET=your_auth_secret
AUTH_TRUST_HOST=true
AUTH_GOOGLE_ID=your_google_oauth_id
AUTH_GOOGLE_SECRET=your_google_oauth_secret
RESEND_API_KEY=your_resend_api_key
EMAIL_FROM=noreply@yourdomain.com
AUTH_DEBUG=true

# Deployment Mode & API Keys (ENV-ONLY)
CROSSWRITE_DEPLOYMENT_MODE=HOSTED
OPENAI_API_KEY_APP=sk-hosted-...  # For HOSTED mode
# OPENAI_API_KEY=sk-selfhost-...  # For SELF_HOST mode
```

4. Set up the database:

```bash
npm run db:generate
npm run db:push
```

5. Run the development server:

```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## 🎨 Design System

The application uses the **DaisyUI "peachsorbet"** theme with a dark-first approach:

- **Primary Color**: Coral Pink (#f4978e)
- **Secondary Color**: Apricot (#fbc4ab)
- **Accent Color**: Melon (#f8ad9d)
- **Dark Surfaces**: Sophisticated dark backgrounds with subtle contrast

## 🔐 Authentication

The app uses Auth.js (NextAuth.js v5) with the following features:

- **OAuth Providers**: Google (conditionally loaded)
- **Magic Link Authentication**: Passwordless email sign-in
- **Database Sessions**: Persistent sessions stored in PostgreSQL
- **Protected Routes**: Automatic redirect to sign-in for unauthenticated users
- **User Management**: Extended user model with plan tiers (free/pro)

### Authentication Flow

1. **Sign In**: Users can sign in with Google OAuth or magic link email
2. **Magic Link**: Users enter their email and receive a secure sign-in link
3. **Session Management**: Sessions are stored in the database with automatic refresh
4. **Route Protection**: Middleware protects all routes except auth pages
5. **Sign Out**: Users can sign out and are redirected to sign-in page

### Protected Layout

The app includes a protected layout (`app/(protected)/layout.tsx`) that:

- Checks for valid session on every request
- Redirects to `/auth/sign-in` if not authenticated
- Displays user information and sign-out button
- Provides a clean, authenticated interface

## 📱 Pages & Features

### Dashboard (`/dashboard`)

- Quick stats cards (Drafts, Scheduled, Published)
- Recent activity feed
- Continue drafting section

### Editor (`/editor`)

- Split-pane layout with AI suggestions
- Rich text toolbar with formatting options
- Real-time word count and reading time
- Preview modal with device frame toggles

### Drafts (`/drafts`)

- Data table with search and filtering
- Bulk actions (delete, schedule)
- Status badges and platform indicators
- Empty states for new users

### Scheduler (`/scheduler`)

- Interactive calendar view
- Drag-to-reschedule functionality
- Best time recommendations
- Scheduling form with platform selection

### Integrations (`/integrations`)

- Platform connection cards
- API key management
- Publishing defaults configuration
- Connection status indicators

### Settings (`/settings`)

- Profile configuration
- Writing defaults
- Publishing preferences
- Notification settings
- Keyboard shortcuts reference

### Onboarding (`/onboarding`)

- 3-step wizard for new users
- Platform selection
- Writing preferences setup
- Progress indicators

## ⌨️ Keyboard Shortcuts

- `N` - New draft
- `⌘K` - Command palette
- `⌘D` - Go to drafts
- `⌘E` - Go to editor
- `⌘B` - Toggle sidebar
- `⌘I` - Go to integrations
- `⌘H` - Go to dashboard
- `1` - Go to dashboard
- `2` - Go to editor
- `3` - Go to drafts
- `G` - Go to drafts

## 🗂 Project Structure

```
app/
├── (protected)/          # Protected routes (require authentication)
│   ├── dashboard/        # Main dashboard
│   ├── editor/           # AI-assisted editor
│   ├── drafts/           # Drafts management
│   ├── scheduler/        # Content scheduling
│   ├── integrations/     # Platform connections
│   ├── settings/         # User preferences
│   ├── updates/          # News and updates
│   ├── onboarding/       # New user setup
│   └── layout.tsx        # Protected layout wrapper
├── auth/                 # Authentication pages
│   ├── sign-in/          # Sign-in page
│   └── error/            # Auth error page
├── api/                  # API routes
│   ├── auth/             # Auth API endpoints
│   └── cron/             # Background job endpoints
├── actions/              # Server actions
├── globals.css           # Global styles
├── layout.tsx            # Root layout
└── page.tsx              # Root page (redirects to dashboard)

components/
├── layout/               # App shell components
│   ├── AppSidebar.tsx    # Collapsible sidebar
│   ├── Topbar.tsx        # Top navigation bar
│   ├── CommandPalette.tsx # Command palette modal
│   ├── RootLayoutWrapper.tsx # Layout wrapper
│   └── ShortcutsProvider.tsx # Keyboard shortcuts provider
├── editor/               # Editor components
│   ├── EditorToolbar.tsx # Formatting toolbar
│   ├── MarkdownEditor.tsx # Text editor
│   ├── AiSuggestionsPanel.tsx # AI suggestions
│   ├── PreviewModal.tsx  # Content preview
│   └── ThumbnailGeneratorModal.tsx # Thumbnail generation
├── ui/                   # Reusable UI components
│   ├── StatCard.tsx      # Statistics cards
│   ├── EmptyState.tsx    # Empty state component
│   ├── PlanBadge.tsx     # Plan tier badge
│   ├── QuotaHint.tsx     # Usage quota hints
│   ├── NewsUpdates.tsx   # News updates widget
│   ├── SignOutButton.tsx # Sign out button
│   ├── DeploymentModeBadge.tsx # Deployment mode indicator
│   ├── CustomCheckbox.tsx # Custom checkbox component

├── providers/            # Context providers
│   ├── SessionProvider.tsx # Session provider
│   └── ToastProvider.tsx # Toast notifications

lib/
├── actions/              # Action utilities
├── ai/                   # AI integration

├── auth/                 # Authentication utilities
├── config/               # Configuration
├── integrations/         # Platform integrations
├── plan-service.ts       # Plan management
├── plans.ts              # Plan definitions
├── scheduler/            # Scheduling utilities
├── store.ts              # Zustand store
├── types/                # TypeScript types
├── utils/                # Utility functions
├── validators/           # Validation schemas
└── utils.ts              # General utilities

hooks/
├── use-plan.ts           # Plan management hook
└── use-shortcuts.ts      # Keyboard shortcuts

db/
├── client.ts             # Database client
├── migrations/           # Database migrations
├── schema/               # Database schema
└── drizzle.config.ts     # Drizzle configuration
```

## 🎯 Key Features

### AI-Assisted Writing

- Real-time writing suggestions
- Tone adjustment recommendations
- Content improvement tips
- Grammar and style suggestions

### Multi-Platform Publishing

- Support for Dev.to and Hashnode
- Automatic formatting for each platform
- Scheduled publishing with timezone support

### User Experience

- Responsive design for all devices
- Keyboard shortcuts for power users
- Command palette for quick navigation
- Smooth animations and transitions

## 🚀 Getting Started

1. **Start the development server**:

   ```bash
   npm run dev
   ```

2. **Navigate to the dashboard** at `http://localhost:3000`

3. **Explore the features**:
   - Create a new draft in the editor
   - Connect platforms in integrations
   - Schedule content in the scheduler
   - View your content and settings

4. **Try keyboard shortcuts**:
   - Press `⌘K` to open the command palette
   - Use `N` to create a new draft
   - Navigate with `⌘D` (drafts), `⌘E` (editor), `⌘I` (integrations)

## 🔧 Development

The application is built with modern React patterns:

- **Server Components**: Used where possible for better performance
- **Client Components**: Only for interactive features
- **TypeScript**: Full type safety throughout
- **DaisyUI**: Consistent component library
- **Tailwind CSS**: Utility-first styling

---

**Cross Write** - Write once, publish everywhere. 🚀
