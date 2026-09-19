# BASHIRI FLUTTER MIGRATION AUDIT REPORT

**Generated:** September 18, 2026  
**Purpose:** Complete technical audit of existing Bashiri Next.js application for Flutter mobile app implementation  
**Objective:** Preserve Bashiri's product identity and business logic while creating a premium, modern, mobile-first Flutter experience

---

## EXECUTIVE SUMMARY

Bashiri is a comprehensive football/sports intelligence and prediction platform built with:
- **Frontend:** Next.js 16.2.10 + React 19.2.4 + TypeScript
- **Backend:** Django REST API
- **State Management:** Zustand (with persistence)
- **Database:** PostgreSQL
- **Cache:** Redis  
- **Payment:** M-Pesa integration
- **AI:** Google Gemini API for predictions
- **Real-time:** WebSocket support for match rooms
- **PWA:** Full Progressive Web App support with service worker

The application features:
- AI-powered football predictions with confidence tiers
- User-generated tips marketplace with verification system
- Real-time match rooms and watch parties
- Video reactions (Bashiri Mic)
- Gamification with streaks, badges, and XP
- Premium subscription tiers (weekly/monthly)
- Multi-language support (Swahili/English)
- Comprehensive match analytics and form guides
- Live odds integration
- Music player for matchday atmosphere

---

## 1. PROJECT STRUCTURE AUDIT

### Frontend Architecture

```
frontend/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Authentication route group
│   │   ├── layout.tsx           # Auth layout
│   │   ├── login/page.tsx        # Login/Register
│   │   └── forgot-password/page.tsx
│   ├── (main)/                   # Main application route group
│   │   ├── layout.tsx           # Main layout with bottom nav
│   │   ├── ai/page.tsx          # AI Chat interface
│   │   ├── ai-picks/page.tsx   # AI Picks analytics
│   │   ├── bashiri-pick-analytics/page.tsx
│   │   ├── contact/page.tsx
│   │   ├── create/page.tsx       # Match selection for predictions
│   │   ├── create/[matchId]/
│   │   │   ├── overview/page.tsx  # Match overview
│   │   │   ├── predict/page.tsx   # Prediction creation
│   │   │   └── ...
│   │   ├── debates/page.tsx
│   │   ├── derby/page.tsx
│   │   ├── evening-recap/page.tsx
│   │   ├── gamification/page.tsx
│   │   ├── high-confidence/page.tsx
│   │   ├── history/page.tsx
│   │   ├── home/page.tsx         # Main feed/home
│   │   ├── league/[leagueCode]/page.tsx
│   │   ├── live-odds/page.tsx
│   │   ├── match/[matchId]/
│   │   │   ├── mic/page.tsx      # Video reactions
│   │   │   ├── room/page.tsx     # Real-time chat room
│   │   │   ├── overview/page.tsx
│   │   └── track-record/page.tsx
│   │   ├── matches/page.tsx      # Match listings
│   │   ├── mic/page.tsx          # Main mic interface
│   │   ├── music/page.tsx
│   │   ├── notifications/page.tsx
│   │   ├── profile/page.tsx      # User profile
│   │   ├── profile/payment-history/page.tsx
│   │   ├── profile/[username]/page.tsx
│   │   ├── public-saved-markets/page.tsx
│   │   ├── pulse/page.tsx        # Live intelligence hub
│   │   ├── review/page.tsx
│   │   ├── saved-markets/page.tsx
│   │   ├── settings/
│   │   │   ├── language/page.tsx
│   │   ├── leagues/page.tsx
│   │   ├── notifications/page.tsx
│   │   ├── page.tsx
│   │   ├── support/
│   │   │   ├── new/page.tsx
│   │   ├── page.tsx
│   │   └── [id]/page.tsx
│   │   ├── teams/page.tsx
│   │   ├── subscribe/page.tsx   # Payment flow
│   │   ├── team/[teamId]/page.tsx
│   │   ├── tips/
│   │   │   ├── create/[matchId]/page.tsx
│   │   │   ├── leaderboard/page.tsx
│   │   ├── page.tsx
│   │   ├── tip-stars/page.tsx
│   │   └── [id]/page.tsx
│   │   ├── track-record/page.tsx
│   │   └── weekly-summary/page.tsx
│   ├── (admin)/                  # Admin dashboard route group
│   │   ├── layout.tsx
│   │   ├── login/page.tsx
│   │   ├── dashboard/page.tsx
│   │   ├── debates/page.tsx
│   │   ├── derbies/page.tsx
│   │   ├── hero-images/page.tsx
│   │   ├── hero-slides/page.tsx
│   │   ├── matches/page.tsx
│   │   ├── ml-status/page.tsx
│   │   ├── moderation/page.tsx
│   │   ├── notifications/page.tsx
│   │   ├── reviews/page.tsx
│   │   ├── support/page.tsx
│   │   ├── support/[id]/page.tsx
│   │   ├── transactions/page.tsx
│   │   ├── users/page.tsx
│   │   ├── users/[id]/page.tsx
│   │   └── visitors/page.tsx
│   ├── landing/page.tsx          # Marketing landing page
│   ├── layout.tsx               # Root layout
│   ├── layout_main.tsx          # Alternative layout
│   ├── onboarding/page.tsx      # User onboarding flow
│   ├── page.tsx                 # Root page (splash/landing routing)
│   ├── globals.css              # Global styles
│   └── sw.js/route.ts           # Service worker route
├── components/                  # React components
│   ├── admin/                   # Admin components
│   ├── ai/                      # AI Chat components
│   ├── analytics/               # Analytics components
│   ├── auth/                    # Authentication components
│   ├── contact/                 # Contact components
│   ├── derby/                  # Derby components
│   ├── feed/                    # Feed components
│   │   └── cards/              # Feed card types
│   ├── home/                   # Home components
│   ├── match-hub/              # Match-related components
│   ├── mic/                    # Video reaction components
│   ├── music/                  # Music player components
│   ├── navigation/             # Navigation components
│   ├── onboarding/             # Onboarding components
│   ├── predictions/            # Prediction components
│   ├── profile/                # Profile components
│   ├── providers/              # React providers
│   ├── pulse/                  # Pulse/Real-time components
│   ├── pwa/                    # PWA components
│   ├── report/                 # Report components
│   ├── review/                 # Review components
│   ├── splash/                 # Splash screen components
│   ├── tips/                   # Tips marketplace components
│   └── ui/                     # Reusable UI components
├── hooks/                       # Custom React hooks
│   ├── useCountUp.ts
│   ├── useMatchHubBadges.ts
│   ├── useMatchRoomSocket.ts    # WebSocket for match rooms
│   ├── useMobileTooltip.ts
│   ├── useOdds.ts
│   ├── usePushNotifications.ts
│   ├── useRequireAuth.ts       # Auth guard hook
│   ├── useSplashInitialization.ts
│   ├── useTips.ts              # Tips data hooks
│   ├── useTipsRealtime.ts      # Real-time tips updates
│   └── useWebSocket.ts         # Generic WebSocket hook
├── lib/                         # Utilities and API clients
│   ├── api/                    # API client functions
│   │   ├── admin.ts
│   │   ├── auth.ts            # Authentication API
│   │   ├── chat.ts            # AI Chat API
│   │   ├── client.ts          # Base API client with JWT handling
│   │   ├── command-search.ts   # Intelligent search
│   │   ├── derby.ts
│   │   ├── feed.ts            # Feed API
│   │   ├── gamification.ts     # Gamification API
│   │   ├── hero-carousel.ts
│   │   ├── match-hub.ts
│   │   ├── matchroom.ts       # Match room API
│   │   ├── mic.ts             # Video reactions API
│   ├── music.ts            # Music API
│   │   ├── notifications.ts   # Notifications API
│   │   ├── payments.ts        # M-Pesa payments API
│   │   ├── predictions.ts     # Predictions/matches API
│   │   ├── pulse.ts           # Real-time pulse API
│   │   ├── report.ts          # Report API
│   │   ├── reviews.ts         # Reviews API
│   │   ├── settings.ts        # User settings API
│   │   ├── support.ts         # Support tickets API
│   │   └── tips.ts            # Tips marketplace API
│   ├── auth/                   # Authentication utilities
│   │   └── onboarding.ts
│   ├── cloudinary-upload.ts    # Cloudinary upload utilities
│   ├── cloudinary.ts
│   ├── confidence-tiers.ts
│   ├── constants/
│   │   └── splashConfig.ts    # Splash screen configuration
│   ├── device-utils.ts
│   ├── firebase.ts             # Firebase integration
│   ├── pwa-install-utils.ts
│   ├── return-to.ts            # Return-to navigation utility
│   ├── toast-utils.ts
│   ├── types/
│   │   └── tips.ts            # Tips type definitions
│   └── utils.ts                # General utilities
├── stores/                      # Zustand state management
│   ├── admin-auth.store.ts
│   ├── auth.store.ts           # Main authentication state
│   ├── authGate.store.ts       # Auth gate modal state
│   ├── commandPalette.store.ts
│   ├── pwaInstall.store.ts
│   └── tips.store.ts          # Tips marketplace state
├── styles/                      # Additional styles
└── public/                      # Static assets
    ├── manifest.json           # PWA manifest
    ├── bashiri-logo-horizontal.svg
    ├── bashiri-mark-gold.svg
    ├── Various app icons
    └── splash-background.mp4   # Splash screen video
```

### Backend Structure (Overview)

```
backend/
├── accounts/          # User authentication and profiles
├── chat/              # AI Chat integration
├── config/            # Django configuration
├── core/              # Core Django settings
├── dashboard/         # Admin dashboard
├── feed/              # Feed system
├── gamification/       # Gamification (XP, achievements, referrals)
├── herocarousel/      # Hero carousel content
├── matchroom/         # Real-time match rooms
├── mic/               # Video reactions
├── music/             # Music player
├── notifications/     # Push notifications
├── payments/          # M-Pesa payments
├── predictions/       # Match predictions and AI
├── pulse/             # Real-time pulse
├── reviews/           # User reviews
└── support/           # Support tickets
```

---

## 2. COMPLETE SCREEN INVENTORY

### Authentication Screens

| Screen | Route | Purpose | Access | Entry Points | Exit Points |
|--------|-------|---------|--------|--------------|-------------|
| **Landing Page** | `/` | Marketing landing for first-time visitors | Guest | Direct URL, root route | Login, Register, Home |
| **Splash Screen** | `/` (PWA) | App initialization and branding | PWA users | App launch | Home |
| **Login/Register** | `/login` | User authentication | Guest | Bottom nav, protected routes, direct link | Home, Onboarding, Return-to path |
| **Forgot Password** | `/forgot-password` | Password reset | Guest | Login page | Login |

