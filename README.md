# 🚀 FocusFrame - Personal Productivity Dashboard

[![Vercel Deployment](https://img.shields.io/badge/Deployed_on-Vercel-black)](https://focus-frame.vercel.app)
[![Next.js](https://img.shields.io/badge/Next.js-15.5-black)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org)

> Modern personal dashboard with drag-and-drop widgets, real-time data, and PostgreSQL database.

## ✨ Live Demo

🔗 **[View Live Application](https://focus-frame-7ilpxjv5q-evvas-projects-6b48ca01.vercel.app)**

## 🎯 Features

- 🖱️ **Drag & Drop Interface** - Customizable widget layout
- ✅ **Task Management** - Full CRUD operations with PostgreSQL
- 🌤️ **Weather Widget** - Real weather data integration  
- 📰 **News Feed** - Latest news updates
- 🎨 **Modern UI** - Tailwind CSS with responsive design
- 🚀 **Full-Stack** - Next.js API Routes + TypeScript
- 🔒 **Authentication-Ready** - NextAuth.js configured

## 🛠 Tech Stack

- **Framework:** Next.js 15 with App Router
- **Language:** TypeScript
- **Database:** PostgreSQL with Prisma ORM
- **Hosting:** Neon.tech (Database), Vercel (Deployment)
- **Styling:** Tailwind CSS
- **Drag & Drop:** @dnd-kit
- **State Management:** React Query
- **Authentication:** NextAuth.js (Ready for integration)

## 📸 Screenshots

![Dashboard Preview](/public/images/dashboard-preview.png)

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- PostgreSQL database (or Neon.tech account)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/ge-lang/focus-frame.git
   cd focus-frame
```

1. Install dependencies
   ```bash
   npm install
   ```
2. Setup environment variables
   ```bash
   cp .env.example .env
   # Fill in your variables:
   # DATABASE_URL="your_postgresql_connection_string"
   # AUTH_SECRET="your_random_secret"
   # NEXTAUTH_URL="http://localhost:3000"
   ```
3. Setup database
   ```bash
   npx prisma generate
   npx prisma db push
   ```
4. Run development server
   ```bash
   npm run dev
   ```
5. Open your browser Navigate to http://localhost:3000

📁 Project Structure

```
src/
├── app/                 # Next.js App Router
│   ├── api/            # API routes (Tasks, Weather, News)
│   ├── dashboard/      # Dashboard pages
│   ├── auth/           # Authentication pages
│   └── layout.tsx      # Root layout
├── components/         # React components
│   ├── widgets/        # Widget components
│   └── contexts/       # State management
├── lib/               # Utilities and configurations
└── types/             # TypeScript definitions
```

🔌 API Routes

· GET /api/tasks - Fetch all tasks
· POST /api/tasks - Create new task
· PUT /api/tasks/[id] - Update task
· GET /api/weather - Weather data
· GET /api/news - News feed

🌐 Deployment

Vercel Deployment

1. Push to GitHub
2. Import project in Vercel
3. Add environment variables in Vercel Dashboard
4. Deploy! 🚀

Environment Variables

```env
DATABASE_URL="postgresql://username:password@host/dbname?sslmode=require"
AUTH_SECRET="your_random_secret_string"
NEXTAUTH_URL="https://your-app.vercel.app"
```

🤝 Contributing

This is a portfolio project. Feel free to fork and adapt for your own needs!

📄 License

MIT License - feel free to use this project for your portfolio.

🎓 Learning Resources

· Next.js Documentation
· Prisma Documentation
· Tailwind CSS Documentation

---

Built with ❤️ using Next.js, TypeScript, and Tailwind CSS



