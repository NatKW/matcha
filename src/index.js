import dotenv from "dotenv";
import "./config/db.js";
import app from "./app.js";

dotenv.config();

const PORT = process.env.PORT || 3000;

app.get("/", (_req, res) => {
  res.send("Matcha API is running 🚀");
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
