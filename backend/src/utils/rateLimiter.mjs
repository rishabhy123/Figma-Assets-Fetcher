import { getCounter, incrementCounter } from "./cache.mjs";

const MAX_REQUESTS = parseInt(process.env.MAX_FIGMA_REQUESTS) || 6;
const COUNTER_KEY = "figma:api:requests";

export const checkRateLimit = async () => {
  const currentCount = await getCounter(COUNTER_KEY);
  
  if (currentCount >= MAX_REQUESTS) {
    throw new Error(`Rate limit exceeded. Used ${currentCount}/${MAX_REQUESTS} requests.`);
  }
  
  return currentCount;
};

export const trackRequest = async () => {
  const newCount = await incrementCounter(COUNTER_KEY);
  console.log(`Figma API requests used: ${newCount}/${MAX_REQUESTS}`);
  return newCount;
};

export const getRemainingRequests = async () => {
  const currentCount = await getCounter(COUNTER_KEY);
  return MAX_REQUESTS - currentCount;
};
