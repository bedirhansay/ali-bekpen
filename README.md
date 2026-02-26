# Kocaman Muhasebe - Accounting Dashboard

Modern accounting dashboard built with React, TypeScript, and Firebase. Features real-time data synchronization and comprehensive accounting management.

![alt text](public/images/shadcn-admin.png)

A complete accounting solution with customer management, product catalog, purchase/sales tracking, payment processing, and ledger management. Built with modern web technologies and Firebase backend.

## Features

- **Real-time Data**: Firebase Firestore integration for live data updates
- **Customer Management**: Complete customer database with contact information
- **Product Catalog**: Inventory management with SKU tracking
- **Purchase/Sales Tracking**: Transaction management with line items
- **Payment Processing**: Income and expense tracking
- **Ledger Management**: Automated double-entry bookkeeping
- **Responsive Design**: Mobile-first approach with accessibility
- **Dark/Light Mode**: Theme switching support
- **Empty States**: User-friendly empty states when no data exists

## Tech Stack

**Frontend:** React 19 + TypeScript + Vite
**UI Framework:** [ShadcnUI](https://ui.shadcn.com) (TailwindCSS + RadixUI)
**Backend:** Firebase (Firestore, Authentication, Storage)
**State Management:** TanStack Query + Zustand
**Routing:** [TanStack Router](https://tanstack.com/router/latest)
**Forms:** React Hook Form + Zod validation
**Icons:** [Tabler Icons](https://tabler.io/icons)
**Authentication:** Firebase Auth
**Database:** Firestore (NoSQL)
**Deployment:** Netlify

## Setup

### Prerequisites

- Node.js 18+
- Firebase project
- Netlify account (for deployment)

### Firebase Setup

1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com)
2. Enable Firestore Database
3. Enable Authentication
4. Copy your Firebase config to `.env` file:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd kocaman-muhasebe

# Install dependencies
pnpm install

# Start development server
pnpm run dev
```

### Database Rules

The application uses Firestore with the following security rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only access their own data
    match /{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.tenantId;
    }
  }
}
```

## Data Management

This application uses **real Firebase data only**. No mock data, seed data, or fake data is included. All components show appropriate empty states when no data exists, encouraging users to add their first records.

### Empty States

- **Products**: "Henüz ürün eklenmemiş. İlk ürününüzü ekleyin."
- **Customers**: "Henüz müşteri eklenmemiş. İlk müşterinizi ekleyin."
- **Suppliers**: "Henüz tedarikçi eklenmemiş. İlk tedarikçinizi ekleyin."
- **Tasks**: "Henüz görev yok. İlk görevinizi oluşturmak için yukarıdaki butona tıklayın."

## Sponsoring this project ❤️

If you find this project helpful or use this in your own work, consider [sponsoring me](https://github.com/sponsors/satnaing) to support development and maintenance. You can [buy me a coffee](https://buymeacoffee.com/satnaing) as well. Don’t worry, every penny helps. Thank you! 🙏

For questions or sponsorship inquiries, feel free to reach out at [contact@satnaing.dev](mailto:contact@satnaing.dev).

### Current Sponsor

- [Clerk](https://go.clerk.com/GttUAaK) - for backing the implementation of Clerk in this project

## Author

Crafted with 🤍 by [@satnaing](https://github.com/satnaing)

## License

Licensed under the [MIT License](https://choosealicense.com/licenses/mit/)
