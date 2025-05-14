import { app } from "./app.js";
import { connectDB } from "./data/database.js";
import https from "https";

connectDB();

https.get("https://api.ipify.org", (res) => {
  res.on("data", (ip) => {
    console.log("Your outbound IP is:", ip.toString());
  });
});

app.listen(process.env.PORT, () => {
  console.log(`Server is Running ${process.env.PORT}`);
});
