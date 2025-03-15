# Project Structure

## Current directory layout 15 March 2025 for the Progressive Overload Workout Recorder (POWR)

project-root/
├── client/ # Frontend React + TypeScript application
│ ├── src/
│ │ ├── auth/ # Authentication-related components and utilities
│ │ ├── components/ # Reusable UI components
│ │ ├── contexts/ # React contexts (Auth, Theme, etc.)
│ │ ├── pages/ # Page-level components
│ │ ├── routes/ # Route definitions and configuration
│ │ ├── types/ # TypeScript type definitions
│ │ ├── assets/ # Static assets
│ │ ├── App.tsx # Root component
│ │ └── main.tsx # Application entry point
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
│ │ ├── middleware/ # Custom middleware
│ │ ├── models/ # Sequelize models
│ │ ├── routes/ # API route definitions
│ │ ├── test/ # Test files
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

   - Added TypeScript configuration
   - Added Vite and Tailwind configurations
   - Organized auth-specific code in dedicated directory
   - Added contexts for state management
   - Added routes directory for navigation

2. **Backend (server/)**:

   - Moved source code to src/ directory
   - Added test directory for testing
   - Added scripts directory for database management
   - Added middleware directory
   - Separated app.ts and index.ts

3. **Documentation (docs/)**:

   - Organized PRD files in dedicated directory
   - Added learnings.md for development decisions
   - Improved documentation organization

4. **Configuration**:
   - Added environment variable templates
   - Added TypeScript configurations
   - Added build and development tooling

## Proposed additional folders for completed app

project-root/
├── client/
│   ├── src/
│   │   ├── analytics/          # Analytics and monitoring integration
│   │   │   ├── sentry.ts      # Error tracking
│   │   │   └── metrics.ts     # Performance metrics
│   │   ├── hooks/             # Custom React hooks
│   │   ├── utils/             # Utility functions
│   │   │   ├── validation.ts  # Form validation
│   │   │   └── formatting.ts  # Data formatting
│   │   ├── services/          # API service layer
│   │   │   ├── api.ts        # Base API configuration
│   │   │   ├── workout.ts    # Workout-related API calls
│   │   │   └── exercise.ts   # Exercise-related API calls
│   │   └── constants/         # Application constants
│   └── tests/                 # Frontend tests
│       ├── unit/             # Unit tests
│       └── integration/      # Integration tests
│
├── server/
│   ├── src/
│   │   ├── logging/           # Logging configuration
│   │   │   ├── winston.ts    # Logger setup
│   │   │   └── morgan.ts     # HTTP request logging
│   │   ├── monitoring/        # Monitoring setup
│   │   │   ├── sentry.ts     # Error tracking
│   │   │   └── metrics.ts    # Performance metrics
│   │   ├── utils/            # Utility functions
│   │   │   ├── validation.ts # Input validation
│   │   │   └── formatting.ts # Data formatting
│   │   ├── services/         # Business logic layer
│   │   │   ├── workout.ts    # Workout-related logic
│   │   │   └── exercise.ts   # Exercise-related logic
│   │   └── types/            # TypeScript type definitions
│   ├── migrations/           # Database migrations
│   │   ├── schema/          # Schema migrations
│   │   └── data/           # Data migrations
│   └── tests/               # Backend tests
│       ├── unit/           # Unit tests
│       ├── integration/    # Integration tests
│       └── fixtures/       # Test data
│
├── shared/                  # Shared code between client and server
│   ├── types/              # Shared TypeScript types
│   ├── constants/          # Shared constants
│   └── validation/         # Shared validation schemas
│
└── scripts/                # Project-wide scripts
    ├── deployment/         # Deployment scripts
    ├── database/          # Database management scripts
    └── monitoring/        # Monitoring setup scripts
