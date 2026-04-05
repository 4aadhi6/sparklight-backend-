// import express from "express";
// //import { createServer as createViteServer } from "vite";
// import mongoose from "mongoose";
// import cors from "cors";
// import dotenv from "dotenv";
// import path from "path";
// import { Server } from "socket.io";
// import http from "http";
// import User from "./server/models/User";

// // Routes
// import authRoutes from "./server/routes/auth";
// import bookingRoutes from "./server/routes/bookings";
// import workerRoutes from "./server/routes/workers";
// import adminRoutes from "./server/routes/admin";
// import paymentRoutes from "./server/routes/payments";

// dotenv.config();

// async function startServer() {
//   const app = express();
//   const server = http.createServer(app);
//   const io = new Server(server, {
//     cors: {
//       origin: "*",
//       methods: ["GET", "POST"],
//     },
//   });

//   const PORT = 3000;

//   // Middleware
//   app.use(cors());
//   app.use(express.json());

//   // Database Connection
//   const MONGODB_URI =
//     process.env.MONGODB_URI ||
//     "mongodb+srv://firepass77432_db_user:PLm70Z7dbriRVOY2@cluster0.wf1odyd.mongodb.net/sparklight";

//   // Disable buffering to prevent long timeouts when disconnected
//   mongoose.set("bufferCommands", false);

//   const connectWithRetry = () => {
//     console.log("Attempting to connect to MongoDB...");
//     mongoose
//       .connect(MONGODB_URI, {
//         serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
//       })
//       .then(() => console.log("Connected to MongoDB successfully"))
//       .catch(async (err) => {
//         console.error("MongoDB connection error:", err.message);

//         if (err.name === "MongooseServerSelectionError") {
//           console.error("--- ACTION REQUIRED: IP WHITELISTING ---");
//           console.error(
//             "This error usually means the Cloud Run IP is not whitelisted in MongoDB Atlas.",
//           );
//           console.error("1. Go to MongoDB Atlas: https://cloud.mongodb.com/");
//           console.error("2. Navigate to Network Access -> IP Access List");
//           console.error(
//             "3. Add '0.0.0.0/0' to allow access from any IP (recommended for dynamic environments like this).",
//           );
//           console.error("-----------------------------------------");

//           try {
//             const response = await fetch("https://api.ipify.org?format=json");
//             const data = await response.json();
//             console.error(`Your current public IP is: ${data.ip}`);
//           } catch (ipErr) {
//             console.error("Could not determine public IP.");
//           }
//         }

//         // Retry connection after 5 seconds
//         console.log("Retrying MongoDB connection in 5 seconds...");
//         setTimeout(connectWithRetry, 5000);
//       });
//   };

//   connectWithRetry();

//   // Bootstrap Admin User
//   const bootstrapAdmin = async () => {
//     try {
//       const adminExists = await User.findOne({ role: "admin" });
//       if (!adminExists) {
//         const bcrypt = await import("bcryptjs");
//         const hashedPassword = await bcrypt.default.hash("admin123", 10);
//         const admin = new User({
//           name: "Admin User",
//           phone: "9999999999",
//           password: hashedPassword,
//           role: "admin",
//         });
//         await admin.save();
//         console.log("--- ADMIN BOOTSTRAPPED ---");
//         console.log("Phone: 9999999999");
//         console.log("Password: admin123");
//         console.log("--------------------------");
//       }
//     } catch (err) {
//       console.error("Admin bootstrap failed (DB likely disconnected)");
//     }
//   };

//   // Run bootstrap after a short delay to allow connection
//   setTimeout(bootstrapAdmin, 10000);

//   // Socket.io
//   app.set("io", io);
//   io.on("connection", (socket) => {
//     console.log("A user connected:", socket.id);

//     socket.on("join", (room) => {
//       socket.join(room);
//       console.log(`User joined room: ${room}`);
//     });

//     socket.on("disconnect", () => {
//       console.log("User disconnected");
//     });
//   });

