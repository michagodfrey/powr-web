# Project Structure

## Current directory layout for the Progressive Overload Workout Recorder (POWR) as of 04/05/2025

```bash
project-root/
├── .cursor/                        # Cursor IDE configuration
├── client/                         # Frontend React + TypeScript application
│   ├── src/
│   │   ├── auth/                   # Authentication-related components and utilities
│   │   │   ├── AuthContext.tsx     # Authentication context provider
│   │   │   ├── AuthCallback.tsx    # OAuth callback handler
│   │   │   └── ProtectedRoute.tsx  # Route protection wrapper
│   │   ├── components/             # Reusable UI components
│   │   │   ├── ExerciseForm.tsx
│   │   │   ├── VolumeChart.tsx
│   │   │   ├── WorkoutSet.tsx
│   │   │   ├── Header.tsx
│   │   │   ├── ConfirmDialog.tsx
│   │   │   ├── Layout.tsx
│   │   │   └── ErrorToast.tsx
│   │   ├── contexts/               # React contexts (Theme, Preferences, etc.)
│   │   │   └── PreferencesContext.tsx
│   │   ├── pages/                  # Page-level components
│   │   │   ├── Settings.tsx
│   │   │   ├── ExerciseDetail.tsx
│   │   │   ├── Dashboard.tsx
│   │   │   └── Login.tsx
│   │   ├── routes/                 # Route definitions and configuration
│   │   │   └── AppRoutes.tsx
│   │   ├── types/                  # TypeScript type definitions
│   │   │   └── index.ts
│   │   ├── utils/                  # Utility functions
│   │   │   ├── api.ts
│   │   │   ├── tokenUtils.ts
│   │   │   ├── api.d.ts
│   │   │   └── volumeCalculation.ts
│   │   ├── App.tsx                 # Root component
│   │   ├── main.tsx                # Application entry point
│   │   ├── index.ts                # Exports and configurations
│   │   ├── App.css                 # Root component styles
│   │   ├── index.css               # Global styles
│   │   └── vite-env.d.ts           # Vite environment types
│   ├── public/                     # Public assets
│   ├── index.html                  # HTML entry point
│   ├── vite.config.ts              # Vite configuration
│   ├── tailwind.config.js          # Tailwind CSS configuration
│   ├── postcss.config.js           # PostCSS configuration
│   ├── eslint.config.js            # ESLint configuration
│   ├── tsconfig.json               # TypeScript configuration
│   ├── tsconfig.app.json           # App-specific TypeScript config
│   └── tsconfig.node.json          # Node-specific TypeScript config
│
├── server/                         # Backend Express + TypeScript application
│   ├── src/
│   │   ├── config/                 # Configuration files
│   │   │   ├── validateEnv.ts
│   │   │   ├── passport.ts
│   │   │   └── database.ts
│   │   ├── controllers/            # Request handlers
│   │   │   ├── workoutController.ts
│   │   │   ├── exportController.ts
│   │   │   ├── authController.ts
│   │   │   └── exerciseController.ts
│   │   ├── middleware/             # Custom middleware
│   │   │   ├── errorHandler.ts
│   │   │   ├── validation.ts
│   │   │   └── auth.ts
│   │   ├── models/                 # Database models
│   │   │   ├── User.ts
│   │   │   ├── WorkoutSession.ts
│   │   │   ├── Session.ts
│   │   │   ├── Set.ts
│   │   │   ├── Exercise.ts
│   │   │   └── index.ts
│   │   ├── routes/                 # API route definitions
│   │   │   ├── exportRoutes.ts
│   │   │   ├── workoutRoutes.ts
│   │   │   ├── exerciseRoutes.ts
│   │   │   └── authRoutes.ts
│   │   ├── utils/                  # Utility functions
│   │   │   └── volumeCalculation.ts
│   │   ├── scripts/                # Utility scripts
│   │   │   ├── cleanup-sessions.ts
│   │   │   └── setup-database.ts
│   │   ├── app.ts                  # Express application setup
│   │   └── index.ts                # Server entry point
│   ├── __tests__/                  # Backend tests
│   │   ├── security/
│   │   ├── integration/
│   │   ├── auth/
│   │   └── setup/
│   ├── jest.config.ts              # Jest test configuration
│   ├── package.json                # Backend package configuration
│   ├── package-lock.json           # Backend dependency lock file
│   └── tsconfig.json               # TypeScript configuration
│
├── docs/                           # Project documentation
│   ├── PRD/                        # Product Requirements Documents
│   │   ├── architecture/           # Architecture specifications
│   │   ├── implementation/         # Implementation details
│   │   ├── planning/               # Planning documents
│   │   ├── requirements/           # Requirements documents
│   │   └── features/               # Feature specifications
│   ├── learnings/                  # Development learnings and decisions
│   ├── screenshots/                # Application screenshots
│   ├── authentication-migration-checklist.md
│   └── learnings from 30042025.md
│
├── node_modules/                   # Project dependencies
├── package.json                    # Project configuration
├── package-lock.json               # Dependency lock file
├── .gitignore                      # Git ignore rules
└── README.md                       # Project overview and setup instructions
```