### Main Application Screens

| Screen | Route | Purpose | Access | Entry Points | Exit Points |
|--------|-------|---------|--------|--------------|-------------|
| **Onboarding** | `/onboarding` | First-time user setup | Authenticated users with `onboarding_status: "not_started"` | Auto-redirect after registration | Home |
| **Home** | `/home` | Main feed with mixed content | All users | Bottom nav, auto-redirect after splash | Match details, AI, Profile, Settings |
| **Matches** | `/matches` | Match listings with tabs | All users | Bottom nav | Match details, Create prediction |
| **AI Chat** | `/ai` | AI-powered football assistant | All users | Bottom nav, Home | Home, Match details |
| **AI Picks** | `/ai-picks` | AI performance analytics | All users | Home, Profile | Home |
| **Bashiri Pick Analytics** | `/bashiri-pick-analytics` | Detailed AI pick performance | All users | Home, Profile | Home |
| **Create Prediction** | `/create` | Match selection for predictions | All users | Bottom nav (center button) | Match overview, Predict |
| **Match Overview** | `/create/[matchId]/overview` | Detailed match analysis | All users | Create page, Match details | Predict, Back |
| **Match Predict** | `/create/[matchId]/predict` | Create prediction for match | All users | Match overview | Save, Back |
| **Match Room** | `/match/[matchId]/room` | Real-time chat room | All users | Match overview | Back, Match details |
| **Match Mic** | `/match/[matchId]/mic` | Video reactions | All users | Match details | Back, Record |
| **Match Track Record** | `/match/[matchId]/track-record` | Historical match data | All users | Match details | Back |
| **Tips Marketplace** | `/tips` | User-generated tips | All users | Bottom nav | Tip details, Create tip, Leaderboard |
| **Tip Details** | `/tips/[id]` | Individual tip view | All users | Tips page | Comments, Vote, Share |
| **Tip Creation** | `/tips/create/[matchId]` | Create user tip | Authenticated | Match details, Tips page | Save, Back |
| **Tip Leaderboard** | `/tips/leaderboard` | Tipster rankings | All users | Tips page | Back |
| **Tip Stars** | `/tips/tip-stars` | Featured tipsters | All users | Tips page | Back |
| **Pulse** | `/pulse` | Real-time intelligence hub | All users | Bottom nav, Home | Match details, Music, Rooms |
| **Profile** | `/profile` | User profile | Authenticated | Bottom nav, Avatar click | Settings, History, Payment history |
| **Public Profile** | `/profile/[username]` | Other user profiles | All users | Tips, Match room | Follow, Back |
| **Settings** | `/settings` | App settings | Authenticated | Profile | Sub-settings, Back |
| **Settings/Teams** | `/settings/teams` | Favorite teams | Authenticated | Settings | Back |
| **Settings/Leagues** | `/settings/leagues` | Favorite leagues | Authenticated | Settings | Back |
| **Settings/Notifications** | `/settings/notifications` | Notification preferences | Authenticated | Settings | Back |
| **Settings/Language** | `/settings/language` | Language selection | Authenticated | Settings | Back |
| **Settings/Support** | `/settings/support` | Support tickets | Authenticated | Settings | New ticket, Ticket details |
| **Subscribe** | `/subscribe` | Subscription payment | Authenticated | Premium prompts, Profile | Profile, Back |
| **Music** | `/music` | Music player | All users | Pulse, Profile | Back |
| **Notifications** | `/notifications` | Notification center | Authenticated | Bottom nav (bell icon) | Notification source, Back |
| **History** | `/history` | User history | Authenticated | Profile | Back |
| **Saved Markets** | `/saved-markets` | Saved prediction markets | Authenticated | Profile | Back |
| **Public Saved Markets** | `/public-saved-markets` | Community saved markets | All users | Profile, Tips | Back |
| **Live Odds** | `/live-odds` | Real-time betting odds | All users | Home, Match details | Back |
| **High Confidence** | `/high-confidence` | High-confidence predictions | All users | Home | Back |
| **Debates** | `/debates` | Community debates | All users | Home, Pulse | Back |
| **Derby** | `/derby` | Featured match derbies | All users | Home, Pulse | Back |
| **Evening Recap** | `/evening-recap` | Daily match recap | All users | Home | Back |
| **Gamification** | `/gamification` | Gamification hub | All users | Profile | Back |
| **Weekly Summary** | `/weekly-summary` | Weekly performance summary | All users | Profile | Back |
| **Contact** | `/contact` | Contact page | All users | Settings | Back |
| **Review** | `/review` | App review | All users | Floating button | Back |

### Admin Screens

| Screen | Route | Purpose | Access | Entry Points | Exit Points |
|--------|-------|---------|--------|--------------|-------------|
| **Admin Login** | `/admin/login` | Admin authentication | Admin users | Settings (admin only) | Admin dashboard |
| **Admin Dashboard** | `/admin/dashboard` | Main admin dashboard | Admin users | Admin login | Sub-admin pages |
| **Admin Users** | `/admin/users` | User management | Admin users | Admin dashboard | User details |
| **Admin User Details** | `/admin/users/[id]` | Individual user management | Admin users | Admin users | Back |
| **Admin Matches** | `/admin/matches` | Match management | Admin users | Admin dashboard | Back |
| **Admin Debates** | `/admin/debates` | Debate management | Admin users | Admin dashboard | Back |
| admin Derbies | `/admin/derbies` | Derby management | Admin users | Admin dashboard | Back |
| **Admin Hero Images** | `/admin/hero-images` | Hero image management | Admin users | Admin dashboard | Back |
| **Admin Hero Slides** | `/admin/hero-slides` | Hero slide management | Admin users | Admin dashboard | Back |
| **Admin ML Status** | `/admin/ml-status` | ML model status | Admin users | Admin dashboard | Back |
| **Admin Moderation** | `/admin/moderation` | Content moderation | Admin users | Admin dashboard | Back |
| **Admin Notifications** | `/admin/notifications` | Notification management | Admin users | Admin dashboard | Back |
| **Admin Reviews** | `/admin/reviews` | Review management | Admin users | Admin dashboard | Back |
| **Admin Support** | `/admin/support` | Support ticket management | Admin users | Admin dashboard | Ticket details |
| **Admin Support Details** | `/admin/support/[id]` | Support ticket details | Admin users | Admin support | Back |
| **Admin Transactions** | `/admin/transactions` | Transaction management | Admin users | Admin dashboard | Back |
| **Admin Visitors** | `/admin/visitors` | Visitor analytics | Admin users | Admin dashboard | Back |

---

## 3. SPLASH SCREEN AUDIT

### Splash Screen Implementation

**Component:** `components/splash/BashiriSplash.tsx`

**Trigger Conditions:**
- PWA mode detected (`window.matchMedia("(display-mode: standalone)").matches`)
- Session key not set (`bashiri_splash_shown` in sessionStorage)

**Duration:** 15 seconds (configurable via `SPLASH_CONFIG.displayDuration`)

**Components:**
1. **Video Background:** `/splash-background.mp4` (looping, muted, playsInline)
2. **Hero Card:** `components/splash/HeroCard.tsx` - Animated hero section
3. **Performance Stats:** `components/splash/PerformanceStats.tsx` - Animated statistics
4. **League Accuracy:** `components/splash/LeagueAccuracy.tsx` - League accuracy display
5. **Loading Progress:** `components/splash/LoadingProgress.tsx` - Progress bar with messages
6. **Splash Footer:** `components/splash/SplashFooter.tsx` - Footer with trust indicators

**Initialization Hook:** `hooks/useSplashInitialization.ts`
- Simulates 4-step initialization process
- Progress: 0-30% (loading assets), 30-60% (session init), 60-90% (critical data), 90-100% (ready)
- Loading messages rotate through: "Loading the best predictions for you...", "Analyzing team performance...", "Preparing your football insights..."
- 15-second timeout for initialization
- Error state with retry functionality

**Configuration:** `lib/constants/splashConfig.ts`
```typescript
- displayDuration: 15000ms
- exitDuration: 400ms
- initializationTimeout: 15000ms
- backgroundColor: "#000000"
- primaryGold: "#D4AF37"
- appName: "BASHIRI"
- tagline: "AI-Powered Football Predictions"
- accuracyPercentage: 85 (marketing value)
- rating: "4.8/5" (marketing value)
```

**Navigation Flow:**
1. App launch → Check PWA mode
2. If PWA → Show splash screen
3. If browser → Check landing page seen
4. If landing not seen → Show landing page
5. If landing seen → Redirect to home
6. After splash completion → Set session key → Redirect to home

**Flutter Implementation Note:**
- Flutter should have native splash screen (not web-based)
- Replicate the video background or use native animations
- Maintain the same initialization sequence simulation
- Display same marketing statistics (EPL 87%, La Liga 85%, Serie A 82%)

---

## 4. NAVIGATION AUDIT

### Navigation Structure

**Bottom Navigation** (`components/navigation/BottomNav.tsx`)

**Main Tabs:**
1. **Home** (`/home`) - Main feed
2. **Matches** (`/matches`) - Match listings
3. **Analytics** (`/bashiri-pick-analytics`) - AI performance analytics
4. **Tips** (`/tips`) - Tips marketplace
5. **Create** (center button) - Create prediction

**Navigation Behavior:**
- Auto-hides on scroll down, shows on scroll up
- Hides on AI page (`/ai`) and Mic full mode
- Glass morphism background with blur
- Center "Create" button with gradient gold styling
- Active state with gold accent color
- Vibration feedback on tap (12ms)

**Route Groups:**
- `(auth)` - Authentication routes (no bottom nav)
- `(main)` - Main application (with bottom nav)
- `(admin)` - Admin dashboard (separate navigation)

**Navigation Flow Map:**

```
App Launch
├── Landing Page (first-time browser users)
│   ├── Login → Onboarding → Home
│   └── Register → Onboarding → Home
├── Splash Screen (PWA users)
│   └── Home
└── Home (returning users)
    ├── Bottom Nav →
    │   ├── Home → Feed container
    │   ├── Matches → Match listings
    │   ├── Analytics → AI performance
    │   ├── Tips → Tips marketplace
    │   └── Create (center) → Match selection
    ├── Header Actions →
    │   ├── Notifications → Notification center
    │   ├── AI button → AI Chat
    │   ├── Pulse button → Pulse hub
    │   └── Profile → User profile
    └── Auth Gates →
        ├── Login/Register bottom sheet
        └── Subscription prompts
```

