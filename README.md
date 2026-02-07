# ShopLedger - Product Stock Management & Billing System

A comprehensive multi-merchant product stock management and billing system built with Next.js, MongoDB, and TypeScript.

## Features

### 🏪 Multi-Merchant Support
- Each merchant has their own shop with isolated data
- Staff management with role-based access control
- Customizable shop settings

### 📦 Product Management
- Add, edit, and delete products
- Automatic SKU generation
- QR code generation for quick billing
- Category organization
- Low stock alerts

### 💳 Smart Billing (POS)
- Quick product search
- QR code scanning
- Cart management with quantity controls
- Automatic tax and discount calculation
- Multiple payment methods (Cash, Card, UPI, Credit)
- Invoice generation

### 📊 Real-time Analytics
- Revenue trends and charts
- Top selling products
- Sales by category
- Dashboard with key metrics

### 👥 Staff Management
- Add staff members with different roles
- Role-based access control:
  - **Manager**: Full access except billing
  - **Cashier**: Billing and view products
  - **Inventory**: Manage products only
  - **Viewer**: View only access

## Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript
- **Styling**: CSS with custom design system
- **Charts**: Recharts
- **Icons**: Lucide React
- **Backend**: Next.js API Routes
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT with HTTP-only cookies
- **QR Codes**: qrcode library

## Getting Started

### Prerequisites

- Node.js 18+ 
- MongoDB Atlas account or local MongoDB instance
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/stockflow.git
cd stockflow
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file based on `.env.example`:
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/stockflow?retryWrites=true&w=majority
JWT_SECRET=your-super-secret-jwt-key-change-in-production
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
productmngmt-system/
├── app/
│   ├── api/                    # API routes
│   │   ├── auth/               # Authentication endpoints
│   │   ├── products/           # Product CRUD
│   │   ├── categories/         # Category management
│   │   ├── staff/              # Staff management
│   │   ├── invoices/           # Invoice/Billing
│   │   └── analytics/          # Dashboard analytics
│   ├── dashboard/              # Dashboard pages
│   │   ├── products/
│   │   ├── billing/
│   │   ├── invoices/
│   │   ├── staff/
│   │   ├── analytics/
│   │   └── settings/
│   ├── login/                  # Login page
│   ├── register/               # Registration page
│   ├── layout.tsx              # Root layout
│   ├── page.tsx                # Landing page
│   └── globals.css             # Global styles
├── components/
│   ├── dashboard/              # Dashboard components
│   ├── charts/                 # Chart components
│   └── ui/                     # Reusable UI components
├── context/
│   └── AuthContext.tsx         # Authentication context
├── lib/
│   ├── db.ts                   # MongoDB connection
│   ├── auth.ts                 # JWT utilities
│   └── utils.ts                # Helper functions
├── models/                     # Mongoose models
│   ├── Merchant.ts
│   ├── Staff.ts
│   ├── Category.ts
│   ├── Product.ts
│   └── Invoice.ts
└── types/
    └── index.ts                # TypeScript types
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new merchant
- `POST /api/auth/login` - Login (merchant/staff)
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout

### Products
- `GET /api/products` - List products (with search, filters, pagination)
- `POST /api/products` - Create product
- `GET /api/products/[id]` - Get single product
- `PUT /api/products/[id]` - Update product
- `DELETE /api/products/[id]` - Delete product
- `POST /api/products/scan` - Lookup product by QR code

### Categories
- `GET /api/categories` - List categories
- `POST /api/categories` - Create category
- `PUT /api/categories/[id]` - Update category
- `DELETE /api/categories/[id]` - Delete category

### Staff
- `GET /api/staff` - List staff members
- `POST /api/staff` - Create staff member
- `PUT /api/staff/[id]` - Update staff member
- `DELETE /api/staff/[id]` - Delete staff member

### Invoices
- `GET /api/invoices` - List invoices
- `POST /api/invoices` - Create invoice (billing)
- `GET /api/invoices/[id]` - Get invoice details

### Analytics
- `GET /api/analytics?type=dashboard` - Dashboard stats
- `GET /api/analytics?type=revenue&days=30` - Revenue trends
- `GET /api/analytics?type=topProducts&days=30` - Top selling products
- `GET /api/analytics?type=categorySales&days=30` - Sales by category

## Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `MONGODB_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret key for JWT tokens |
| `NEXT_PUBLIC_APP_URL` | Application URL |

## License

MIT License - see LICENSE file for details.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
