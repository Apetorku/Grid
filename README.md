# GridNexus - Web Development Service Marketplace

A comprehensive platform that streamlines the entire web development service lifecycle with built-in escrow protection, automated pricing, and real-time collaboration tools.

## 🚀 Features

### Core Functionality

- **Client Portal**: Submit project requirements, get automated quotes, book appointments
- **Developer Portal**: Manage projects, communicate with clients, deliver work
- **Admin Dashboard**: Platform oversight, user management, analytics
- **Secure Escrow**: Paystack-powered payment protection
- **Real-time Communication**: Live chat and notifications
- **SMS & Email Notifications**: Arkesel SMS alerts (Ghana) + Resend email notifications for clients
- **Screen Sharing**: Jitsi Meet integration (Free!) for remote presentations
- **Automated Workflow**: From booking to delivery with smart status tracking

### Security Features

- OAuth 2.0 authentication (Email/Password + Google)
- Role-based access control (Client, Developer, Admin)
- Encrypted data storage
- Secure file uploads
- Payment security with Paystack

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth + Google OAuth
- **Payment**: Paystack
- **SMS**: Arkesel (Ghana)
- **Email**: Resend
- **Real-time**: Supabase Realtime + Socket.io
- **Screen Sharing**: Daily.co
- **File Storage**: Supabase Storage
- **Deployment**: Vercel + Supabase Cloud

## 📋 Prerequisites

- Node.js 18.17 or higher
- npm or yarn
- Supabase account
- Paystack account
- Arkesel account (optional, for SMS notifications)
- Resend account (optional, for email notifications)
- Daily.co account
- Google OAuth credentials

## 🔧 Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd GridNexus
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.example .env.local
   ```

   Fill in your API keys and credentials. 
   
   **Note**: Email notifications work immediately with `onboarding@resend.dev` - no domain required!

4. **Run database migrations**

   ```bash
   npm run db:migrate
   ```

5. **Start development server**

   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to `http://localhost:3000`

## 🗄️ Database Schema

See `database/schema.sql` for the complete database structure.

## 📁 Project Structure

```
GridNexus/
├── app/                      # Next.js App Router
│   ├── (auth)/              # Authentication routes
│   ├── (client)/            # Client portal
│   ├── (developer)/         # Developer portal
│   ├── (admin)/             # Admin dashboard
│   ├── api/                 # API routes
│   └── layout.tsx           # Root layout
├── components/              # Reusable components
│   ├── ui/                  # shadcn/ui components
│   ├── auth/                # Authentication components
│   ├── client/              # Client-specific components
│   ├── developer/           # Developer-specific components
│   └── shared/              # Shared components
├── lib/                     # Utility functions
│   ├── supabase/           # Supabase client
│   ├── paystack/           # Paystack integration
│   ├── daily/              # Daily.co integration
│   └── utils.ts            # Helper functions
├── types/                   # TypeScript types
├── database/                # Database files
│   └── schema.sql          # Database schema
├── public/                  # Static assets
└── middleware.ts           # Next.js middleware

```

## 🔐 Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Paystack
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=your_paystack_public_key
PAYSTACK_SECRET_KEY=your_paystack_secret_key

# Daily.co
NEXT_PUBLIC_DAILY_API_KEY=your_daily_api_key
DAILY_API_SECRET=your_daily_secret

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 🚦 User Flow

### Client Journey

1. Sign up / Login
2. Upload project documentation
3. Receive automated quote
4. Book appointment
5. Review and approve final quote
6. Make escrow payment
7. Track project progress
8. Review completed work
9. Accept delivery
10. Receive repository (+ hosting URL if selected)

### Developer Journey

1. Login to developer portal
2. Review pending projects
3. Confirm/adjust pricing
4. Start development
5. Communicate with client
6. Submit completed work
7. Receive payment upon client acceptance

### Admin Journey

1. Monitor all projects
2. Manage users (clients & developers)
3. Handle disputes
4. View analytics and reports
5. Configure platform settings

## 📱 API Routes

- `/api/auth/*` - Authentication endpoints
- `/api/projects/*` - Project management
- `/api/payments/*` - Payment processing
- `/api/uploads/*` - File uploads
- `/api/notifications/*` - Real-time notifications
- `/api/appointments/*` - Booking management
- `/api/chat/*` - Messaging system
- `/api/meetings/*` - Screen sharing sessions

## 🧪 Testing

```bash
npm run test
```

## 🏗️ Build for Production

```bash
npm run build
npm start
```

## 📄 License

MIT License - see LICENSE file for details

## 👥 Support

For support, email support@gridnexus.com or join our Slack channel.
