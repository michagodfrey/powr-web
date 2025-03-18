# Project Structure

## Current directory layout 17 March 2025 for the Progressive Overload Workout Recorder (POWR)

project-root/
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
│ │ ├── contexts/ # React contexts (Auth, Theme, etc.)
│ │ ├── pages/ # Page-level components
│ │ │ ├── Settings.tsx # User settings page
│ │ │ ├── ExerciseDetail.tsx # Exercise details and tracking
│ │ │ ├── Dashboard.tsx # Main dashboard view
│ │ │ └── Login.tsx # Login page
│ │ ├── routes/ # Route definitions and configuration
│ │ ├── types/ # TypeScript type definitions
│ │ ├── assets/ # Static assets
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
│ │ ├── models/ # Sequelize models
│ │ │ ├── User.ts # User model
│ │ │ ├── WorkoutSession.ts # Workout session model
│ │ │ ├── Session.ts # Auth session model
│ │ │ ├── Exercise.ts # Exercise model
│ │ │ ├── Set.ts # Set model
│ │ │ └── index.ts # Model associations
│ │ ├── routes/ # API route definitions
│ │ ├── utils/ # Utility functions
│ │ ├── scripts/ # Utility scripts
│ │ ├── db/ # Database setup and migrations
│ │ ├── app.ts # Express application setup
│ │ └── index.ts # Server entry point
│ ├── scripts/ # Database and utility scripts
│ ├── .env # Server environment variables
│ ├── .env.example # Environment variables template
│ └── tsconfig.json # TypeScript configuration
│
├── docs/ # Project documentation
│ ├── PRD/ # Product Requirements Documents
│ │ ├── authentication.md
│ │ ├── database-schema.md
│ │ ├── security-requirements.md
│ │ └── ... other specification files
│ └── learnings.md # Development learnings and decisions
│
├── .gitignore # Git ignore rules
└── README.md # Project overview and setup instructions

**Key Changes from Original Structure**:

1. **Frontend (client/)**:

   - Detailed component organization with specific responsibilities
   - Comprehensive auth module with context and protected routes
   - Organized page components with clear purposes
   - CSS organization with global and component-specific styles

2. **Backend (server/)**:

   - Detailed controller organization by feature
   - Comprehensive middleware setup for error handling, validation, and auth
   - Complete model structure with associations
   - Clear separation of concerns in file organization

3. **Documentation (docs/)**:

   - Organized PRD files in dedicated directory
   - Added learnings.md for development decisions
   - Improved documentation organization

4. **Configuration**:
   - Added environment variable templates
   - Added TypeScript configurations
   - Added build and development tooling
