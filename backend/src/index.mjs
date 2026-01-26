import express from "express";
import cors from "cors";
import figmaRoutes from "./routes/figma.routes.mjs";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/figma", figmaRoutes);
// app.get('/test',async(req, res)=>{
//   try{
//   const r = await fetch("https://api.figma.com/v1/me", {
//     headers:{
//       "X-Figma-Token": process.env.FIGMA_TOKEN
//     }
//   })
//   const data = await r.json();
//   res.json(data);
// }
// catch(e){
//   res.status(500).json({ error: e.message });
// }

// })
app.listen(process.env.PORT, () => {
  console.log("Server running on port", process.env.PORT);
});
