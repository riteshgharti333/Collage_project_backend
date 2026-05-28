import { app } from "./app.js";
import { connectDB } from "./data/database.js";

const startServer = async () => {
  try {
    // Connect to database first
    await connectDB();
    
    // Start server only after successful DB connection
    app.listen(process.env.PORT, () => {
      console.log(`Server is running on port ${process.env.PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
};

startServer();
