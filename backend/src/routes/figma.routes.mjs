import express from "express";
import { getFigmaFile, extractImageNodeIds, getFigmaImagesBatch } from "../services/figma.service.mjs";
import { getRemainingRequests } from "../utils/rateLimiter.mjs";

const router = express.Router();

router.get("/file/:fileId", async (req, res) => {
  try {
    const fileId = req.params.fileId;

    // Step 1: File ka full data le lo (cached if available)
    const fileData = await getFigmaFile(fileId);

    // Step 2: Saare image/vector/frame/text nodes ki IDs nikaal lo
    const imageNodeIds = extractImageNodeIds(fileData.document);

    console.log(`Found ${imageNodeIds.size} exportable nodes`);

    // Step 3: Ek hi call mein saare images ke URLs le aao (cached if available)
    const imagesResponse = await getFigmaImagesBatch(fileId, imageNodeIds);

    // Final response: nodeId → image URL mapping
    res.json({
      success: true,
      totalNodes: imageNodeIds.size,
      images: imagesResponse.images || {},
    });

  } catch (err) {
    console.error(err);
    res.status(err.message?.includes("Rate limit") ? 429 : 500).json({
      success: false,
      error: err.message?.includes("Rate limit") ? "Rate limit exceeded" : "Figma fetch failed",
      details: err.message,
    });
  }
});

// API usage stats endpoint
router.get("/usage", async (req, res) => {
  try {
    const remaining = await getRemainingRequests();
    const maxRequests = parseInt(process.env.MAX_FIGMA_REQUESTS) || 6;
    
    res.json({
      success: true,
      maxRequests,
      used: maxRequests - remaining,
      remaining,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: "Failed to get usage stats",
    });
  }
});

export default router;