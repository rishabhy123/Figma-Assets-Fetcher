import axios from "axios";
import { getCache, setCache } from "../utils/cache.mjs";
import { checkRateLimit, trackRequest } from "../utils/rateLimiter.mjs";

const FIGMA_BASE_URL = "https://api.figma.com/v1";//https://api.figma.com/v1/files/abc123

export const getFigmaFile = async (fileId) => {
  const cacheKey = `figma:file:${fileId}`; //figma:file:abcd
  
  // Check cache first
  const cached = await getCache(cacheKey);
  if (cached) {
    console.log("✅ Returning cached file data");
    return cached;
  }
  
  // Check rate limit before API call
  await checkRateLimit();
  
  const res = await axios.get(
    `${FIGMA_BASE_URL}/files/${fileId}`,
    {
      headers: {
        "X-Figma-Token": process.env.FIGMA_TOKEN
      }
    } 
  );
  
  // Track the API request
  await trackRequest();
  
  // Cache the result
  await setCache(cacheKey, res.data);
  
  return res.data;
};

export const extractImageNodeIds = (node, ids = new Set()) => {
  // Extract nodes with image fills
  if (node.fills?.some(fill => fill.type === "IMAGE")) {
    ids.add(node.id);
  }
  
  // Extract vector nodes
  if (node.type === "VECTOR" || node.type === "BOOLEAN_OPERATION") {
    ids.add(node.id);
  }
  
  // Extract frames, groups, components
  if (["FRAME", "GROUP", "COMPONENT", "INSTANCE"].includes(node.type)) {
    ids.add(node.id);
  }
  
  // Recursively process children
  if (node.children?.length) {
    node.children.forEach(child => extractImageNodeIds(child, ids));
  }
  
  return ids;
};

export const getFigmaImagesBatch = async (fileId, nodeIds) => {
  if (!nodeIds || nodeIds.size === 0) {
    return { images: {} };
  }

  const nodeIdsArray = Array.from(nodeIds);
  const cacheKey = `figma:images:${fileId}:${nodeIdsArray.sort().join(",").substring(0, 50)}`;
  
  // Check cache first
  const cached = await getCache(cacheKey);
  if (cached) {
    console.log("✅ Returning cached image URLs");
    return cached;
  }
  
  // Check rate limit before API call
  await checkRateLimit();
  
  // Split into batches if too many nodes (max 300 per request)
  const BATCH_SIZE = 300;
  const batches = [];
  
  for (let i = 0; i < nodeIdsArray.length; i += BATCH_SIZE) {
    batches.push(nodeIdsArray.slice(i, i + BATCH_SIZE));
  }
  
  const allImages = {};
  
  for (const batch of batches) {
    const idsString = batch.join(",");
    
    try {
      const res = await axios.get(
        `${FIGMA_BASE_URL}/images/${fileId}?ids=${idsString}&format=png&scale=2`,
        {
          headers: { "X-Figma-Token": process.env.FIGMA_TOKEN },
        }
      );
      
      // Track the API request
      await trackRequest();
      
      Object.assign(allImages, res.data.images || {});
    } catch (err) {
      console.error("Images batch failed:", err.response?.data || err.message);
      throw err;
    }
  }
  
  const result = { images: allImages };
  
  // Cache the result (image URLs expire in ~30 days, cache for 1 day)
  await setCache(cacheKey, result);
  
  return result;
};
