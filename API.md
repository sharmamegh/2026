# API Documentation

## Base URL
```
http://localhost:3000/api
```

## Endpoints

### Get API Information
```
GET /api
```

Returns information about the API and available endpoints.

**Response:**
```json
{
  "message": "Engineering Insights Platform API",
  "version": "1.0.0",
  "endpoints": { ... }
}
```

---

### Get All Insights
```
GET /api/insights
```

Retrieves all insights stored in the platform.

**Response:**
```json
{
  "success": true,
  "insights": [...],
  "count": 10
}
```

---

### Get Single Insight
```
GET /api/insights/:id
```

Retrieves a specific insight by ID.

**Parameters:**
- `id` (string): The unique identifier of the insight

**Response:**
```json
{
  "success": true,
  "insight": {
    "id": "abc123",
    "title": "Choosing Between SQL and NoSQL",
    "author": "Jane Doe",
    "timestamp": "2026-01-01T12:00:00.000Z",
    "tags": ["databases", "architecture"],
    "context": { ... },
    "problem": { ... },
    "approach": { ... },
    "outcome": { ... },
    "lessons": { ... }
  }
}
```

**Error Response (404):**
```json
{
  "success": false,
  "error": "Insight not found"
}
```

---

### Search Insights
```
GET /api/insights/search/:query
```

Searches insights by keyword in all fields.

**Parameters:**
- `query` (string): Search term

**Response:**
```json
{
  "success": true,
  "insights": [...],
  "count": 5
}
```

---

### Get Insights by Tag
```
GET /api/insights/tag/:tag
```

Retrieves insights filtered by a specific tag.

**Parameters:**
- `tag` (string): Tag name (e.g., "databases", "performance")

**Response:**
```json
{
  "success": true,
  "insights": [...],
  "count": 3
}
```

---

### Create Insight
```
POST /api/insights
```

Creates a new insight.

**Request Body:**
```json
{
  "title": "string (required)",
  "author": "string (optional, defaults to 'Anonymous')",
  "tags": ["string"],
  "context": {
    "domain": "string",
    "scale": "string",
    "timeframe": "string"
  },
  "problem": {
    "description": "string (required)",
    "impact": "string",
    "constraints": ["string"]
  },
  "approach": {
    "alternatives": ["string"],
    "chosen": "string",
    "tradeoffs": ["string"],
    "reasoning": "string"
  },
  "outcome": {
    "results": "string",
    "metrics": ["string"],
    "surprises": "string"
  },
  "lessons": {
    "whatWorked": ["string"],
    "whatDidnt": ["string"],
    "wouldDoDifferently": ["string"],
    "keyTakeaways": ["string"]
  }
}
```

**Success Response (201):**
```json
{
  "success": true,
  "insight": { ... }
}
```

**Error Response (400):**
```json
{
  "success": false,
  "errors": [
    "Title is required",
    "Problem description is required"
  ]
}
```

**Validation Rules:**
- Title must not be empty
- Problem description must not be empty
- Content must not contain code blocks, function definitions, or sensitive keywords
- All fields accept strings; arrays can be empty

---

### Update Insight
```
PUT /api/insights/:id
```

Updates an existing insight.

**Parameters:**
- `id` (string): The unique identifier of the insight

**Request Body:**
Same as Create Insight (all fields optional except title and problem.description)

**Success Response (200):**
```json
{
  "success": true,
  "insight": { ... }
}
```

**Error Response (404):**
```json
{
  "success": false,
  "errors": ["Insight not found"]
}
```

**Error Response (400):**
```json
{
  "success": false,
  "errors": ["Validation error messages"]
}
```

---

### Delete Insight
```
DELETE /api/insights/:id
```

Deletes an insight.

**Parameters:**
- `id` (string): The unique identifier of the insight

**Success Response (200):**
```json
{
  "success": true
}
```

**Error Response (404):**
```json
{
  "success": false,
  "errors": ["Insight not found"]
}
```

---

## Data Model

### Insight Object

```javascript
{
  id: string,              // Auto-generated unique identifier
  title: string,           // Title of the insight (required)
  author: string,          // Author name (defaults to "Anonymous")
  timestamp: string,       // ISO 8601 timestamp (auto-generated)
  tags: string[],          // Array of tags for categorization
  
  context: {
    domain: string,        // Engineering domain
    scale: string,         // Scale of the system/project
    timeframe: string      // Time period
  },
  
  problem: {
    description: string,   // What challenge was faced (required)
    impact: string,        // Why it mattered
    constraints: string[]  // Limitations that existed
  },
  
  approach: {
    alternatives: string[], // Options considered
    chosen: string,         // Selected approach
    tradeoffs: string[],    // Gains vs. losses
    reasoning: string       // Why this choice
  },
  
  outcome: {
    results: string,        // What happened
    metrics: string[],      // Success measurements (abstract)
    surprises: string       // Unexpected results
  },
  
  lessons: {
    whatWorked: string[],          // Successful aspects
    whatDidnt: string[],           // Unsuccessful aspects
    wouldDoDifferently: string[],  // Retrospective improvements
    keyTakeaways: string[]         // Main learnings
  }
}
```

## Error Handling

All endpoints return consistent error responses:

```json
{
  "success": false,
  "error": "Error message"
}
```

or for validation errors:

```json
{
  "success": false,
  "errors": [
    "Error message 1",
    "Error message 2"
  ]
}
```

**HTTP Status Codes:**
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `404` - Not Found
- `500` - Internal Server Error

## CORS

The API supports CORS for cross-origin requests, making it accessible from any frontend application.

## Content Type

All requests and responses use `application/json` content type.

## Rate Limiting

Currently, there are no rate limits. In production, consider implementing rate limiting for API protection.

## Examples

### Create an Insight (cURL)

```bash
curl -X POST http://localhost:3000/api/insights \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Database Sharding Decision",
    "author": "Engineering Team",
    "tags": ["databases", "scalability"],
    "problem": {
      "description": "Single database becoming a bottleneck at scale",
      "impact": "Query performance degrading as data grew",
      "constraints": ["Limited budget", "Small team", "Cannot stop service"]
    },
    "approach": {
      "chosen": "Horizontal sharding by user ID",
      "reasoning": "Best balance of complexity and scalability gains"
    }
  }'
```

### Search Insights (JavaScript)

```javascript
async function searchInsights(query) {
  const response = await fetch(`http://localhost:3000/api/insights/search/${query}`);
  const data = await response.json();
  return data.insights;
}

searchInsights('database').then(insights => {
  console.log('Found insights:', insights);
});
```
