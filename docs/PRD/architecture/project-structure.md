# Project Structure

## Current directory layout for the Progressive Overload Workout Recorder (POWR)

```bash
project-root/
├── .cursor/ # Cursor IDE configuration
├── client/ # Frontend React + TypeScript application
│ ├── src/
│ │ ├── auth/ # Authentication-related components and utilities
│ │ │ ├── AuthContext.tsx # Authentication context provider
│ │ │ ├── AuthCallback.tsx # OAuth callback handler
│ │ │ └── ProtectedRoute.tsx # Route protection wrapper
│ │ ├── components/ # Reusable UI components
│ │ │ ├── ExerciseForm.tsx # Exercise creation/editing form
│ │ │ ├── VolumeChart.tsx # Volume visualization component
│ │ │ ├── WorkoutSet.tsx # Individual set management
│ │ │ ├── Header.tsx # Application header
│ │ │ ├── ConfirmDialog.tsx # Confirmation modal
│ │ │ ├── Layout.tsx # Common layout wrapper
│ │ │ └── ErrorToast.tsx # Error notification component
│ │ ├── contexts/ # React contexts (Theme, etc.)
│ │ ├── pages/ # Page-level components
│ │ │ ├── Settings.tsx # User settings page
│ │ │ ├── ExerciseDetail.tsx # Exercise details and tracking
│ │ │ ├── Dashboard.tsx # Main dashboard view
│ │ │ └── Login.tsx # Login page
│ │ ├── routes/ # Route definitions and configuration
│ │ ├── types/ # TypeScript type definitions
│ │ ├── utils/ # Utility functions
│ │ ├── App.tsx # Root component
│ │ ├── main.tsx # Application entry point
│ │ ├── index.ts # Exports and configurations
│ │ ├── App.css # Root component styles
│ │ └── index.css # Global styles
│ ├── public/ # Public assets
│ ├── .env # Environment variables
│ ├── index.html # HTML entry point
│ ├── vite.config.ts # Vite configuration
│ ├── tailwind.config.js # Tailwind CSS configuration
│ └── tsconfig.json # TypeScript configuration
│
├── server/ # Backend Express + TypeScript application
│ ├── src/
│ │ ├── config/ # Configuration files
│ │ ├── controllers/ # Request handlers
│ │ │ ├── workoutController.ts # Workout management
│ │ │ ├── exportController.ts # Data export functionality
│ │ │ ├── authController.ts # Authentication handling
│ │ │ └── exerciseController.ts # Exercise management
│ │ ├── middleware/ # Custom middleware
│ │ │ ├── errorHandler.ts # Global error handling
│ │ │ ├── validation.ts # Request validation
│ │ │ └── auth.ts # Authentication middleware
│ │ ├── models/ # Database models
│ │ ├── routes/ # API route definitions
│ │ ├── utils/ # Utility functions
│ │ ├── scripts/ # Utility scripts
│ │ ├── db/ # Database setup and migrations
│ │ ├── app.ts # Express application setup
│ │ └── index.ts # Server entry point
│ ├── .env # Server environment variables
│ ├── .env.example # Environment variables template
│ └── tsconfig.json # TypeScript configuration
│
├── docs/ # Project documentation
│ ├── PRD/ # Product Requirements Documents
│ │ ├── architecture/ # Architecture specifications
│ │ ├── implementation/ # Implementation details
│ │ └── planning/ # Planning documents
│ ├── learnings/ # Development learnings and decisions
│ └── screenshots/ # Application screenshots
│
├── node_modules/ # Project dependencies
├── package.json # Project configuration
├── package-lock.json # Dependency lock file
├── .gitignore # Git ignore rules
└── README.md # Project overview and setup instructions

**Key Changes from Original Structure**:

1. **Root Level**:
   - Added `.cursor/` directory for Cursor IDE configuration
   - Added root-level `node_modules/` and package files

2. **Frontend (client/)**:
   - Added `utils/` directory
   - Simplified component structure
   - Added `vite-env.d.ts`

3. **Backend (server/)**:
   - Reorganized model structure
   - Added `scripts/` and `db/` directories
   - Simplified controller organization

4. **Documentation (docs/)**:
   - Added `screenshots/` directory
   - Reorganized PRD structure into subdirectories
   - Added `learnings/` directory

5. **Configuration**:
   - Added environment files
   - Added build and development configurations
```