**Conditional Navigation:**
- Bottom nav hidden on `/ai` page (full-screen AI chat)
- Bottom nav hidden on Mic full mode (`/mic?mode=full`)
- Auth required sheet appears for protected actions
- Return-to navigation preserves intended destination

**Deep Links:**
- PWA shortcuts for: Prediction, Mic, Admin Panel
- URL params for: Tab selection, Date filters, League filters, Plan selection

---

## 5. UI/UX DESIGN SYSTEM AUDIT

### Color Palette

**Brand Colors:**
```css
--brand-primary: #D4AF37 (Gold identity - Logo, CTA, VIP)
--brand-accent: #CFAF7B (AI features - Confidence, Highlights)
```

**Foundation Colors:**
```css
--background: #0A0A0A (Main background - AMOLED Black)
--surface: #111218 (Cards, panels, elevated surfaces)
--border: #2A2A2F (Borders and dividers)
```

**Text Colors:**
```css
--text-primary: #F8FAFC (Primary text - headings, important content)
--text-secondary: #A1A1AA (Secondary text - descriptions, labels)
```

**Semantic Colors:**
```css
--success: #22C55E (Success states)
--danger: #EF4444 (Danger states)
--warning: #F59E0B (Warning states)
--info: #3B82F6 (Info states)
```

**Legacy Tokens (for migration):**
```css
--color-gold: #F5A623
--color-gold-light: #FFD54A
--color-gold-dark: #D4891A
--color-blue: #3B82F6
--color-blue-light: #60A5FA
--color-green: #10B981
--color-green-light: #34D399
--color-purple: #8B5CF6
--color-red: #FF2D2D
```

### Typography

**Font Families:**
- **Primary:** Inter, "Segoe UI", sans-serif (body text)
- **Display:** Space Grotesk, "Inter", sans-serif (headings, stats, percentages)

**Font Hierarchy:**
- Display: `clamp(42px,5vw,96px)` for hero headings
- H1: 2xl-3xl font-black tracking-tight
- H2: xl-2xl font-bold
- H3: lg font-bold
- Body: sm base leading-7
- Small: xs text-xs

**Font Weights:**
- Display: `font-black` (900)
- Headings: `font-bold` (700)
- Body: `font-medium` (500)
- Labels: `font-semibold` (600)

### Spacing System

**Border Radius:**
```css
--radius-sm: 8px
--radius-md: 12px
--radius-lg: 16px
--radius-xl: 20px
--radius-2xl: 24px
--radius-3xl: 32px
--radius-full: 9999px
```

**Safe Area Handling:**
```css
--safe-area-inset-top: env(safe-area-inset-top, 0px)
--safe-area-inset-right: env(safe-area-inset-right, 0px)
--safe-area-inset-bottom: env(safe-area-inset-bottom, 0px)
--safe-area-inset-left: env(safe-area-inset-left, 0px)
```

### Effects

**Glassmorphism:**
```css
--glass-bg: rgba(255, 255, 255, 0.03)
--glass-bg-hover: rgba(255, 255, 255, 0.06)
--glass-border: rgba(255, 255, 255, 0.1)
--glass-blur: blur(20px)
```

**Shadows:**
```css
--shadow-sm: 0 2px 4px rgba(0, 0, 0, 0.3)
--shadow-md: 0 4px 12px rgba(0, 0, 0, 0.4)
--shadow-lg: 0 8px 24px rgba(0, 0, 0, 0.5)
--shadow-xl: 0 12px 32px rgba(0, 0, 0, 0.6)
--shadow-gold: 0 0 20px rgba(245, 166, 35, 0.35)
--shadow-gold-lg: 0 0 40px rgba(245, 166, 35, 0.45)
```

**Gradients:**
```css
--gradient-gold: linear-gradient(135deg, #F5A623, #E8892A)
--gradient-card: linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.5) 40%, transparent 70%)
--gradient-hero: linear-gradient(to bottom, rgba(0,0,0,0.75) 0%, transparent 40%)
```

### Special Effects

**Electric Green:** `#00FF87` - Used for live indicators, success states, AI highlights

**Gold Glow:** Used for premium features, CTAs, and branding elements

**Animation Duration Standards:**
- Base: 0.6s
- Stagger: 0.1s
- Page transitions: 0.3-0.5s
- Loading animations: 1-2s
- Pulse animations: 1.4s (live dot)

### Component Styling Patterns

**Glass Card:**
- Border: `1px solid rgba(255, 255, 255, 0.15)`
- Background: `linear-gradient(to bottom right, rgba(255,255,255,0.03), rgba(255,255,255,0.01))`
- Backdrop blur: `md`
- Border radius: `3xl` (24px)
- Hover: Scale 1.02, border white/20

**Premium Button:**
- Gradient: `linear-gradient(135deg, var(--brand-primary), var(--brand-accent))`
- Text: Black for gold buttons
- Shadow: `0 8px 24px rgba(212,175,55,0.3)`
- Hover: Scale 1.02, shadow increase
- Loading: Spinner with text "Inatuma..."

**Input Fields:**
- Background: `rgba(15, 15, 20, 0.8)`
- Border: `1px solid rgba(255,255,255,0.12)`
- Focus border: `rgba(212, 175, 55, 0.5)`
- Text: White
- Backdrop blur: `blur(20px)`

---

## 6. COMPONENT AUDIT

### Reusable Components

**Core UI Components:**

| Component | Purpose | Props | Usage |
|-----------|---------|-------|------|
| **GlassCard** | Glass morphism card | `children, className, hover, glow, texture` | Main card component for all content areas |
| **PremiumCard** | Themed card | `children, className, variant, hover, texture` | Specialized cards with gold/sand/gradient variants |
| **PremiumButton** | Primary action button | `variant, size, loading, fullWidth, className` | Main CTA button across app |
| **BashiriButton** | Alias for PremiumButton | Same as PremiumButton | Backward compatibility |
| **Input** | Text input field | `label, type, value, onChange, showPasswordToggle` | Form inputs |
| **PhoneInput** | Phone number input | `label, value, onChange` | Tanzania phone format (+255) |
| **DateInput** | Date picker | `label, value, onChange` | Date selection |
| **BottomSheet** | Bottom sheet modal | `isOpen, onClose, children` | Modal from bottom |
| **AlertModal** | Alert dialog | `isOpen, onClose, title, message, variant` | Alert dialogs |
| **ConfirmModal** | Confirmation dialog | `isOpen, onClose, onConfirm, title, message` | Confirmations |
| **Skeleton** | Loading skeleton | None | Loading placeholders |
| **Spinner** | Loading spinner | None | Loading indicators |
| **ProgressBar** | Progress bar | `value, max` | Progress indicators |
| **PullToRefresh** | Pull-to-refresh | `onRefresh, children` | List refresh on mobile |

**Navigation Components:**

| Component | Purpose | Props | Usage |
|-----------|---------|-------|------|
| **BottomNav** | Main navigation | None | Bottom tab navigation |
| **CommandPalette** | Command palette search | None | Quick search navigation |

**Feed Components:**

| Component | Purpose | Props | Usage |
|-----------|---------|-------|------|
| **FeedContainer** | Main feed wrapper | `externalRefreshKey` | Home page feed |
| **AIPickCard** | AI prediction card | `data` | Feed item |
| **LiveMatchCard** | Live match card | `data` | Feed item |
| **ResultRecapCard** | Match result card | `matchId, data` | Feed item |
| **StatCard** | Statistics card | `data` | Feed item |
| **PollCard** | Poll card | `cardId, data` | Feed item |
| **MilestoneCard** | Achievement card | `data` | Feed item |
| **AIWeeklyReportCard** | AI weekly report | `data` | Feed item |
| **DidYouKnowCard** | Educational card | `data` | Feed item |
| **DebateCard** | Debate card | `cardId, data` | Feed item |
| **MicWinnerCard** | Mic winner card | `cardId, data` | Feed item |
| **BestStreakCard** | Best streak card | `data` | Feed item |

**AI Components:**

| Component | Purpose | Props | Usage |
|-----------|---------|-------|------|
| **AIChatPage** | Main AI chat interface | None | `/ai` page |
| **AIComposer** | AI input composer | `value, onChange, onSend, isLoading, disabled` | AI message input |
| **AIHeader** | AI chat header | `remaining` | Shows daily message limit |
| **MessageList** | Message list | `messages, isLoading, onHelpful, onNotHelpful` | Chat messages |
| **EmptyState** | AI empty state | `onSuggestionClick` | Initial AI state |
| **ContextChips** | Context suggestion chips | None | Match context suggestions |

**Prediction Components:**

| Component | Purpose | Props | Usage |
|-----------|---------|-------|------|
| **MatchOddsCard** | Match odds display | `matchId, homeTeam, awayTeam, compact` | Match odds display |
| **PremiumMarketCard** | Premium market card | `market, confidence, aiPick, isLocked, isFree` | Premium markets |
| **PredictionTutorial** | Prediction education | `onClose` | Educational overlay |
| **ConfidenceBadge** | Confidence indicator | `confidence` | Confidence display |
| **MarketIcons** | Market icons | `marketKey` | Market icon display |
| **PremiumProgressBar** | Premium progress bar | `progress` | Subscription progress |

**Profile Components:**

| Component | Purpose | Props | Usage |
|-----------|---------|-------|------|
| **AccuracySphere** | Accuracy visualization | `accuracy` | Profile accuracy display |
| **AIWeeklyReport** | AI weekly performance | `data` | Profile analytics |
| **MarketMasteryHeatmap** | Market mastery heatmap | `data` | Profile skills |
| **PredictionDNA** | Prediction DNA visualization | `data` | Profile prediction style |
| **ShareProfileModal** | Profile sharing modal | `isOpen, onClose` | Share profile functionality |
| **QRCodeModal** | QR code modal | `isOpen, onClose` | QR code display |

**Tips Components:**

| Component | Purpose | Props | Usage |
|-----------|---------|-------|------|
| **TipCard** | Tip display card | `tip, onClick` | Tips marketplace |
| **TipForm** | Tip creation form | `matchId, onSubmit` | Create tip form |
| **TipFilter** | Tips filter | None | Filter tips |
| **TipComments** | Tip comments | `tipId` | Tip comments section |
| **TipStarsList** | Tip stars display | `data` | Featured tipsters |
| **TipstersLeaderboard** | Tipster rankings | None | Leaderboard display |
| **VerifiedBadges** | Verification badges | `verifiedTipster` | Show verification status |

