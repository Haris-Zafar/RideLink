# RideLink Backend

Node.js + Express.js + MongoDB backend API for RideLink University Carpooling Platform.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file from `.env.example`:
```bash
cp .env.example .env
```

3. Update `.env` with your credentials

4. Start development server:
```bash
npm run dev
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (protected)
- `POST /api/auth/logout` - Logout user (protected)
- `POST /api/auth/send-otp` - Send phone verification OTP (protected)
- `POST /api/auth/verify-phone` - Verify phone with OTP (protected)

More endpoints coming soon...

## Status

✅ Authentication system implemented
⏳ Ride management - pending
⏳ Booking system - pending
⏳ Real-time chat - pending
