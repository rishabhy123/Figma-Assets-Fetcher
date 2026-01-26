import express from "express";
import { getFigmaFile } from "../services/figma.service.mjs";

const router = express.Router();

router.get("/file/:fileId", async (req, res) => {
  try {
    const data = await getFigmaFile(req.params.fileId);
    res.json(data.document);
  } catch (err) {
    res.status(500).json({ error: "Figma fetch failed" });
    
  }
});

export default router;