**Splash Components:**

| Component | Purpose | Props | Usage |
|-----------|---------|-------|------|
| **BashiriSplash** | Main splash screen | None | PWA splash |
| **HeroCard** | Hero section | None | Splash hero |
| **PerformanceStats** | Performance statistics | None | Splash stats |
| **LeagueAccuracy** | League accuracy display | None | Splash accuracy |
| **LoadingProgress** | Loading progress bar | `progress, loadingMessage, error, onRetry` | Splash progress |
| **SplashFooter** | Splash footer | None | Splash footer |

**Match Components:**

| Component | Purpose | Props | Usage |
|-----------|---------|-------|------|
| **MatchHubTabs** | Match hub tabs | `matchId, active, isFinished` | Match page navigation |
| **DerbyThemeProvider** | Derby theme provider | `matchId` | Derby theming |

**Real-time Components:**

| Component | Purpose | Props | Usage |
|-----------|---------|-------|------|
| **LivePulseBar** | Live pulse indicator | `stats` | Pulse page |
| **BentoGrid** | Bento grid layout | `data, mode` | Pulse page sections |

---

## 7. STATE AUDIT

### Global Application States

**Authentication States:**
- **Guest:** No authentication token
- **Authenticated:** Has valid access token
- **Hydrated:** Zustand store has loaded from localStorage
- **Loading:** User data being fetched
- **Unsubscribed:** No active subscription
- **Subscribed:** Active premium subscription

**Onboarding States:**
- **not_started:** User needs onboarding
- **completed:** User completed onboarding
- **skipped:** User skipped onboarding

**Match States:**
- **SCHEDULED:** Match not started
- **LIVE:** Match in progress
- **FINISHED:** Match completed
- **POSTPONED:** Match postponed
- **CANCELLED:** Match cancelled

**Prediction States:**
- **PENDING:** Prediction awaiting result
- **WON:** Prediction correct
- **LOST:** Prediction incorrect
- **PUSH:** Push result
- **VOID:** Void result
- **CANCELLED:** Cancelled

**AI Pick States:**
- **STRONG:** Strong confidence pick
- **ELITE:** Elite confidence pick
- **NO_STRONG_PICK:** No strong pick available
- **PENDING:** Prediction awaiting result
- **LIVE:** Match currently live

**Tip States:**
- **PENDING:** Tip awaiting result
- **CORRECT:** Tip was correct
- **INCORRECT:** Tip was incorrect
- **VOID:** Tip voided

**Room States:**
- **upcoming:** Room not yet active
- **watch_party:** Watch party mode
- **live:** Live room
- **closed:** Room closed

**UI States:**
- **Loading:** Data loading
- **Loaded:** Data loaded successfully
- **Empty:** No data available
- **Error:** Error occurred
- **Offline:** No internet connection
- **Refreshing:** Data being refreshed
- **Searching:** Search in progress
- **Submitting:** Form submission in progress
- **Success:** Action completed successfully
- **Failed:** Action failed

**Feed States:**
- **Loading:** Feed loading
- **Loaded:** Feed loaded
- **HasMore:** More items available
- **LoadingMore:** Loading more items
- **Error:** Feed error
- **Refreshing:** Smart refresh in progress

---

## 8. API / DJANGO AUDIT

### Authentication Endpoints

| Endpoint | Method | Auth | Purpose | Request | Response |
|----------|--------|------|---------|--------|----------|
| `/auth/register/` | POST | No | User registration | `{phone_number, password, confirm_password, username, date_of_birth}` | `{access, refresh, user}` |
| `/auth/login/` | POST | No | User login | `{phone_number, password}` | `{access, refresh, user}` |
| `/auth/logout/` | POST | Yes | User logout | `{refresh}` | `{detail}` |
| `/auth/me/` | GET | Yes | Get current user | - | `BashiriUser` |
| `/auth/complete-profile/` | POST | Yes | Complete profile | `{username, date_of_birth}` | `BashiriUser` |
| `/auth/request-password-reset/` | POST | No | Request password reset | `{phone_number, message}` | `{detail}` |
| `/auth/onboarding/` | POST | Yes | Save onboarding preferences | `{action, favorite_leagues, favorite_teams, tip_preferences}` | `BashiriUser` |
| `/auth/settings/` | GET | Yes | Get user settings | - | `{favorite_leagues, notifications_enabled}` |
| `/auth/settings/` | PATCH | Yes | Update settings | `{favorite_leagues}` | `BashiriUser` |
| `/auth/update-avatar/` | POST | Yes | Update avatar | FormData (avatar) | `BashiriUser` |
| `/auth/profile/{username}/` | GET | No | Get public profile | - | `{user, mic_reactions, mic_count, is_following}` |
| `/auth/delete-account/` | DELETE | Yes | Delete account | - | `{detail}` |
| `/auth/follow/{username}/` | POST | Yes | Follow user | - | `{detail, following_count, followers_count}` |
| `/auth/unfollow/{username}/` | POST | Yes | Unfollow user | - | `{detail, following_count, followers_count}` |
| `/auth/following/` | GET | Yes | Get following list | - | `{count, results}` |
| `/auth/followers/` | GET | Yes | Get followers list | - | `{count, results}` |
| `/auth/check-follow/{username}/` | GET | Yes | Check follow status | - | `{is_following}` |
| `/auth/favorite-teams/` | GET | Yes | Get favorite teams | - | `{team_ids}` |
| `/auth/favorite-teams/` | PUT | Yes | Set favorite teams | `{team_ids}` | `{team_ids}` |
| `/auth/favorite-leagues/` | GET | Yes | Get favorite leagues | - | `{league_ids}` |
| `/auth/favorite-leagues/` | PUT | Yes | Set favorite leagues | `{league_ids}` |

### Predictions Endpoints

| Endpoint | Method | Auth | Purpose | Request | Response |
|----------|--------|------|---------|--------|----------|
| `/predictions/fixtures/` | GET | No | Get match fixtures | `date, range, offset, limit, league` | `Match[]` |
| `/predictions/live/` | GET | No | Get live matches | - | `Match[]` |
| `/predictions/finished/` | GET | No | Get finished matches | `limit, offset, league, team, date` | `{count, results: Match[]}` |
| `/predictions/search/` | GET | No | Search matches | `q, date, league` | `{results: Match[]}` |
| `/predictions/matches/{matchId}/overview/` | GET | No | Get match overview | `form_range, h2h_range` | `MatchOverview` |
| `/predictions/matches/{matchId}/dashboard/` | GET | No | Get match dashboard | - | `Dashboard` |
| `/predictions/matches/{matchId}/analysis/` | GET | No | Get match analysis | - | `MatchAnalysis` |
| `/predictions/save/` | POST | Yes | Save match | `{match_id}` | - |
| `/predictions/saved/` | GET | Yes | Get saved matches | - | `[{match_id, home_team, away_team, saved_at}]` |
| `/predictions/save-market/` | POST | Yes | Save market | `{match_id, market_key}` | - |
| `/predictions/save-market/` | DELETE | Yes | Unsave market | `{match_id, market_key}` | - |
| `/predictions/saved-markets/` | GET | Yes | Get saved markets | `match_id` | `SavedMarket[]` |
| `/predictions/saved-markets/pdf/` | POST | Yes | Generate saved markets PDF | `{tab_name}` | Blob |
| `/predictions/public-saved-markets/` | GET | No | Get public saved markets | - | `SavedMarket[]` |
| `/predictions/saved-markets/{id}/toggle-public/` | PATCH | Yes | Toggle market public | - | `SavedMarket` |
| `/predictions/ai-track-record/` | GET | No | Get AI track record | `league` | `AITrackRecord` |
| `/predictions/ai-performance/` | GET | No | Get AI performance stats | - | `AIPerformanceStats` |
| `/predictions/ai-analytics/` | GET | No | Get AI analytics | `range, breakdown` | `AIAnalytics` |
| `/predictions/bashiri-pick-analytics/` | GET | No | Get Bashiri pick analytics | `league, range, start_date, end_date, min_confidence, max_confidence` | `BashiriPickAnalytics` |
| `/predictions/leagues/` | GET | No | Get all leagues | - | `League[]` |
| `/predictions/teams/` | GET | No | Get all teams | `league` | `Team[]` |
| `/predictions/teams/{teamId}/` | GET | No | Get team detail | - | `TeamDetail` |
| `/predictions/leagues/{leagueCode}/` | GET | No | Get league detail | - | `LeagueDetail` |
| `/predictions/odds/` | GET | No | Get odds | `league, status, lang` | `OddsBookmaker[]` |
| `/predictions/matches/{matchId}/odds/` | GET | No | Get match odds | `lang` | `MatchOddsResponse` |
| `/predictions/bookmakers/` | GET | No | Get bookmakers | - | `Bookmaker[]` |

### Tips Endpoints

| Endpoint | Method | Auth | Purpose | Request | Response |
|----------|--------|------|---------|--------|----------|
| `/tips/` | GET | No | List tips | `league, market, user, status, sort, page_size` | `TipsListResponse` |
| `/tips/` | POST | Yes | Create tip | `CreateTipRequest` | `UserTip` |
| `/tips/{id}/` | GET | No | Get tip details | - | `UserTip` |
| `/tips/{id}/` | PUT | Yes | Update tip | `UpdateTipRequest` | `UserTip` |
| `/tips/{id}/` | DELETE | Yes | Delete tip | - | - |
| `/tips/{id}/vote/` | POST | Yes | Vote on tip | `{vote}` | `UserTip` |
| `/tips/{id}/share/` | POST | Yes | Track tip share | `{shared_to}` | `{message, shared_to}` |
| `/tips/{id}/comments/` | GET | No | Get tip comments | - | `CommentsResponse` |
| `/tips/{id}/comments/` | POST | Yes | Add comment | `{content, parent}` | `TipComment` |
| `/tips/markets/` | GET | No | Get market registry | `category` | `MarketRegistryResponse` |
| `/tips/leaderboard/` | GET | No | Get leaderboard | Query params | `LeaderboardResponse` |
| `/tips/tip-stars/` | GET | No | Get tip stars | Query params | `{count, next, previous, results: TipStar[]}` |
| `/tips/user/{username}/` | GET | No | Get user tips | `sort, page_size` | `TipsListResponse` |
| `/tips/best-streak-user/` | GET | No | Get best streak user | - | User data |
| `/tips/?match={matchId}` | GET | No | Get tips for match | - | `TipsListResponse` |

