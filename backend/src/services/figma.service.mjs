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
