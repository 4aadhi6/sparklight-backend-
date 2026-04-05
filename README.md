# Spark Light - Service Booking Application

Spark Light is a full-stack application for booking home services (Electrical, Plumbing, etc.) with real-time worker assignment and location tracking.

## 🚀 Quick Start (Integrated Mode)

This project is configured to run as a **Single Server** (Express + Vite) for easy deployment and development in the AI Studio environment.

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Environment Variables
Create a `.env` file based on `.env.example`:
```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
RAZORPAY_KEY_ID=your_razorpay_key
RAZORPAY_KEY_SECRET=your_razorpay_secret
```

### 3. Start Development Server
```bash
npm run dev
```
The app will be available at `http://localhost:3000`.

---

## 🛠️ Running Frontend & Backend Separately

If you want to run the Frontend and Backend in separate terminal windows (standard local development):

### 1. Configure Proxy
In `vite.config.ts`, ensure the proxy is pointing to your backend port (e.g., 5000):
```ts
proxy: {
  '/api': 'http://localhost:5000',
  '/socket.io': {
    target: 'http://localhost:5000',
    ws: true
  }
}
```

### 2. Start Backend (Terminal 1)
Modify `server.ts` to remove Vite middleware and run on port 5000:
```bash
# Run the server directly
npx tsx server.ts
```

### 3. Start Frontend (Terminal 2)
```bash
# Run Vite standalone
npx vite
```

---

## 📦 Production Build
To build the project for production:
```bash
npm run build
npm start
```

## 🔑 Key Features
- **User Dashboard:** Book services, track status, and share location.
- **Worker Dashboard:** Accept/Reject jobs, view location on Google Maps, and track points.
- **Admin Panel:** Assign workers, manage leaderboard, and track revenue.
- **Real-time:** Powered by Socket.io for instant updates.
