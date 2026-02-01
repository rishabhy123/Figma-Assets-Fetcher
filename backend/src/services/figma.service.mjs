import axios from "axios";

const FIGMA_BASE_URL = "https://api.figma.com/v1";

export const getFigmaFile = async (fileId) => {
  const res = await axios.get(
    `${FIGMA_BASE_URL}/files/${fileId}`,
    {
      headers: {
        "X-Figma-Token": process.env.FIGMA_TOKEN
      }
    } 
  );
  return res.data;
  
};

export const extractImageNodeIds = (node, ids = new Set()) => {
  if(node.fills?.some(fill=>fill.type === "IMAGE")){
    ids.add(node.id);
  }
  // Vector nodes (exportable as SVG/PNG)
  if (node.type === "VECTOR" || node.type === "BOOLEAN_OPERATION") {
    ids.add(node.id);
  }
  // Frames / Groups / Components jo complex hain (screenshot jaisa export)
  if (["FRAME", "GROUP", "COMPONENT", "INSTANCE"].includes(node.type)) {
    // Optional: agar bohot chhote frames skip karna ho to condition daal sakte ho
    // if (node.absoluteBoundingBox.width > 10 && node.absoluteBoundingBox.height > 10)
    ids.add(node.id);
  }
  if (node.children?.length) {
    node.children.forEach(child => extractImageNodeIds(child, ids));
  }
  return ids;
}

export const getFigmaImagesBatch = async (fileId, nodeIds) => {
  if (!nodeIds || nodeIds.length === 0) {
    return { images: {} };
  }

  // Max safe batch size ~300-500, agar zyada ho to split kar sakte ho
  const idsString = Array.from(nodeIds).join(",");

  try {
    const res = await axios.get(
      `${FIGMA_BASE_URL}/images/${fileId}?ids=${idsString}&format=png&scale=2`,
      {
        headers: { "X-Figma-Token": process.env.FIGMA_TOKEN },
      }
    );
    return res.data; // { images: { "id1": "url1", "id2": "url2" ... } }
  } catch (err) {
    console.error("Images batch failed:", err.response?.data || err.message);
    throw err;
  }
};
