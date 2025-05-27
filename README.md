# OMS (Outreach Management System)

## Overview

OMS (Outreach Management System) is a comprehensive platform designed to streamline guest posting, backlinking, and SEO campaigns. It centralizes order tracking, domain metrics, content management, and performance analytics, enabling efficient workflows, improved collaboration, and measurable results for digital marketing teams.

## Features

- **Client Management**: Track client information, projects, and payment status
- **Vendor Management**: Manage relationships with content publishers and website owners
- **Site Database**: Comprehensive database of websites with detailed metrics (DA, PA, traffic, etc.)
- **Order Tracking**: End-to-end order management from creation to publication
- **Payment Tracking**: Monitor client payments and vendor payouts
- **Performance Analytics**: Track campaign performance with integrated monitoring
- **User Role Management**: Granular permission system for team collaboration

## Tech Stack

### Frontend
- React 18 with TypeScript
- Vite for build tooling
- TailwindCSS for styling
- Recoil for state management
- React Router for navigation
- AG Grid for data tables
- Radix UI for accessible components

### Backend
- Node.js with Express
- TypeScript
- Prisma ORM
- PostgreSQL database
- JWT authentication
- Zod for validation
- Winston/Pino for logging

### Shared
- TypeScript types shared between frontend and backend
- Monorepo structure with workspace packages

### DevOps
- Docker containerization
- Docker Compose for local development
- Grafana and Loki for monitoring and logging

## Project Structure

```
├── client/               # Frontend React application
│   ├── src/             # Source code
│   │   ├── components/  # Reusable UI components
│   │   ├── pages/       # Application pages
│   │   ├── hooks/       # Custom React hooks
│   │   ├── store/       # Recoil state management
│   │   └── utils/       # Utility functions
├── server/              # Backend Express application
│   ├── src/             # Source code
│   │   ├── api/         # API entry points
│   │   ├── controllers/ # Request handlers
│   │   ├── middlewares/ # Express middlewares
│   │   ├── routers/     # API routes
│   │   └── utils/       # Utility functions
│   └── prisma/          # Database schema and migrations
└── shared/              # Shared TypeScript types
    └── src/
        └── types/       # Common type definitions
```

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Docker and Docker Compose (for containerized development)
- PostgreSQL (if running locally without Docker)

### Installation

1. Clone the repository

```bash
git clone <repository-url>
cd outreach-app
```

2. Install dependencies

```bash
npm install
```

3. Set up environment variables

Create `.env` files in both client and server directories based on the provided examples.

4. Start the development environment with Docker

```bash
docker-compose up
```

### Development

#### Running the client

```bash
cd client
npm run dev
```

#### Running the server

```bash
cd server
npm run dev
```

#### Building shared types

```bash
cd shared
npm run build
```

## Deployment

The application can be deployed using Docker containers:

```bash
docker-compose up -d
```

This will start the client, server, Loki (for logging), and Grafana (for monitoring) services.

## Authors

- EMIAC Technologies Private Limited
