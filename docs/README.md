# Bus Ticket Booking System - Documentation

Welcome to the comprehensive documentation for the Bus Ticket Booking System.

## 📚 Documentation Structure

This documentation is organized into two main sections:

### 👨‍💻 [Developer Documentation](./developer/)

Technical documentation for developers working on or integrating with the system:

- [Getting Started](./developer/01-getting-started.md) - Quick start guide
- [Architecture Overview](./developer/02-architecture.md) - System architecture and design
- [Local Development Setup](./developer/03-setup-local.md) - Setting up local environment
- [Docker Deployment](./developer/04-setup-docker.md) - Running with Docker
- [Database Schema](./developer/05-database-schema.md) - Database design and relationships
- [API Reference](./developer/06-api-reference.md) - Complete API documentation
- [Authentication](./developer/07-authentication.md) - Auth system and security
- [Microservices](./developer/08-microservices.md) - Microservices architecture
- [Redis Caching](./developer/09-redis-caching.md) - Caching strategies
- [Testing](./developer/10-testing.md) - Testing guidelines
- [Deployment](./developer/11-deployment.md) - Production deployment guide

### 👥 [User Documentation](./user/)

End-user guides for passengers using the booking system:

- [User Guide](./user/01-user-guide.md) - Complete user guide
- [Booking Guide](./user/02-booking-guide.md) - Step-by-step booking process
- [Guest Checkout](./user/03-guest-checkout.md) - Booking without registration
- [Payment Methods](./user/04-payment-methods.md) - Available payment options

## 🎯 Project Overview

The Bus Ticket Booking System is an enterprise-grade platform built with a microservices architecture. Key features include:

- **Guest Checkout** - Book tickets without registration
- **Real-time Seat Selection** - Interactive seat maps with Redis-based locking
- **E-Ticket Generation** - Automated PDF generation with QR codes
- **Multiple Payment Gateways** - PayOS, Momo, ZaloPay, Stripe support
- **Advanced Search** - Filter by price, time, bus type, amenities
- **Admin Dashboard** - Fleet management, analytics, and reporting
- **Chatbot Integration** - AI-powered booking assistance

## 🏗️ Technology Stack

- **Frontend**: React, TypeScript, Vite, TailwindCSS, Zustand
- **Backend**: Node.js, Express.js, PostgreSQL, Redis
- **Infrastructure**: Docker, Docker Compose
- **Payment**: PayOS, Momo, ZaloPay, Stripe
- **Notifications**: SendGrid
- **Authentication**: JWT, Google OAuth

## 📝 Documentation Version

Last Updated: January 4, 2026
System Version: 1.0.0

## 🤝 Contributing

For contribution guidelines and code style standards, please refer to the [Development Guidelines](./developer/01-getting-started.md#development-workflow).

## 📧 Contact

For questions or support, please refer to the project's issue tracker or contact the development team.
