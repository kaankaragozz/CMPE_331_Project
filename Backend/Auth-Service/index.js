import app from "./server.js";
import dotenv from "dotenv";

// =====================
// DB
// =====================
import { initDB_users } from "./db/initDB_users.js";
import { seedUsers } from "./seeds/users.js";

dotenv.config();

const PORT = process.env.AUTH_SERVICE_PORT || 3001;

initDB_users()
  .then(async () => {
    if (process.env.NODE_ENV !== "production") {
      await seedUsers();
    }

    app.listen(PORT, () => {
      console.log(`🔐 Auth Service running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ Failed to start Auth Service:", err);
    process.exit(1);
  });