### Chat Endpoints

| Endpoint | Method | Auth | Purpose | Request | Response |
|----------|--------|------|---------|--------|----------|
| `/chat/` | POST | Optional | Send chat message | `{message, session_key}` | `{reply, remaining_today, tool_result}` |

### Feed Endpoints

| Endpoint | Method | Auth | Purpose | Request | Response |
|----------|--------|------|---------|--------|----------|
| `/feed/` | GET | No | Get feed cards | `limit, offset` | `{count, results: Card[]}` |
| `/feed/polls/{cardId}/vote/` | POST | Optional | Vote on poll | `{choice}` | - |
| `/feed/debates/` | GET | No | Get debates | `status` | `Card[]` |
| `/feed/cards/` | GET | No | Get all cards | - | `Card[]` |

### Gamification Endpoints

| Endpoint | Method | Auth | Purpose | Request | Response |
|----------|--------|------|---------|--------|----------|
| `/gamification/progress/` | GET | Yes | Get user progress | - | `UserProgressResponse` |
| `/gamification/achievements/` | GET | Yes | Get achievements | - | `{achievements, total_count}` |
| `/gamification/referral/generate/` | POST | Yes | Generate referral code | - | `{referral_code, referral_link, status}` |
| `/gamification/referral/validate/` | POST | No | Validate referral code | `{referral_code}` | `{valid, referrer}` |
| `/gamification/referral/complete/` | POST | Yes | Complete referral | `{referral_code}` | `{message, reward_points, referral}` |
| `/gamification/share/` | POST | Yes | Record social share | `{share_type, content_type, content_id}` | `{message, reward_xp, share}` |
| `/gamification/challenges/` | GET | Yes | Get daily challenges | - | `ChallengesResponse` |
| `/gamification/challenges/join/` | POST | Yes | Join challenge | `{challenge_id}` | `{message, user_challenge}` |
| `/gamification/challenges/update/` | POST | Yes | Update challenge progress | `{user_challenge_id, increment}` | `{message, user_challenge}` |

### Mic Endpoints

| Endpoint | Method | Auth | Purpose | Request | Response |
|----------|--------|------|---------|--------|----------|
| `/mic/upload-signature/` | GET | Yes | Get Cloudinary upload signature | - | `UploadSignature` |
| `/mic/` | POST | Yes | Create mic reaction | `{match, video_url, thumbnail_url, duration_seconds, mood, team_side, bytes}` | `MicReaction` |
| `/mic/{matchId}/` | GET | No | Get mic reactions | `team_side` | `MicReaction[]` |
| `/mic/{matchId}/mood-summary/` | GET | No | Get mood summary | - | `{total, breakdown}` |
| `/mic/{matchId}/can-post/` | GET | No | Check if can post | - | `{can_post, reason}` |
| `/mic/reactions/{reactionId}/vote/` | POST | Yes | Vote on reaction | `{emoji}` | - |
| `/mic/{matchId}/fan-of-match/` | GET | No | Get fan of match | - | `MicReaction` |
| `/mic/active-matches/` | GET | No | Get active mic matches | - | `[{match, reaction_count}]` |
| `/mic/my-reactions/` | GET | Yes | Get user mic reactions | - | `MicReaction[]` |
| `/mic/reactions/{reactionId}/` | DELETE | Yes | Delete mic reaction | - | - |

### Notifications Endpoints

| Endpoint | Method | Auth | Purpose | Request | Response |
|----------|--------|------|---------|--------|----------|
| `/notifications/` | GET | Yes | Get notifications | - | `Notification[]` |
| `/notifications/{id}/read/` | POST | Yes | Mark notification read | - | - |
| `/notifications/device-token/` | POST | Yes | Register device token | `{token, platform}` | - |
| `/notifications/preferences/` | GET | Yes | Get notification preferences | - | `NotificationPreferences` |
| `/notifications/preferences/` | PATCH | Yes | Update notification preferences | Partial preferences | `NotificationPreferences` |

### Payments Endpoints

| Endpoint | Method | Auth | Purpose | Request | Response |
|----------|--------|------|---------|--------|----------|
| `/payments/subscribe/` | POST | Yes | Initiate subscription | `{plan}` | `{checkout_request_id, detail}` |
| `/payments/status/{checkoutRequestId}/` | GET | No | Get transaction status | - | `Transaction` |
| `/payments/my-history/` | GET | Yes | Get payment history | - | `{transactions, subscriptions}` |

### Pulse Endpoints

| Endpoint | Method | Auth | Purpose | Request | Response |
|----------|--------|------|---------|--------|----------|
| `/pulse/summary/` | GET | No | Get pulse summary | - | `PulseSummary` |

### Command Search Endpoints

| Endpoint | Method | Auth | Purpose | Request | Response |
|----------|--------|------|---------|--------|----------|
| Command search is implemented via intelligent search combining multiple endpoints |

### Settings Endpoints

| Endpoint | Method | Auth | Purpose | Request | Response |
|----------|--------|------|---------|--------|----------|
| See predictions endpoints for leagues/teams settings

### Support Endpoints

| Endpoint | Method | Auth | Purpose | Request | Response |
|----------|--------|------|---------|--------|----------|
| `/support/` | GET | Yes | Get support tickets | - | Ticket list |
| `/support/` | POST | Yes | Create support ticket | `{subject, message, category}` | Ticket |
| `/support/{id}/` | GET | Yes | Get support ticket details | - | Ticket details |

### Reviews Endpoints

| Endpoint | Method | Auth | Purpose | Request | Response |
|----------|--------|------|---------|--------|----------|
| See reviews API file for complete endpoint list

### Music Endpoints

| Endpoint | Method | Auth | Purpose | Request | Response |
|----------|--------|------|---------|--------|----------|
| See music API file for complete endpoint list

---

## 9. AUTHENTICATION AUDIT

### Authentication Flow

**Registration Process:**
1. **Step 1 (Basic Info):** Phone number (+255 format), Username, Date of Birth
2. **Step 2 (Password):** Password creation (min 4 characters), Password confirmation
3. **Validation:** Phone format validation, Password matching, Username uniqueness
4. **Response:** Returns `access` token, `refresh` token, and `user` object
5. **Redirect:** Always redirects to `/onboarding` for new registrations

**Login Process:**
1. **Input:** Phone number (+255 format), Password
2. **Validation:** Phone format validation, Password required
3. **Response:** Returns `access` token, `refresh` token, and `user` object
4. **Redirect:** Redirects to `getPostAuthPath(user)` which checks onboarding status

**Token Management:**
- **Storage:** Zustand persist middleware with localStorage
- **Access Token:** Stored in Zustand state, used for API authentication
- **Refresh Token:** Stored in Zustand state, used for token refresh
- **Auto-Refresh:** Automatic token refresh on 401 responses
- **Refresh Logic:** Single refresh at a time to prevent race conditions
- **Session Expiry:** 7 days for access token, 90 days for refresh token

**Protected Routes:**
- **Auth Guard Hook:** `useRequireAuth()` - Shows auth gate sheet instead of redirect
- **Layout Guard:** Main layout checks authentication status
- **Onboarding Guard:** Checks `onboarding_status` in layout

**Auth Gate Sheet:**
- **Trigger:** When protected action attempted by guest
- **Display:** Bottom sheet with login/register options
- **Return-to:** Saves intended destination for post-login redirect
- **UI:** Gold-themed with lock icon and premium styling

**User Model:**
```typescript
interface BashiriUser {
  id: number;
  phone_number: string;
  username: string | null;
  date_of_birth: string | null;
  avatar_url: string;
  is_subscriber: boolean;
  is_subscription_active: boolean;
  subscription_expires_at: string | null;
  current_streak: number;
  best_streak: number;
  total_predictions: number;
  correct_predictions: number;
  accuracy_percentage: number;
  profile_complete: boolean;
  onboarding_status: "not_started" | "completed" | "skipped";
  onboarding_completed_at: string | null;
  tip_preferences: string[];
  preferred_language: "sw" | "en";
  favorite_team_ids: number[];
  favorite_league_ids: number[];
  date_joined: string;
  is_staff: boolean;
  // Tip-specific fields
  tip_count: number;
  tip_accuracy: number;
  verified_tipster: boolean;
  followers_count: number;
  following_count: number;
}
```

**Onboarding Flow:**
1. **Trigger:** User with `onboarding_status: "not_started"`
2. **Step 1:** Welcome screen with 5-step progress indicator
3. **Step 2:** Favorite leagues selection (multi-select)
4. **Step 3:** Favorite teams selection (multi-select)
5. **Step 4:** Tip preferences selection (multi-select)
6. **Step 5:** Summary review
7. **Options:** Complete or Skip
8. **Persistence:** Draft saved to sessionStorage, restored on navigation

**Flutter Implementation Notes:**
- Use `flutter_secure_storage` for token storage
- Implement automatic token refresh similar to current logic
- Replicate auth gate sheet as bottom sheet modal
- Maintain same onboarding flow with 5 steps
- Preserve return-to navigation pattern
- Use same phone number validation (+255 format)

---

## 10. PREMIUM / SUBSCRIPTION AUDIT

### Premium Features

**Subscription Tiers:**
- **Free:** Basic access
- **Weekly:** TZS 1,500 (1 week access)
- **Monthly:** TZS 6,000 (1 month access)

**Locked Features (Premium Only):**
- Advanced AI confidence levels
- Premium market analysis
- Detailed match analytics
- Historical prediction data
- Premium tips access
- Advanced filtering options
- Ad-free experience

**Premium UI Patterns:**
- **Blur Effect:** Locked content shows blurred/obscured UI
- **Lock Icon:** Premium lock icon on locked features
- **Upgrade Prompts:** "Upgrade to unlock" messages
- **Subscription Sheet:** Bottom sheet for subscription purchase
- **Gold Borders:** Premium cards use gold accent borders
- **Gradient Backgrounds:** Premium features use gold gradients

**Premium Badge:**
- **PRO Badge:** Gold badge for premium users
- **Placement:** Profile, settings, and feature headers
- **Style:** Gold gradient with "PRO" text

