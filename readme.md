# CS-Truck Ordering System

## Overview

A modern full-stack food truck ordering application that allows customers to browse coffee, breakfast items, and pastries, place orders through Razorpay payments, and provides an admin interface for order management. The application features a React frontend with TypeScript, Express backend, Neon PostgreSQL database with Drizzle ORM, and Firebase authentication with multiple sign-in options.

## 🚀 Key Features

### Customer Experience
- **Multiple Auth Options**: Google OAuth, Email Magic Link authentication
- **Menu Browsing**: Categorized product listings with real-time availability
- **Smart Cart**: Persistent cart with local storage and real-time total calculation
- **Rewards Program**: Earn 1 point per ₹10 spent (10 points = ₹1)
- **Order Tracking**: Real-time status updates from order to pickup
- **Responsive Design**: Optimized for both mobile and desktop devices

### Admin Dashboard
- **Order Management**: Real-time order tracking with status updates
- **Inventory Control**: Product management with availability toggles
- **Customer Analytics**: User engagement and sales tracking
- **Multi-status Orders**: pending → preparing → ready → completed → cancelled

## System Architecture

### Frontend Architecture
- **React with TypeScript**: Modern component-based UI built with React 18 and TypeScript for type safety
- **ShadCN UI Components**: Comprehensive design system using Radix UI primitives with Tailwind CSS styling
- **Wouter Router**: Lightweight client-side routing for navigation between pages (landing, home, checkout, admin)
- **TanStack Query**: Server state management for API calls with caching and background updates
- **Responsive Design**: Mobile-first approach with Tailwind CSS for cross-device compatibility
- **Framer Motion**: Smooth animations and transitions throughout the app

### Backend Architecture
- **Express.js Server**: RESTful API server with middleware for JSON parsing, logging, and error handling
- **Session Management**: Express sessions with memory store for user state persistence
- **Route Structure**: Organized API endpoints for authentication, products, orders, and payments
- **Error Handling**: Centralized error handling with proper HTTP status codes and JSON responses
- **WebSocket Support**: Real-time updates for order status changes

### Data Storage
- **Neon PostgreSQL**: Serverless PostgreSQL database with connection pooling
- **Drizzle ORM**: Type-safe database operations with schema-first approach
- **Database Schema**: 
  - Users table with Firebase UID, profile data, and points system
  - Products table with categories (coffee, breakfast, pastries) and availability
  - Orders and order items with relational structure and customer details
  - Sessions table for authentication state

### Authentication System
- **Firebase Authentication**: Multi-provider authentication system
  - **Google OAuth**: One-click sign-in with Google accounts
  - **Email Magic Links**: Passwordless authentication via email
  - **Phone OTP**: SMS-based verification with reCAPTCHA
- **Session Management**: Secure server-side sessions with Firebase token validation
- **Route Protection**: Middleware to protect authenticated routes and admin access

### Payment Processing
- **Razorpay Integration**: Secure payment processing for Indian market
- **Payment Intent Flow**: Server-side order creation with client-side confirmation
- **Order Management**: Automatic order creation upon successful payment with unique order numbers
- **Dual Payment Support**: Both Razorpay and Stripe configurations available

### Admin Interface
- **Order Management**: Real-time order tracking with status updates (pending, preparing, ready, completed)
- **Product Management**: CRUD operations for menu items with category organization
- **Dashboard Views**: Tabbed interface for orders and products with search and filtering capabilities

## 🛠️ Tech Stack & Dependencies

### Core Framework Dependencies
- **React 18 + TypeScript**: Modern component-based UI with full type safety
- **Express.js**: Node.js web framework with comprehensive middleware ecosystem
- **Drizzle ORM**: Type-safe PostgreSQL ORM with migration support
- **Vite**: Fast build tool with hot module replacement for development

### UI and Styling
- **ShadCN/UI**: Pre-built component library based on Radix UI primitives
- **Tailwind CSS**: Utility-first CSS framework with custom design tokens
- **Radix UI**: Headless UI components for accessibility and behavior
- **Framer Motion**: Smooth animations and transitions
- **Lucide React**: Beautiful SVG icon library

### Database and Authentication
- **Neon PostgreSQL**: Serverless PostgreSQL database with connection pooling
- **Firebase Authentication**: Multi-provider auth (Google, Email, Phone)
- **Express Sessions**: Secure session management with PostgreSQL storage
- **connect-pg-simple**: PostgreSQL session store for Express

### Payment Processing
- **Razorpay**: Primary payment gateway for Indian market
- **Stripe**: Secondary payment option with React integration
- **Stripe Elements**: Pre-built payment UI components with PCI compliance

### State Management and API
- **TanStack Query**: Server state management with caching and synchronization
- **Wouter**: Lightweight routing library for single-page application navigation
- **Zod**: Runtime type validation for API schemas and form validation

### Communication & Notifications
- **EmailJS**: Client-side email service integration
- **Nodemailer**: Server-side email sending capabilities
- **WebSocket (ws)**: Real-time communication for order updates

### Development Tools
- **TypeScript**: Static type checking across frontend and backend
- **ESBuild**: Fast JavaScript bundler for production builds
- **Cross-env**: Cross-platform environment variable management
- **Drizzle Kit**: Database migration and schema management

## 📁 Project Structure

```
TruckSnacks/
├── client/src/
│   ├── components/        # Reusable UI components
│   │   ├── ui/           # ShadCN UI components
│   │   ├── cart-modal.tsx
│   │   ├── login-modal.tsx
│   │   └── product-card.tsx
│   ├── pages/            # Application pages
│   │   ├── home.tsx
│   │   ├── admin.tsx
│   │   ├── checkout.tsx
│   │   └── landing.tsx
│   ├── hooks/            # Custom React hooks
│   │   ├── useAuth.ts
│   │   ├── usePhoneAuth.ts
│   │   └── useOrders.ts
│   ├── lib/              # Utilities and configurations
│   │   ├── firebase.ts
│   │   ├── constants.ts
│   │   └── utils.ts
│   └── App.tsx           # Main application component
├── server/
│   ├── index.ts          # Express server entry point
│   ├── routes.ts         # API route handlers
│   ├── razorpayRoutes.ts # Payment processing
│   └── db.ts            # Database connection
├── shared/
│   └── schema.ts         # Shared database schema and types
└── package.json          # Dependencies and scripts
```
## 📄 License

This project is licensed under the MIT License.

---

*Built with ❤️ for the CS-Truck food truck community*
