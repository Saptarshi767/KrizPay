# KrizPay - Crypto Payment Gateway

## Overview

KrizPay is a full-stack cryptocurrency payment gateway that enables seamless payments across multiple blockchains (Ethereum, Polygon, BSC, Flow) and conversion to Indian Rupees via UPI. The application provides a modern, mobile-first interface for scanning QR codes, managing crypto wallets, and processing cross-chain transactions.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript in a single-page application (SPA) model
- **Styling**: Tailwind CSS with shadcn/ui component library for consistent design
- **State Management**: React Context for wallet state, TanStack Query for server state
- **Routing**: Client-side navigation using state-based section switching
- **Build Tool**: Vite for fast development and optimized production builds

The frontend follows a component-based architecture with clear separation between pages, components, and utility functions. The application uses a mobile-first responsive design approach.

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **API Pattern**: RESTful API design with clear endpoint separation
- **Development**: Hot reload using Vite middleware in development mode
- **Production**: Compiled and bundled using esbuild

### Database Layer
- **ORM**: Drizzle ORM for type-safe database operations
- **Database**: PostgreSQL (configured via Drizzle with Neon Database serverless)
- **Schema**: Strongly typed schema with automatic validation using Zod
- **Storage Interface**: Abstract storage interface allowing for multiple implementations (currently using in-memory storage for development)

## Key Components

### Wallet Integration
- **Multi-chain Support**: Ethereum, Polygon, BSC, and Flow blockchain integration
- **Wallet Providers**: MetaMask, WalletConnect, and Blocto wallet support
- **State Management**: Centralized wallet context with connection status, balance, and network information
- **Transaction Handling**: Real-time transaction monitoring and status updates

### QR Code Processing
- **Scanner Interface**: Camera-based QR code scanning with manual input fallback
- **Format Support**: UPI payment QR codes and cryptocurrency addresses
- **Validation**: Input validation and format detection for different QR code types
- **Processing Flow**: Automatic routing to appropriate payment flow based on QR code type

### Payment Processing
- **Crypto-to-Crypto**: Direct blockchain transactions between addresses
- **Crypto-to-UPI**: Conversion flow from cryptocurrency to Indian Rupee via UPI
- **Real-time Pricing**: Live cryptocurrency price feeds with automatic conversion rates
- **Transaction Tracking**: Comprehensive transaction history and status monitoring

### Admin Dashboard
- **Analytics**: Transaction volume, user metrics, and system statistics
- **Monitoring**: Real-time transaction status and system health
- **Management**: User management and transaction oversight capabilities

## Data Flow

1. **User Authentication**: Wallet connection establishes user identity
2. **QR Scanning**: Camera or manual input captures payment destination
3. **Payment Intent**: System creates payment intent with amount and destination
4. **Price Calculation**: Real-time cryptocurrency prices determine conversion rates
5. **Transaction Execution**: Blockchain transaction initiated through connected wallet
6. **Status Tracking**: Real-time updates on transaction confirmation status
7. **Settlement**: For UPI payments, automatic settlement to merchant account

## External Dependencies

### Blockchain Integration
- **Ethers.js**: Ethereum and EVM-compatible blockchain interactions
- **Web3 Libraries**: Multi-chain wallet connection and transaction management
- **Flow FCL**: Flow blockchain integration for Flow-based transactions

### UI Components
- **Radix UI**: Accessible, unstyled component primitives
- **Shadcn/ui**: Pre-built component library with consistent design system
- **Lucide React**: Icon library for consistent iconography

### Data and APIs
- **TanStack Query**: Server state management and caching
- **Cryptocurrency Pricing**: Integration with price feed APIs for real-time rates
- **UPI Integration**: Simulated UPI payment processing (ready for real API integration)

### Development Tools
- **Drizzle Kit**: Database schema management and migrations
- **TypeScript**: Type safety across the entire application
- **Vite**: Fast development server and optimized production builds

## Deployment Strategy

### Development Environment
- **Replit Integration**: Optimized for Replit development environment
- **Hot Reload**: Vite middleware provides instant updates during development
- **Environment Variables**: Database and API configuration through environment variables

### Production Deployment
- **Build Process**: Separate frontend (Vite) and backend (esbuild) build processes
- **Static Assets**: Frontend built to static files served by Express
- **Database**: PostgreSQL database with connection pooling
- **Environment**: Production-ready configuration with proper error handling

### Database Management
- **Migrations**: Drizzle migrations for schema versioning
- **Seeding**: Automated data seeding for development and testing
- **Backup**: Database backup and recovery strategies for production

The application is designed to be easily deployable on Replit while maintaining production-ready architecture patterns for scaling to other platforms when needed.