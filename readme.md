# CS-Truck Ordering System

## Overview

A full-stack food truck ordering application that allows customers to browse coffee, breakfast items, and pastries, place orders through Stripe payments, and provides an admin interface for order management. The application features a React frontend with TypeScript, Express backend, PostgreSQL database with Drizzle ORM, and Replit authentication.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **React with TypeScript**: Modern component-based UI built with React 18 and TypeScript for type safety
- **ShadCN UI Components**: Comprehensive design system using Radix UI primitives with Tailwind CSS styling
- **Wouter Router**: Lightweight client-side routing for navigation between pages (landing, home, checkout, admin)
- **TanStack Query**: Server state management for API calls with caching and background updates
- **Responsive Design**: Mobile-first approach with Tailwind CSS for cross-device compatibility

### Backend Architecture
- **Express.js Server**: RESTful API server with middleware for JSON parsing, logging, and error handling
- **Session Management**: Express sessions with PostgreSQL storage for user state persistence
- **Route Structure**: Organized API endpoints for authentication, products, orders, and payments
- **Error Handling**: Centralized error handling with proper HTTP status codes and JSON responses

### Data Storage
- **PostgreSQL Database**: Primary data store with Neon serverless database integration
- **Drizzle ORM**: Type-safe database operations with schema-first approach
- **Database Schema**: 
  - Users table with authentication and profile data
  - Products table with categories (coffee, breakfast, pastries)
  - Orders and order items with relational structure
  - Sessions table for authentication state

### Authentication System
- **Replit Auth Integration**: OAuth-based authentication using Replit's OIDC provider
- **Passport.js**: Authentication middleware with OpenID Connect strategy
- **Session-based Auth**: Server-side sessions with secure cookie configuration
- **Route Protection**: Middleware to protect authenticated routes and admin access

### Payment Processing
- **Stripe Integration**: Secure payment processing with Stripe Elements
- **Payment Intent Flow**: Server-side payment intent creation with client-side confirmation
- **Order Management**: Automatic order creation upon successful payment with unique order numbers

### Admin Interface
- **Order Management**: Real-time order tracking with status updates (pending, preparing, ready, completed)
- **Product Management**: CRUD operations for menu items with category organization
- **Dashboard Views**: Tabbed interface for orders and products with search and filtering capabilities

## External Dependencies

### Core Framework Dependencies
- **React Ecosystem**: React 18 with TypeScript, Vite build tool, and modern JSX transformation
- **Express.js**: Node.js web framework with middleware ecosystem
- **Drizzle ORM**: Type-safe PostgreSQL ORM with migration support

### UI and Styling
- **ShadCN/UI**: Pre-built component library based on Radix UI primitives
- **Tailwind CSS**: Utility-first CSS framework with custom design tokens
- **Radix UI**: Headless UI components for accessibility and behavior

### Database and Authentication
- **Neon Database**: Serverless PostgreSQL provider with connection pooling
- **Replit Authentication**: OAuth provider for user management
- **Passport.js**: Authentication middleware with OpenID Connect support

### Payment Processing
- **Stripe**: Payment processing platform with React integration
- **Stripe Elements**: Pre-built payment UI components with PCI compliance

### Development Tools
- **TypeScript**: Static type checking across frontend and backend
- **Vite**: Fast build tool with hot module replacement
- **ESBuild**: JavaScript bundler for production builds
- **Replit Development**: Integrated development environment with live preview

### State Management and API
- **TanStack Query**: Server state management with caching and synchronization
- **Wouter**: Lightweight routing library for single-page application navigation
- **Zod**: Runtime type validation for API schemas and form validation