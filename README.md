# UWorld-Style QBank Platform

A comprehensive question bank (QBank) learning platform built with Next.js 13+, TypeScript, Tailwind CSS, and Supabase. This platform provides a UWorld-style interface for practicing questions, reviewing flashcards, managing study plans, and taking notes.

## Features

- **Question Bank Practice**
  - Create custom practice sessions with selected categories
  - Multiple-choice questions with immediate feedback
  - Detailed explanations for each answer
  - Track performance and progress

- **Flashcards**
  - Interactive flashcard review system
  - Filter by category
  - Flip cards to reveal answers

- **Study Plan**
  - Create and manage study tasks
  - Set due dates for tasks
  - Track completion status

- **Notebook**
  - Create and organize personal study notes
  - Link notes to specific questions
  - Rich text editing

- **Dashboard**
  - View overall performance statistics
  - Track questions answered and accuracy
  - See upcoming study tasks
  - Quick access to all features

## Tech Stack

- **Frontend**: Next.js 13+ (App Router), React, TypeScript
- **Styling**: Tailwind CSS v4
- **Backend**: Supabase (PostgreSQL + Auth)
- **Authentication**: Supabase Auth (Email/Password)
- **Deployment**: Vercel-ready

## Prerequisites

- Node.js 18+ and npm
- A Supabase account ([Create one here](https://supabase.com))
- Git

## Setup Instructions

## Deployment TODOs

- [ ] Testing local app with real Supabase connection
- [ ] Add sample questions and content to database
- [ ] Test all features end-to-end
- [ ] Deploy to Vercel production
- [ ] Test production deployment

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd peds-cardiology-qbank
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Supabase

1. Create a new project in [Supabase Dashboard](https://app.supabase.com)
2. Go to **Settings → API** and copy:
   - Project URL
   - Anon/Public API Key

3. Go to **SQL Editor** and run the schema from `supabase-schema.sql`:
   - This will create all necessary tables
   - Set up Row Level Security (RLS) policies
   - Create indexes for performance
   - Set up authentication triggers

4. Enable Email authentication:
   - Go to **Authentication → Settings**
   - Enable "Email Signups"
   - (Optional) Configure SMTP for email confirmations

### 4. Configure Environment Variables

Create a `.env.local` file in the root directory:

```bash
cp .env.local.example .env.local
```

Edit `.env.local` and add your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL="your-supabase-project-url"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-supabase-anon-key"
```

### 5. Seed Sample Data (Optional)

To populate the database with sample questions, flashcards, and categories:

1. Go to Supabase SQL Editor
2. Run the seed data SQL (see `supabase-schema.sql` comments for sample data)
3. This will add:
   - 4 categories (Mathematics, Science, History, Geography)
   - 20 sample questions with options
   - 10 sample flashcards

### 6. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 7. Create Your First Account

1. Navigate to the app (it will redirect you to sign in)
2. Click "Sign up"
3. Create an account with your email and password
4. You'll be redirected to the dashboard

## Project Structure

```
peds-cardiology-qbank/
├── app/                          # Next.js App Router pages
│   ├── auth/
│   │   ├── signin/page.tsx      # Sign in page
│   │   └── signup/page.tsx      # Sign up page
│   ├── dashboard/page.tsx       # Dashboard
│   ├── qbank/
│   │   ├── page.tsx             # QBank main page
│   │   └── [sessionId]/
│   │       ├── page.tsx         # Quiz session page
│   │       └── results/page.tsx # Results page
│   ├── flashcards/page.tsx      # Flashcards page
│   ├── study-plan/page.tsx      # Study plan page
│   ├── notebook/page.tsx        # Notebook page
│   ├── layout.tsx               # Root layout
│   ├── page.tsx                 # Landing page
│   └── globals.css              # Global styles
├── components/                   # Reusable components
│   ├── NavBar.tsx               # Navigation bar
│   ├── QuestionCard.tsx         # Question display component
│   ├── FlashcardCard.tsx        # Flashcard component
│   └── StudyPlanItem.tsx        # Study plan item component
├── lib/                          # Utility libraries
│   ├── supabase/
│   │   ├── client.ts            # Browser Supabase client
│   │   └── server.ts            # Server Supabase client
│   └── utils.ts                 # Utility functions
├── middleware.ts                 # Route protection middleware
├── supabase-schema.sql          # Database schema
└── package.json                 # Dependencies
```

## Database Schema

The platform uses the following main tables:

- **profiles**: User profile information
- **categories**: Question/flashcard categories
- **questions**: Question bank items
- **question_options**: Multiple choice options
- **sessions**: Practice test sessions
- **session_answers**: User answers within sessions
- **flashcards**: Flashcard content
- **study_plan**: User study tasks
- **notes**: User personal notes

All tables are protected with Row Level Security (RLS) to ensure users can only access their own data.

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import the repository in [Vercel](https://vercel.com)
3. Add environment variables in Vercel:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy!

Alternatively, use the Vercel CLI:

```bash
npm install -g vercel
vercel
```

### Deploy Database

Your Supabase database is already hosted in the cloud. Just ensure:
- All schema is applied via SQL editor
- Row Level Security is enabled
- Auth settings are configured

## Usage

### Creating a Practice Quiz

1. Navigate to **QBank**
2. Select categories to practice
3. Choose number of questions (5-50)
4. Click "Start Practice Quiz"
5. Answer questions and get immediate feedback
6. Review results at the end

### Using Flashcards

1. Navigate to **Flashcards**
2. Filter by category (optional)
3. Click "Flip Card" to see the answer
4. Use Previous/Next to navigate

### Managing Study Plan

1. Navigate to **Study Plan**
2. Click "Add Task" to create a new task
3. Set title and optional due date
4. Check off tasks as you complete them
5. Delete tasks you no longer need

### Taking Notes

1. Navigate to **Notebook**
2. Click "New Note" to create a note
3. Add title and content
4. Save the note
5. Edit or delete notes as needed

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Adding New Features

The codebase is modular and easy to extend:

- Add new pages in `app/`
- Create reusable components in `components/`
- Add new database tables and update `supabase-schema.sql`
- Update RLS policies for security

## Security

- All routes except `/auth/*` require authentication
- Row Level Security (RLS) enforces data access control
- User passwords are handled securely by Supabase Auth
- Environment variables protect sensitive keys
- Middleware validates user sessions

## Troubleshooting

**Issue**: "supabaseUrl or supabaseKey required"
- **Solution**: Ensure `.env.local` is properly configured with your Supabase credentials

**Issue**: Can't fetch questions/flashcards
- **Solution**: Check that RLS policies are enabled and you're logged in

**Issue**: Sign up fails
- **Solution**: Check Supabase Auth settings and ensure email signups are enabled

**Issue**: Middleware redirects not working
- **Solution**: Ensure Supabase SSR package is installed and cookies are being set

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For issues and questions:
- Check the [Issues](https://github.com/your-username/repo/issues) page
- Review the Supabase documentation
- Check Next.js documentation

## Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Powered by [Supabase](https://supabase.com/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)
- Icons from [Lucide](https://lucide.dev/)