**Subscription Flow:**
1. **Trigger:** User attempts premium feature or clicks upgrade
2. **Confirmation:** Show subscription selection (weekly/monthly)
3. **Payment:** M-Pesa STK Push integration
4. **Polling:** Poll transaction status every 3 seconds for up to 1.5 minutes
5. **Success:** Update user subscription status, unlock features
6. **Error Handling:** Show failure message with retry option

**Payment States:**
- **PENDING:** Payment initiated, awaiting user action
- **SUCCESS:** Payment completed successfully
- **FAILED:** Payment failed
- **CANCELLED:** User cancelled payment

**User Subscription Status:**
- `is_subscriber`: Boolean flag
- `is_subscription_active`: Boolean flag
- `subscription_expires_at`: Expiration timestamp
- `plan`: "weekly" or "monthly"

**Flutter Implementation Notes:**
- Implement in-app purchase (IAP) for mobile store integration
- Maintain M-Pesa as primary payment method for Tanzania
- Implement subscription validation logic on app startup
- Cache subscription status locally
- Handle subscription expiry gracefully
- Show upgrade prompts at feature boundaries

---

## 11. PWA AUDIT

### PWA Configuration

**Manifest:** `public/manifest.json`
```json
{
  "name": "Bashiri Elite",
  "short_name": "Bashiri",
  "description": "Football predictions and sports insights",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#0A0A0A",
  "theme_color": "#0A0A0A",
  "orientation": "portrait",
  "categories": ["sports", "entertainment"],
  "gcm_sender_id": "960997020688",
  "icons": [
    { "src": "/bashiri-app-icon-192.png", "sizes": "192x192", "type": "image/png", "purpose": "any" },
    { "src": "/bashiri-app-icon-512.png", "sizes": "512x512", "type": "image/png", "purpose": "any" },
    { "src": "/bashiri-icon-maskable-192.png", "sizes": "192x192", "type": "image/png", "purpose": "maskable" },
    { "src": "/bashiri-icon-maskable-512.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable" }
  ],
  "shortcuts": [
    {
      "name": "Tengeneza Prediction",
      "short_name": "Predict",
      "description": "Chagua mechi na uone AI Prediction Dashboard",
      "url": "/create",
      "icons": [{ "src": "/bashiri-app-icon-192.png", "sizes": "192x192" }]
    },
    {
      "name": "Bashiri Mic",
      "short_name": "Mic",
      "description": "Ona video za mashabiki",
      "url": "/matches",
      "icons": [{ "src": "/bashiri-app-icon-192.png", "sizes": "192x192" }]
    },
    {
      "name": "Admin Panel",
      "short_name": "Admin",
      "description": "Ingia kwenye Admin Dashboard",
      "url": "/admin/login",
      "icons": [{ "src": "/bashiri-app-icon-192.png", "sizes": "192x192" }]
    }
  ]
}
```

**PWA Install Provider:**
- Detects PWA install availability
- Shows install prompt sheet when available
- Tracks install dismissal
- Provides install button in settings

**Service Worker:**
- Registered in `app/sw.js/route.ts`
- Caches static assets
- Provides offline support
- Background sync capabilities

**Install Prompt Sheet:**
- Full-screen bottom sheet for PWA install
- Shows app preview and install button
- Dismissal tracking

**Flutter Implementation Notes:**
- PWA-specific features NOT needed in Flutter:
  - Service worker (Flutter has different caching mechanisms)
  - Web manifest (Flutter has its own app configuration)
  - Browser install prompts (Flutter uses app stores)
- Native equivalents needed:
  - Native splash screen
  - App store listing
  - Native app icons
  - App store metadata
- Keep same branding (colors, icons, shortcuts)

---

## 12. ANIMATION AUDIT

### Key Animations

**Splash Screen Animations:**
- **Hero Entry:** Scale and fade-in (0.6s duration)
- **Stats Entry:** Staggered fade-in with 0.1s delay
- **Progress Bar:** Animated width based on initialization progress
- **Exit Animation:** Fade out (0.4s duration)

**Navigation Animations:**
- **Bottom Nav Show/Hide:** Slide up/down with cubic-bezier easing
- **Page Transitions:** Slide-up animation (0.3-0.5s)
- **Button Hover:** Scale 1.02, shadow increase
- **Button Tap:** Scale 0.98

**Feed Animations:**
- **Card Entry:** Fade-in + slide-up (staggered by index)
- **Skeleton Loading:** Shimmer effect on skeleton cards
- **Pull-to-Refresh:** Built-in pull-to-refresh with loading indicator

**AI Chat Animations:**
- **Message Entry:** Fade-in with slide-up
- **Typing Indicator:** Animated dots
- **Streaming Text:** Character-by-character appearance
- **Context Chips:** Scale-in with fade

**Match Animations:**
- **Live Pulse:** Pulsing animation for live indicators
- **Odds Updates:** Animated odds changes (color transitions)
- **Score Updates:** Animated score updates

**Premium Animations:**
- **Unlock Effect:** Scale and glow when unlocking premium features
- **Gold Glow:** Pulsing gold glow for premium elements
- **Confetti:** Particle explosion on successful actions (logout)

**Flutter Implementation Notes:**
- Use Flutter AnimationController for complex animations
- Replicate timing and easing functions from current app
- Use Hero animations for page transitions
- Implement skeleton loading with shimmer effect
- Use AnimatedBuilder for conditional animations
- Consider performance on mobile (avoid over-animating)

---

## 13. RESPONSIVE / MOBILE AUDIT

### Current Responsive Behavior

**Mobile-First Design:**
- Optimized for small screens (320px+)
- Touch-friendly target sizes (minimum 44px for buttons)
- Safe area handling for notched devices
- Bottom navigation with floating design

**Breakpoints:**
- **Small Mobile:** < 640px
- **Large Mobile:** 640px - 1024px
- **Tablet:** 1024px - 1280px
- **Desktop:** > 1280px

**Mobile-Specific Features:**
- Pull-to-refresh on lists
- Bottom navigation with scroll-to-hide
- Full-screen AI chat mode
- Touch-optimized input fields
- Swipe gestures (where implemented)

**Desktop-Specific Features:**
- Multi-column layouts
- Hover effects
- Keyboard navigation
- Larger grid layouts

**Flutter Implementation Notes:**
- Focus on mobile experience (native target audience)
- Implement adaptive layouts for tablets if needed
- Use Flutter's safe area handling
- Implement native pull-to-refresh equivalents
- Use Flutter's navigation instead of browser navigation
- Implement touch gestures and haptic feedback

---

## 14. ASSETS AUDIT

### Image Assets

**App Icons:**
- `/bashiri-app-icon-192.png` (192x192)
- `/bashiri-app-icon-512.png` (512x512)
- `/bashiri-icon-maskable-192.png` (192x192)
- `/bashiri-icon-maskable-512.png` (512x512)

**Logo Assets:**
- `/bashiri-logo-horizontal.svg` - Horizontal logo
- `/bashiri-mark-gold.svg` - Gold mark

**Background Video:**
- `/splash-background.mp4` - Splash screen background

**Team/League Logos:**
- Sourced from external API: `crests.football-data.org`
- Fallback icon: Target icon from lucide-react

**Flutter Implementation Notes:**
- Convert SVGs to Flutter assets
- Reuse external API for team/league logos
- Implement fallback system for missing logos
- Optimize image sizes for mobile
- Consider using cached network images

---

## 15. BUSINESS LOGIC AUDIT

### Prediction Logic

**AI Prediction Tiers:**
- **ELITE:** Highest confidence level (>90%)
- **STRONG:** High confidence level (75-90%)
- **MINIMUM:** Standard confidence level (50-75%)
- **NO_STRONG_PICK:** No strong pick available

**Match States:**
- **SCHEDULED:** Match not started
- **LIVE:** Match in progress
- **FINISHED:** Match completed
- **POSTPONED:** Match postponed
- **CANCELLED:** Match cancelled

**Prediction Settlement:**
- Based on actual match results
- Status: WON, LOST, PUSH, VOID, CANCELLED
- Accuracy calculated based on settled predictions

**Streak Calculation:**
- Current streak: consecutive correct predictions
- Best streak: historical best streak
- Reset logic on incorrect prediction

**Feed Ranking:**
- Algorithm: Mixed feed with AI picks, live matches, results, polls
- Smart refresh: Appends new items without full reset
- Debounced polling: 30-second intervals
- Visibility-based: Only poll when page is visible

**Flutter Implementation Notes:**
- Move complex business logic to backend where possible
- Implement prediction settlement logic in Flutter via API
- Maintain same streak calculation logic
- Replicate feed ranking algorithm via API
- Implement smart refresh pattern

---

## 16. PERFORMANCE AUDIT

### Current Performance Optimizations

**State Management:**
- Zustand with selective persistence
- Minimal re-renders through careful state design
- Lazy loading of components

**API Optimizations:**
- Debounced search (300ms delay)
- Smart polling with visibility detection
- Request deduplication
- Automatic token refresh

**Image Optimizations:**
- Next.js Image optimization
- External logo loading with fallbacks
- Lazy loading of images

**Feed Optimizations:**
- Smart refresh instead of full reload
- Intersection Observer for visibility detection
- Page visibility API for pause/resume
- Skeleton loading placeholders

**Flutter Implementation Notes:**
- Use Flutter's built-in performance optimizations
- Implement proper caching strategy (cached_network_image)
- Use pagination for large lists
- Implement proper state management (Provider/Riverpod)
- Optimize widget rebuilds with const constructors
- Use ListView.builder for large lists
- Implement proper image caching

---

## 17. ACCESSIBILITY AUDIT

**Current Accessibility Features:**
- Safe area handling for notched devices
- Proper focus management
- ARIA labels on buttons
- Reduced motion support (CSS media query)
- Touch target sizes optimized for mobile
- Keyboard navigation support where applicable

**Flutter Implementation Notes:**
- Use Flutter's Semantics widget for screen reader support
- Implement proper focus management
- Support system font scaling
- Add haptic feedback for touch interactions
- Support reduced motion settings
- Ensure minimum touch target sizes (48x48)

---

## 18. SECURITY AUDIT

**Frontend Security:**
- JWT token storage in Zustand persist (localStorage)
- Automatic token refresh on 401
- CSRF protection (should verify backend implementation)
- Input validation on client and server
- Environment variables for sensitive data

**Token Storage:**
- Access token: Memory (Zustand state)
- Refresh token: Memory (Zustand state)
- Persisted to localStorage (partial)

