import { app } from "./app.js";
import { connectDB } from "./data/database.js";
import https from "https";

connectDB();

app.listen(process.env.PORT, () => {
  console.log(`Server is Running ${process.env.PORT}`);
});
