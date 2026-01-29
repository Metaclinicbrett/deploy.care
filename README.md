# Deploy.Care - Care Plan Management

A healthcare SaaS platform for managing care plans, patient cases, and encounters with ICD-10/CPT code support.

## Tech Stack

- **Frontend**: Angular 17+ with Standalone Components & Signals
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth
- **Hosting**: Vercel
- **Styling**: Tailwind CSS

## Features

- 🏥 Care plan enrollment with 3 view modes (List, Card, Hybrid)
- 📋 ICD-10 diagnosis codes with descriptions
- 💰 CPT code tracking for billing
- 🏷️ Care type badges (DX, TX, DX/TX)
- 💵 Pricing models (Subscription vs One-time)
- 📝 Document requirement tracking
- 🔐 Row-level security for HIPAA compliance
- 🔄 Real-time updates via Supabase

## Quick Start

### 1. Clone & Install

```bash
cd care-plan-angular
npm install
```

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run the schema in `supabase/schema.sql`
3. Go to **Settings > API** and copy:
   - Project URL
   - anon/public key

### 3. Configure Environment

```bash
# Copy example and edit with your credentials
cp src/environments/environment.example.ts src/environments/environment.ts
cp src/environments/environment.example.ts src/environments/environment.prod.ts
```

Edit both files with your Supabase credentials:
```typescript
export const environment = {
  production: false,  // true for environment.prod.ts
  supabaseUrl: 'https://YOUR_PROJECT.supabase.co',
  supabaseAnonKey: 'YOUR_ANON_KEY'
};
```

### 4. Run Locally

```bash
npm start
# Visit http://localhost:4200
```

### 5. Deploy to Vercel

```bash
# Install Vercel CLI (if needed)
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard:
# - SUPABASE_URL
# - SUPABASE_ANON_KEY
```

### 6. Connect Domain

1. In Vercel dashboard, go to **Settings > Domains**
2. Add `deploy.care` (or your subdomain)
3. Update DNS at your registrar

## Project Structure

```
care-plan-angular/
├── src/
│   ├── app/
│   │   ├── components/         # UI components
│   │   │   ├── header/
│   │   │   ├── filter-panel/
│   │   │   ├── care-plan-list/
│   │   │   ├── care-plan-card/
│   │   │   ├── care-plan-hybrid/
│   │   │   └── shared/
│   │   ├── models/             # TypeScript interfaces
│   │   └── services/           # State & API services
│   │       ├── care-plan.service.ts
│   │       └── supabase.service.ts
│   └── environments/           # Environment configs
├── supabase/
│   └── schema.sql              # Database schema
├── vercel.json                 # Vercel configuration
└── angular.json                # Angular configuration
```

## Database Schema

See `supabase/schema.sql` for the complete schema including:

- `care_plans` - Available care plans with pricing
- `diagnosis_codes` - ICD-10 codes linked to care plans
- `cpt_codes` - CPT codes for billing
- `patients` - Patient records
- `cases` - Patient cases linked to care plans
- `encounters` - Visit/encounter records
- `documents` - File attachments
- `user_profiles` - User accounts
- `organizations` - Multi-tenant support

## Security

Row-Level Security (RLS) is enabled on all tables:
- Users can only see their own patients and cases
- Care plans are viewable by all authenticated users
- Documents are scoped to the user who created them

## Environment Variables (Vercel)

| Variable | Description |
|----------|-------------|
| `SUPABASE_URL` | Your Supabase project URL |
| `SUPABASE_ANON_KEY` | Your Supabase anon/public key |

## License

Private - Deploy.Care