**API Security:**
- JWT authentication required for protected endpoints
- Authorization header: `Bearer {token}`
- Auto-refresh on token expiry
- Guest access for public endpoints

**Flutter Implementation Notes:**
- Use flutter_secure_storage for token storage
- Implement same JWT refresh logic
- Validate SSL certificates
- Implement certificate pinning if needed
- Secure API communication with HTTPS
- Implement proper error handling for authentication failures

---

## 19. FLUTTER MIGRATION MAP

### Next.js → Flutter Mapping

| Next.js | Flutter Equivalent |
|---------|------------------|
| React Component | Flutter Widget |
| Zustand Store | Provider/Riverpod (Bloc pattern) |
| Next Router | Flutter Navigation (go_router or auto_route) |
| Tailwind CSS | Flutter Theme + custom widgets |
| CSS Animations | Flutter AnimationController |
| localStorage | flutter_secure_storage / Hive |
| fetch API | Dio HTTP client |
| Framer Motion | Flutter animations |
| lucide-react | flutter_svg or custom icons |
| Next.js Image | CachedNetworkImage |
| Pull-to-refresh | RefreshIndicator (pull_to_refresh package) |
| Bottom Sheet | showModalBottomSheet (Flutter) |
| WebSocket | web_socket_channel |
| Service Worker | Not needed (Flutter has native caching) |
| PWA Manifest | AndroidManifest.xml + Info.plist |

### Technology Recommendations

**State Management:** Riverpod (Provider pattern) - matches current Zustand pattern well
**Routing:** go_router (type-safe routing with deep linking)
**HTTP Client:** Dio (with interceptors for auth)
**Animations:** Flutter AnimationController + flutter_animate
**Icons:** flutter_svg for lucide-react icons
**Image Caching:** cached_network_image package
**Storage:** flutter_secure_storage for tokens, Hive for cache
**Pull-to-Refresh:** pull_to_refresh package
**WebSocket:** web_socket_channel
**Real-time:** Firebase Cloud Messaging for push notifications

---

## 20. RECOMMENDED FLUTTER ARCHITECTURE

### Folder Structure

```
lib/
├── main.dart                 # App entry point
├── app.dart                   # Main app widget
├── core/                     # Core functionality
│   ├── constants/           # App constants
│   ├── theme/               # App theme configuration
│   ├── utils/               # Utility functions
│   └── config/               # App configuration
├── features/                 # Feature-based organization
│   ├── auth/                # Authentication feature
│   │   ├── models/           # Auth models
│   │   ├── repositories/     # Auth repositories
│   │   ├── providers/        # Auth providers
│   │   ├── screens/          # Auth screens
│   │   ├── widgets/          # Auth widgets
│   │   └── services/         # Auth services
│   ├── home/                # Home feature
│   ├── matches/             # Matches feature
│   ├── predictions/         # Predictions feature
│   ├── ai/                   # AI Chat feature
│   ├── tips/                 # Tips marketplace feature
│   ├── profile/              # Profile feature
│   ├── settings/            # Settings feature
│   ├── subscription/         # Subscription feature
│   ├── mic/                  # Video reactions feature
│   ├── music/                # Music player feature
│   ├── notifications/       # Notifications feature
│   ├── gamification/        # Gamification feature
│   ├── pulse/                # Real-time pulse feature
│   └── onboarding/          # Onboarding feature
├── shared/                   # Shared components
│   ├── widgets/              # Reusable widgets
│   ├── services/             # Shared services
│   ├── models/               # Shared models
│   ├── utils/                # Shared utilities
│   └── theme/                 # Shared theme
└── data/                     # Data layer
    ├── models/               # Data models
    ├── repositories/         # Data repositories
    └── services/             # Data services
```

### State Management Recommendation

**Riverpod** - Provider pattern:
- Matches current Zustand architecture
- Type-safe with code generation
- Good for complex state with multiple providers
- Excellent async state management

### API Client Recommendation

**Dio** - HTTP client:
- Interceptors for authentication
- Automatic token refresh
- Request/response logging
- Error handling
- Caching support

### Navigation Recommendation

**go_router** - Type-safe routing:
- Deep linking support
- Route guards for authentication
- Query parameter handling
- Custom transitions
- Browser URL sync

### Image Caching Recommendation

**cached_network_image** - Image caching:
- Automatic caching based on URL
- Memory and disk caching
- Placeholder and error image support
- Progressive loading

### Storage Recommendation

**flutter_secure_storage** - Secure storage:
- For access/refresh tokens
- Encrypted on supported platforms
- Secure persistence

**Hive** - Local database:
- For offline data caching
- User preferences
- Feed cache
- Notification history

---

## 21. SCREEN-BY-SCREEN FLUTTER SPECIFICATION

### Root Navigation Structure

```dart
// Initial Route: Splash/Landing check
Route:
  - /splash (for PWA users)
  - /landing (for first-time browser users)
  - /home (for returning users)
  - /login (for auth redirects)
  - /onboarding (for new users)
```

### Screen Specifications

**1. Splash Screen**
- **Purpose:** App initialization and branding
- **Layout:** Full-screen with video background
- **Components:** HeroCard, PerformanceStats, LeagueAccuracy, LoadingProgress, SplashFooter
- **Data:** None (simulated initialization)
- **Interactions:** None (auto-progressive)
- **Animations:** Entry animations, progress bar animation, exit animation
- **Navigation:** Auto-redirect to /home after completion

**2. Landing Page**
- **Purpose:** Marketing landing for first-time visitors
- **Layout:** Full-page marketing site with hero, features, pricing, FAQ
- **Components:** HeroSection, IntelligenceTrack, AnalysisDeck, TrackRecord, MarketsSection, PricingSection, FAQSection, FinalCTA, Footer
- **Data:** Static marketing content
- **Interactions:** Navigation links, CTA buttons
- **Animations:** Scroll-triggered animations, typewriter effect, floating metrics
- **Navigation:** Login, Register, Home

**3. Login/Register**
- **Purpose:** User authentication
- **Layout:** Centered card with glass morphism
- **Components:** Tab switcher, form inputs, forgot password link
- **Data:** Phone number, password, username, date of birth
- **Interactions:** Form submission, tab switching, forgot password
- **States:** Loading, error, success
- **Navigation:** Home, Onboarding (after registration), Return-to path

**4. Onboarding**
- **Purpose:** First-time user setup
- **Layout:** Multi-step wizard with video background
- **Components:** Progress indicator, league selector, team selector, preference selector, summary
- **Data:** Favorite leagues, favorite teams, tip preferences
- **Interactions:** Multi-select, skip/complete navigation
- **States:** Loading, saving, error
- **Navigation:** Home (after completion)

**5. Home**
- **Purpose:** Main feed with mixed content
- **Layout:** Header with actions, Hero carousel, Feed grid, Bottom navigation
- **Components:** HeroCarousel, FeedContainer, various feed cards, PullToRefresh, Search modal
- **Data:** Feed cards from API, notifications count, user data
- **Interactions:** Pull-to-refresh, search, card interactions, navigation
- **States:** Loading, loaded, error, refreshing
- **Navigation:** Match details, AI chat, Profile, Settings, various card destinations

**6. Matches**
- **Purpose:** Match listings with filters
- **Layout:** Tabbed interface (fixtures, live, finished)
- **Components:** Tab switcher, date picker, league filter, match cards, search modal
- **Data:** Match listings from API, filters state
- **Interactions:** Tab switching, date selection, league filtering, search, match card click
- **States:** Loading, loaded, error, filtering, searching
- **Navigation:** Match details, Create prediction

**7. AI Chat**
- **Purpose:** AI-powered football assistant
- **Layout:** Full-screen chat interface (hides bottom nav)
- **Components:** AIHeader, MessageList, AIComposer, EmptyState, ContextChips
- **Data:** Chat messages, session context, daily limit
- **Interactions:** Message sending, suggestion clicks, context selection
- **States:** Loading, sending, error, rate-limited
- **Navigation:** Home, back (via header)

**8. Create Prediction (Match Selection)**
- **Purpose:** Select match for prediction
- **Layout:** Date filter tabs, league dropdown, match grid
- **Components:** Filter tabs, league selector, MatchOddsCard, GlassCard
- **Data:** Match listings, leagues, odds
- **Interactions:** Date filtering, league filtering, match selection
- **States:** Loading, loaded, error, filtering
- **Navigation:** Match overview

**9. Match Overview**
- **Purpose:** Detailed match analysis
- **Layout:** Match header, MatchHubTabs, form guide, head-to-head, standings
- **Components:** Form guide cards, H2H cards, standings cards
- **Data:** Match overview, team form, head-to-head, team standings
- **Interactions:** Range selectors, navigation tabs
- **States:** Loading, loaded, error
- **Navigation:** Predict, Back, other tabs

**10. Match Predict**
- **Purpose:** Create prediction for match
- **Layout:** Market grid with premium locking
- **Components:** MarketRow cards, PremiumMarketCard, confidence indicators
- **Data:** Match dashboard data, markets with AI picks
- **Interactions:** Market selection, save functionality
- **States:** Loading, loaded, error
- **Navigation:** Save, Back, other tabs

**11. Match Room**
- **Purpose:** Real-time chat room for matches
- **Layout:** Full-screen chat interface with header, message list, input area
- **Components:** MatchHubTabs, message bubbles, connection indicator, emoji picker
- **Data:** Room messages, connection status, countdown
- **Interactions:** Message sending, emoji selection, auto-scroll
- **States:** Loading, connecting, connected, error, upcoming, closed
- **Navigation:** Back, Match tabs

**12. Tips Marketplace**
- **Purpose:** User-generated tips platform
- **Layout:** Discovery tabs, filter panel, tips grid, leaderboard
- **Components:** TipCard, TipFilter, TipstersLeaderboard, filter chips
- **Data:** Tips listings, filters, leaderboard data
- **Interactions:** Tab switching, filtering, tip interaction, leaderboard toggle
- **States:** Loading, loaded, error, filtering
- **Navigation:** Tip details, Create tip, Leaderboard

**13. Tip Details**
- **Purpose:** Individual tip view with comments
- **Layout:** Tip header, tip content, comments section, actions
- **Components:** TipCard (detailed), TipComments, voting buttons, share functionality
- **Data:** Tip details, comments, vote counts
- **Interactions:** Vote, comment, share, navigate
- **States:** Loading, loaded, error
- **Navigation:** Back, Tips page