//   // API Routes
//   app.use("/api/auth", authRoutes);
//   app.use("/api/bookings", bookingRoutes);
//   app.use("/api/workers", workerRoutes);
//   app.use("/api/admin", adminRoutes);
//   app.use("/api/payments", paymentRoutes);

//   app.get("/api/health", (req, res) => {
//     res.json({ status: "ok", message: "Spark Light API is running" });
//   });

//   // Vite middleware for development
//   if (process.env.NODE_ENV !== "production") {
//     const vite = await createViteServer({
//       server: { middlewareMode: true },
//       appType: "spa",
//     });
//     app.use(vite.middlewares);
//   } else {
//     const distPath = path.join(process.cwd(), "dist");
//     app.use(express.static(distPath));
//     app.get("*", (req, res) => {
//       res.sendFile(path.join(distPath, "index.html"));
//     });
//   }

//   server.listen(PORT, "0.0.0.0", () => {
//     console.log(`Server running on http://localhost:${PORT}`);
//   });
// }

// startServer();
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { Server } from "socket.io";
import http from "http";
import User from "./server/models/User";

// Routes
import authRoutes from "./server/routes/auth";
import bookingRoutes from "./server/routes/bookings";
import workerRoutes from "./server/routes/workers";
import adminRoutes from "./server/routes/admin";
import paymentRoutes from "./server/routes/payments";

dotenv.config();

async function startServer() {
  const app = express();
  const server = http.createServer(app);

  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  const PORT = parseInt(process.env.PORT || "3000", 10);

  // Middleware
  app.use(cors());
  app.use(express.json());

  // MongoDB URI
  const MONGODB_URI =
    process.env.MONGODB_URI ||
    "mongodb+srv://firepass77432_db_user:PLm70Z7dbriRVOY2@cluster0.wf1odyd.mongodb.net/sparklight";

  mongoose.set("bufferCommands", false);

  // DB Connection with retry
  const connectWithRetry = () => {
    console.log("Attempting to connect to MongoDB...");

    mongoose
      .connect(MONGODB_URI, {
        serverSelectionTimeoutMS: 5000,
      })
      .then(() => console.log("Connected to MongoDB successfully"))
      .catch((err) => {
        console.error("MongoDB connection error:", err.message);
        console.log("Retrying in 5 seconds...");
        setTimeout(connectWithRetry, 5000);
      });
  };

  connectWithRetry();

  // Bootstrap Admin
  const bootstrapAdmin = async () => {
    try {
      const adminExists = await User.findOne({ role: "admin" });

      if (!adminExists) {
        const bcrypt = await import("bcryptjs");

        const hashedPassword = await bcrypt.default.hash("admin123", 10);

        const admin = new User({
          name: "Admin User",
          phone: "9999999999",
          password: hashedPassword,
          role: "admin",
        });

        await admin.save();

        console.log("---- ADMIN CREATED ----");
        console.log("Phone: 9999999999");
        console.log("Password: admin123");
        console.log("------------------------");
      }
    } catch (err) {
      console.error("Admin bootstrap failed:", err);
    }
  };

  setTimeout(bootstrapAdmin, 10000);

  // Socket.io
  app.set("io", io);

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("join", (room) => {
      socket.join(room);
      console.log("Joined room:", room);
    });

    socket.on("disconnect", () => {
      console.log("User disconnected");
    });
  });

  // Routes
  app.use("/api/auth", authRoutes);
  app.use("/api/bookings", bookingRoutes);
  app.use("/api/workers", workerRoutes);
  app.use("/api/admin", adminRoutes);
  app.use("/api/payments", paymentRoutes);

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({
      status: "ok",
      message: "Server running",
    });
  });

  // Serve frontend (optional)
  const distPath = path.join(process.cwd(), "dist");

  app.use(express.static(distPath));

  app.get("*", (req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
  });

  // Start server
  server.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
