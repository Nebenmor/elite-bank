# Banking Application

A modern fullstack banking application built with Express.js, React, TypeScript, and MongoDB. Features user authentication, account management, money transfers, and beneficiary management.

## Features

### 🔐 Authentication

- User registration with email and password
- Secure login with JWT tokens
- Auto-generated unique 10-digit account numbers
- Password hashing with bcrypt

### 💳 Account Management

- View account details (name, account number, balance)
- Real-time balance updates
- Transaction history

### 💸 Money Transfer

- Search users by account number
- Transfer money with balance validation
- Transaction descriptions
- Instant balance updates

### 👥 Beneficiary Management

- Save up to 10 beneficiaries
- Add nicknames for easy identification
- One-click quick transfers
- Remove beneficiaries

### 📱 UI/UX

- Responsive design (mobile, tablet, desktop)
- Modern Tailwind CSS styling
- Loading states and error handling
- Toast notifications

## Tech Stack

### Backend

- **Express.js** - Web framework
- **TypeScript** - Type safety
- **MongoDB** with Mongoose - Database
- **JWT** - Authentication
- **bcryptjs** - Password hashing

### Frontend

- **React** with TypeScript - UI library
- **Tailwind CSS** - Styling
- **Axios** - HTTP client
- **React Router** - Navigation
- **React Hot Toast** - Notifications

## Project Structure

```
banking-app/
├── backend/
│   ├── models/
│   │   ├── User.ts
│   │   └── Transaction.ts
│   ├── routes/
│   │   ├── auth.ts
│   │   ├── user.ts
│   │   └── transaction.ts
│   ├── middleware/
│   │   └── auth.ts
│   ├── utils/
│   │   ├── database.ts
│   │   └── helpers.ts
│   └── server.ts
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── Login.tsx
    │   │   ├── Signup.tsx
    │   │   ├── Dashboard.tsx
    │   │   ├── Transfer.tsx
    │   │   └── Beneficiaries.tsx
    │   ├── context/
    │   │   └── AuthContext.tsx
    │   ├── utils/
    │   │   └── api.ts
    │   └── types/
    │       └── index.ts
    └── App.tsx
```

## Quick Start

### Prerequisites

- Node.js (v18+)
- MongoDB Atlas account (free tier)
- Git

### 1. Clone Repository

```bash
git clone <repository-url>
cd banking-app
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env
# Edit .env with your MongoDB connection string and JWT secret

# Start development server
npm run dev
```

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm start
```

### 4. Environment Configuration

**Backend (.env):**

```env
JWT_SECRET=your_super_secure_jwt_secret_key_minimum_32_characters
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/<database>
PORT=5000
```

**Frontend (.env):**

```env
VITE_API_URL=http://localhost:5000/api
```

## API Endpoints

### Authentication

- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login user

### User Management

- `GET /api/user/profile` - Get user profile
- `GET /api/user/search/:accountNumber` - Search user by account number
- `POST /api/user/beneficiaries` - Add beneficiary
- `DELETE /api/user/beneficiaries/:accountNumber` - Remove beneficiary
- `GET /api/user/transactions` - Get transaction history

### Transactions

- `POST /api/transaction/transfer` - Transfer money
- `POST /api/transaction/quick-transfer` - Quick transfer to beneficiary

## Database Schema

### Users Collection

```javascript
{
  email: String (unique),
  password: String (hashed),
  fullName: String,
  accountNumber: String (10 digits, unique),
  balance: Number,
  beneficiaries: [{
    accountNumber: String,
    name: String,
    nickname: String (optional)
  }],
  createdAt: Date
}
```

### Transactions Collection

```javascript
{
  from: String (account number),
  to: String (account number),
  amount: Number,
  description: String,
  createdAt: Date
}
```

## Development

### Backend Development

```bash
cd backend
npm run dev    # Start with nodemon
npm run build  # Build TypeScript
npm start      # Start production server
```

### Frontend Development

```bash
cd frontend
npm start      # Start development server
npm run build  # Build for production
```

## Security Features

- **JWT Authentication** - Secure token-based auth
- **Password Hashing** - bcrypt with 12 rounds
- **Input Validation** - Server-side validation
- **CORS Protection** - Configured for frontend domain
- **Account Number Generation** - Cryptographically secure random numbers
- **Transaction Integrity** - Database transactions for transfers

## Performance Optimizations

- **Database Indexing** - Indexed fields for fast queries
- **React Optimization** - Proper component structure
- **API Response Caching** - Efficient data loading
- **Input Debouncing** - Reduced API calls

## Responsive Design

The application is fully responsive and works seamlessly on:

- **Mobile devices** (320px+)
- **Tablets** (768px+)
- **Desktop** (1024px+)

## Error Handling

- **Frontend**: Toast notifications for all user actions
- **Backend**: Comprehensive error responses with meaningful messages
- **Validation**: Client and server-side input validation
- **Network**: Automatic token refresh and error recovery

## Testing

To test the application:

1. **Register** a new account
2. **Login** with your credentials
3. **View** your dashboard with account details
4. **Search** for other users by account number
5. **Transfer** money between accounts
6. **Add beneficiaries** for quick transfers
7. **Use quick transfer** for saved beneficiaries

## Deployment

### Backend Deployment

1. Build the TypeScript code: `npm run build`
2. Set environment variables for production
3. Deploy to your preferred platform (Heroku, Railway, etc.)

### Frontend Deployment

1. Update `REACT_APP_API_URL` to production backend URL
2. Build the React app: `npm run build`
3. Deploy to static hosting (Netlify, Vercel, etc.)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For issues and questions:

- Check the GitHub issues page
- Review this README for setup instructions
- Ensure all environment variables are properly configured

---

**Built with ❤️ using modern web technologies**