**14. Profile**
- **Purpose:** User profile with gamification
- **Layout:** Cover with particles, avatar section, stats, quick actions, settings
- **Components:** Profile header, avatar upload, settings buttons, quick action grid, logout button
- **Data:** User data, tip statistics, gamification data
- **Interactions:** Avatar upload, settings navigation, logout, share
- **States:** Loading, uploading, editing, error
- **Navigation:** Settings, History, Analytics, Music, Payment history

**15. Settings**
- **Purpose:** App settings management
- **Layout:** Grid of setting cards, account info, logout button
- **Components:** Setting cards with icons, account info display, logout button with hold-to-confirm
- **Data:** User account info, setting items
- **Interactions:** Setting navigation, logout (3-second hold)
- **States:** None
- **Navigation:** Sub-settings, Back

**16. Subscribe**
- **Purpose:** Subscription payment flow
- **Layout:** Centered card with payment stages
- **Components:** Confirmation, waiting loader, success/error states
- **Data:** Plan details, transaction status
- **Interactions:** Payment initiation, M-Pesa STK push
- **States:** Confirm, waiting, success, failed
- **Navigation:** Profile, Back

**17. Pulse**
- **Purpose:** Real-time intelligence hub
- **Layout:** Live pulse bar, bento grid sections
- **Components:** LivePulseBar, BentoGrid with hero, music, rooms, community, AI insights
- **Data:** Pulse summary with live rooms, mic videos, debates, AI accuracy
- **Interactions:** Section navigation, card interactions
- **States:** Loading, loaded, error
- Navigation:** Match details, Music, Rooms

**18. Notifications**
- **Purpose:** Notification center
- **Layout:** List of notification cards
- **Components:** Notification cards with timestamps, actions
- **Data:** Notifications from API
- **Interactions:** Mark read, navigate to source
- **States:** Loading, loaded, error
- **Navigation:** Source of notification, Back

**19. Music**
- **Purpose: Music player for matchday atmosphere
- **Layout:** Full-screen or embedded player
- **Components:** MusicPlayerProvider with controls
- **Data:** Music tracks, playback state
- **Interactions:** Play/pause, track selection, volume control
- **States:** Loading, playing, paused, error
- **Navigation:** Back, Pulse

**20. AI Picks Analytics**
- **Purpose:** AI performance analytics
- **Layout:** Analytics dashboard with filters and charts
- **Components:** Filter controls, performance charts, statistics cards
- **Data:** AI analytics data from API
- **Interactions:** Filter changes, date range selection
- **States:** Loading, loaded, error
- **Navigation:** Home, Profile

**21. Bashiri Pick Analytics**
- **Purpose:** Detailed AI pick performance analysis
- **Layout:** Comprehensive analytics dashboard
- **Components:** Date range picker, filters, performance charts, recent picks table
- **Data:** Bashiri pick analytics from API
- **Interactions:** Filter changes, export functionality
- **States:** Loading, loaded, error
- **Navigation:** Home, Profile

**22. History**
- **Purpose:** User prediction history
- **Layout:** Timeline or list view of predictions
- **Components:** History cards, filter controls
- **Data:** User prediction history
- **Interactions:** Filter changes, navigation to match details
- **States:** Loading, loaded, error
- **Navigation:** Back, Match details

**23. Saved Markets**
- **Purpose: Saved prediction markets
- **Layout:** Grid of saved market cards
- **Components:** Market cards with action buttons
- **Data:** Saved markets from API
- **Interactions:** Delete, unsave, toggle public
- **States:** Loading, loaded, error
- **Navigation:** Back, Match details

**24. Live Odds**
- **Purpose: Real-time betting odds display
- **Layout:** Odds grid with bookmaker information
- **Components:** Odds cards with live indicators
- **Data:** Odds data from API
- **Interactions:** Navigation to match details
- **States:** Loading, loaded, error
- **Navigation:** Back, Match details

**25. Contact**
- **Purpose: Contact page for support
- **Layout:** Contact form with contact information
- **Components:** Contact form, WhatsApp integration
- **Data:** Contact form data
- **Interactions:** Form submission, WhatsApp button
- **States:** Loading, submitting, success, error
- **Navigation:** Back, Settings

**26. Review**
- **Purpose: App review collection
- **Layout:** Review prompt modal
- **Components:** Review prompt modal with rating and feedback
- **Data:** Review data
- **Interactions:** Rating selection, feedback input, submit
- **States:** Loading, submitting, success, error
- Navigation: Dismiss, Back

**27. Gamification**
- **Purpose: Gamification hub
- **Layout:** Gamification dashboard
- **Components:** XP display, achievements, challenges, referral info
- **Data:** Gamification progress data
- **Interactions:** Challenge joining, referral sharing
- **States:** Loading, loaded, error
- Navigation: Back, Profile

**28. Derby**
- **Purpose: Featured match derbies
- **Layout:** Derby-specific layout with theming
- **Components:** Derby-themed components
- **Data:** Derby data from API
- **Interactions:** Derby interactions
- **States:** Loading, loaded, error
- Navigation:** Back, Home, Pulse

**29. Debates**
- **Purpose: Community debates
- **Layout:** Debate cards with voting
- **Components:** Debate cards with vote buttons
- **Data:** Debate data from API
- **Interactions:** Vote participation
- **States:** Loading, loaded, error
- Navigation:** Back, Home, Pulse

**30. Evening Recap**
- **Purpose: Daily match recap
- **Layout:** Recap cards with results
- **Components:** ResultRecapCard components
- **Data:** Recap data from API
- **Interactions:** Match detail navigation
- **States:** Loading, loaded, error
- Navigation:** Back, Home

**31. High Confidence**
- **Purpose: High-confidence predictions
- **Layout:** Filtered predictions view
- **Components:** Prediction cards with confidence badges
- **Data:** High-confidence predictions from API
- **Interactions:** Prediction interaction
- **States:** Loading, loaded, error
- Navigation:** Back, Home

**32. Weekly Summary**
- **Purpose: Weekly performance summary
- **Layout:** Summary dashboard
- **Components:** Statistics cards, trend charts
- **Data:** Weekly summary data
- **Interactions:** Filter changes
- **States:** Loading, loaded, error
- Navigation:** Back, Profile

---

## 22. BLOCKERS / QUESTIONS BEFORE IMPLEMENTATION

### Backend Dependencies

**UNCERTAIN:**
- Complete backend API documentation (frontend uses some endpoints that may be undocumented)
- WebSocket message format for match rooms (partially documented)
- Complete notification payload structure
- Complete gamification reward calculations
- Complete referral system mechanics
- Detailed payment callback handling

**REQUIRES BACKEND VERIFICATION:**
- Exact WebSocket message format for match rooms
- Complete notification types and payloads
- Gamification XP calculation formulas
- Referral reward calculation formulas
- M-Pesa callback retry logic
- Push notification payload structure

### Missing Backend Features

**POTENTIALLY MISSING:**
- WebSocket reconnection logic (frontend has basic WebSocket but may need robust reconnection)
- Offline queue for failed API requests
- Complete offline data synchronization
- Push notification delivery confirmation
- Complete admin panel API coverage (some admin endpoints may be missing)

### Asset Dependencies

**UNCERTAIN:**
- Team/league logo availability for all teams/leagues
- Video hosting platform for mic videos (appears to use Cloudinary)
- Music hosting platform for music player
- Complete admin panel documentation

### Environment Variables

**AVAILABLE (from .env.example):**
- Django: SECRET_KEY, DEBUG, ALLOWED_HOSTS, database config, Redis config, JWT lifetimes, API keys, M-Pesa config, SMS config, frontend URL
- Frontend: API base URL

**MISSING FOR FLUTTER:**
- Firebase configuration (if using Firebase for push notifications)
- M-Pesa production credentials
- Additional API keys if any

### Business Logic Clarifications

**REQUIRES CLARIFICATION:**
- Exact subscription renewal flow (auto-renewal vs manual)
- Subscription grace period handling
- Exact tip verification criteria
- Gamification milestone triggers
- Daily challenge reset timing
- Feed ranking algorithm details
- AI confidence threshold boundaries

### UX Clarifications

**REQUIRES CLARIFICATION:**
- Deep-link handling for specific content types
- Keyboard behavior in chat rooms on Flutter
- Screen reader announcements for live events
- Haptic feedback implementation points
- Reduced motion handling scope
- Internationalization approach for Flutter

---

## 23. FINAL DELIVERABLE

This comprehensive audit report provides a complete technical foundation for the Flutter migration. The audit covers:

1. **Project Structure** - Complete file organization and architecture
2. **Screen Inventory** - 32+ user-facing screens with full specifications
3. **Navigation Map** - Complete navigation flow and routing structure
4. **UI/UX Design System** - Complete color palette, typography, effects, and styling patterns
5. **Component Inventory** - 50+ reusable components with specifications
6. **State Inventory** - All meaningful UI states and their behaviors
7. **API/Django Integration** - 80+ documented API endpoints grouped by feature
8. **Authentication Flow** - Complete auth flow with token management
9. **Premium/Subscription Flow** - Complete subscription system with M-Pesa integration
10. **PWA Behavior** - PWA-specific features vs native app requirements
11. **Animation Inventory** - All key animations with timing and easing
12. **Asset Inventory** - All image assets and external dependencies
13. **Business Logic** - All prediction, gamification, and feed logic
14. **Performance Findings** - Optimizations and Flutter recommendations
15. **Accessibility Audit** - Current accessibility features and Flutter requirements
16. **Security Audit** - Frontend security measures and Flutter considerations
17. **Flutter Migration Map** - Next.js to Flutter technology mapping
18. **Recommended Flutter Architecture** - Production-ready folder structure and architecture
19. **Screen-by-Screen Specification** - Detailed specifications for all 32+ screens
20. **Blockers/Questions** - Areas requiring backend clarification or missing information

The Flutter application should be built as a **premium, modern, mobile-first experience** that preserves Bashiri's:
- **Product Identity:** Gold branding, electric green accents, glass morphism
- **Business Logic:** AI prediction tiers, gamification, subscription model
- **User Experience:** Personalized feed, real-time features, social engagement
- **Technical Foundation:** Django REST API, WebSocket real-time, M-Pesa payments

The Flutter app will leverage the existing Django backend while creating a superior mobile-native experience with native performance, smooth animations, and platform-specific optimizations.

---

**Audit Completed:** September 18, 2026  
**Audit Scope:** Complete frontend codebase analysis  
**Prepared For:** Flutter mobile app implementation  
**Next Phase:** Flutter architecture planning and development kickoff