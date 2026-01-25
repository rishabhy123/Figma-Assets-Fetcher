import express from "express";
import cors from "cors";
import figmaRoutes from "./routes/figma.routes.mjs";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/figma", figmaRoutes);
console.log("Token:", process.env.FIGMA_TOKEN ? "Present" : "Missing!");

app.listen(process.env.PORT, () => {
  console.log("Server running on port", process.env.PORT);
});
