# Backend Setup & Usage

## Prerequisites
- Node.js installed
- Redis installed and running

## Redis Setup

### Windows:
1. Download Redis from: https://github.com/microsoftarchive/redis/releases
2. Extract and run `redis-server.exe`
3. Or use Docker: `docker run -d -p 6379:6379 redis`

### Verify Redis:
```bash
redis-cli ping
# Should return: PONG
```

## Installation
```bash
npm install
```

## Environment Variables
Already configured in `.env`:
- `PORT=5000` - Server port
- `FIGMA_TOKEN` - Your Figma API token
- `REDIS_URL=redis://localhost:6379` - Redis connection
- `MAX_FIGMA_REQUESTS=6` - Free tier limit
- `CACHE_TTL=86400` - Cache duration (24 hours)

## Run Server
```bash
npm run dev
```

## API Endpoints

### 1. Get Figma File Assets
```
GET /api/figma/file/:fileId
```
Returns all exportable nodes with image URLs (cached for 24h)

### 2. Check API Usage
```
GET /api/figma/usage
```
Returns:
```json
{
  "success": true,
  "maxRequests": 6,
  "used": 2,
  "remaining": 4
}
```

## How It Works

### Caching Strategy:
- ✅ File data cached for 24 hours
- ✅ Image URLs cached for 24 hours
- ✅ Subsequent requests use cache (no API calls)

### Rate Limiting:
- ✅ Tracks Figma API calls
- ✅ Blocks requests after 6 API calls
- ✅ Returns 429 status when limit exceeded

### Batch Processing:
- ✅ Splits large requests into 300-node batches
- ✅ Prevents URL length errors

## Reset API Counter
```bash
redis-cli DEL figma:api:requests
```

## Clear All Cache
```bash
redis-cli FLUSHALL
```
