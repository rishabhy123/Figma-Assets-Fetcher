import express from "express";
import { getFigmaFile, extractImageNodeIds, getFigmaImagesBatch } from "../services/figma.service.mjs";

const router = express.Router();

router.get("/file/:fileId", async (req, res) => {
  try {
    const fileId = req.params.fileId;

    // Step 1: File ka full data le lo
    const fileData = await getFigmaFile(fileId);

    // Step 2: Saare image/vector/frame/text nodes ki IDs nikaal lo
    const imageNodeIds = extractImageNodeIds(fileData.document);

    console.log(`Found ${imageNodeIds.size} exportable nodes`);

    // Step 3: Ek hi call mein saare images ke URLs le aao
    const imagesResponse = await getFigmaImagesBatch(fileId, imageNodeIds);

    // Final response: nodeId → image URL mapping
    res.json({
      success: true,
      totalNodes: imageNodeIds.size,
      images: imagesResponse.images || {},
      // Optional: agar chaho to node names bhi add kar sakte ho
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      error: "Figma fetch failed",
      details: err.message,
    });
  }
});

export default router;