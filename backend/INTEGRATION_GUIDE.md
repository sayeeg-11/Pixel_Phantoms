# Error Middleware Integration Guide

This guide demonstrates how to integrate the global error handling middleware into your Express application.

## Quick Start

### 1. Basic Setup

```javascript
// server.js or app.js
const express = require('express');
const { 
  errorHandler, 
  notFoundHandler, 
  asyncHandler,
  ApiError 
} = require('./middleware/errorMiddleware');

const app = express();

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Your API routes
app.get('/api/hello', (req, res) => {
  res.json({ success: true, message: 'Hello World' });
});

// IMPORTANT: Add these middlewares AFTER all routes
app.use(notFoundHandler);  // Handles 404
app.use(errorHandler);     // Handles all errors

app.listen(5000, () => console.log('Server running on port 5000'));
```

## Usage Examples

### Example 1: Throwing Errors in Synchronous Routes

```javascript
app.get('/api/users/:id', (req, res) => {
  const userId = req.params.id;
  
  // Validate input
  if (!userId || userId.length < 5) {
    throw new ApiError(400, 'Invalid user ID format');
  }
  
  // Simulate user lookup
  const user = database.findUser(userId);
  
  if (!user) {
    throw new ApiError(404, 'User not found');
  }
  
  res.json({ success: true, data: user });
});
```

**Response (404):**
```json
{
  "success": false,
  "status": 404,
  "message": "User not found",
  "timestamp": "2026-01-12T10:30:00.000Z",
  "path": "/api/users/12345"
}
```

### Example 2: Handling Async Operations

```javascript
app.get('/api/posts/:id', asyncHandler(async (req, res) => {
  const postId = req.params.id;
  
  // Async database call
  const post = await Post.findById(postId);
  
  if (!post) {
    throw new ApiError(404, 'Post not found');
  }
  
  // Check authorization
  if (post.isPrivate && !req.user) {
    throw new ApiError(403, 'Access denied to private post');
  }
  
  res.json({ success: true, data: post });
}));
```

### Example 3: Validation Errors

```javascript
app.post('/api/register', asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;
  const validationErrors = [];
  
  // Validate username
  if (!username || username.length < 3) {
    validationErrors.push({
      field: 'username',
      message: 'Username must be at least 3 characters'
    });
  }
  
  // Validate email
  if (!email || !email.includes('@')) {
    validationErrors.push({
      field: 'email',
      message: 'Valid email is required'
    });
  }
  
  // Validate password
  if (!password || password.length < 8) {
    validationErrors.push({
      field: 'password',
      message: 'Password must be at least 8 characters'
    });
  }
  
  // If validation fails, throw error with details
  if (validationErrors.length > 0) {
    throw new ApiError(422, 'Validation failed', validationErrors);
  }
  
  // Process registration
  const user = await User.create({ username, email, password });
  res.status(201).json({ 
    success: true, 
    message: 'User registered successfully',
    data: { id: user.id, username: user.username }
  });
}));
```

**Response (422):**
```json
{
  "success": false,
  "status": 422,
  "message": "Validation failed",
  "timestamp": "2026-01-12T10:30:00.000Z",
  "path": "/api/register",
  "errors": [
    {
      "field": "email",
      "message": "Valid email is required"
    },
    {
      "field": "password",
      "message": "Password must be at least 8 characters"
    }
  ]
}
```

### Example 4: Authentication Errors

```javascript
// Authentication middleware
const authenticate = asyncHandler(async (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    throw new ApiError(401, 'Authentication token required');
  }
  
  try {
    const decoded = verifyToken(token);
    req.user = await User.findById(decoded.userId);
    
    if (!req.user) {
      throw new ApiError(401, 'Invalid authentication token');
    }
    
    next();
  } catch (error) {
    throw new ApiError(401, 'Invalid or expired token');
  }
});

// Protected route
app.get('/api/profile', authenticate, (req, res) => {
  res.json({ 
    success: true, 
    data: req.user 
  });
});
```

### Example 5: Database Connection Errors

```javascript
app.get('/api/data', asyncHandler(async (req, res) => {
  try {
    const data = await database.query('SELECT * FROM items');
    res.json({ success: true, data });
  } catch (dbError) {
    throw new ApiError(
      503,
      'Database service unavailable',
      [{ code: 'DB_ERROR', message: 'Unable to fetch data' }]
    );
  }
}));
```

### Example 6: External API Errors

```javascript
app.get('/api/weather/:city', asyncHandler(async (req, res) => {
  try {
    const response = await fetch(`https://api.weather.com/${req.params.city}`);
    
    if (!response.ok) {
      throw new ApiError(
        response.status,
        'Weather service error',
        [{ service: 'weather-api', status: response.status }]
      );
    }
    
    const data = await response.json();
    res.json({ success: true, data });
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(503, 'Weather service unavailable');
  }
}));
```

## Advanced Patterns

### Custom Error Classes

```javascript
class DatabaseError extends ApiError {
  constructor(message, dbCode) {
    super(503, message, [{ dbCode }]);
    this.name = 'DatabaseError';
  }
}

class AuthenticationError extends ApiError {
  constructor(message) {
    super(401, message);
    this.name = 'AuthenticationError';
  }
}

// Usage
app.get('/api/secure-data', asyncHandler(async (req, res) => {
  if (!req.user) {
    throw new AuthenticationError('Please log in to access this resource');
  }
  
  try {
    const data = await db.getSecureData(req.user.id);
    res.json({ success: true, data });
  } catch (err) {
    throw new DatabaseError('Failed to retrieve secure data', err.code);
  }
}));
```

### Conditional Error Handling

```javascript
app.get('/api/items/:id', asyncHandler(async (req, res) => {
  const item = await Item.findById(req.params.id);
  
  if (!item) {
    // 404 - Item doesn't exist
    throw new ApiError(404, 'Item not found');
  }
  
  if (item.archived) {
    // 410 - Item is gone
    throw new ApiError(410, 'This item has been archived');
  }
  
  if (item.requiresPermission && !req.user?.hasPermission('view-items')) {
    // 403 - User doesn't have permission
    throw new ApiError(403, 'You do not have permission to view this item');
  }
  
  res.json({ success: true, data: item });
}));
```

## Testing Error Responses

### Using cURL

```bash
# Test 404 error
curl http://localhost:5000/api/nonexistent

# Test validation error
curl -X POST http://localhost:5000/api/register \
  -H "Content-Type: application/json" \
  -d '{"username":"ab","email":"invalid"}'

# Test authentication error
curl http://localhost:5000/api/profile

# Test with authentication
curl http://localhost:5000/api/profile \
  -H "Authorization: Bearer your-token-here"
```

### Using JavaScript Fetch

```javascript
// Client-side error handling
async function fetchUser(userId) {
  try {
    const response = await fetch(`/api/users/${userId}`);
    const data = await response.json();
    
    if (!data.success) {
      // Handle error response
      console.error('Error:', data.message);
      if (data.errors) {
        data.errors.forEach(err => {
          console.error(`${err.field}: ${err.message}`);
        });
      }
      return null;
    }
    
    return data.data;
  } catch (error) {
    console.error('Network error:', error);
    return null;
  }
}
```

## Common Status Codes Reference

| Code | Name | When to Use |
|------|------|-------------|
| 400 | Bad Request | Invalid syntax, malformed request |
| 401 | Unauthorized | Authentication required or failed |
| 403 | Forbidden | Authenticated but lacks permission |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Request conflicts with current state (e.g., duplicate entry) |
| 422 | Unprocessable Entity | Validation errors, semantic issues |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Unexpected server error |
| 502 | Bad Gateway | Invalid response from upstream server |
| 503 | Service Unavailable | Server overloaded or maintenance |

## Tips & Best Practices

1. **Always wrap async handlers** with `asyncHandler` to avoid unhandled rejections
2. **Use specific status codes** - Don't default everything to 500
3. **Provide helpful error messages** - Help developers debug faster
4. **Include validation details** - Use the `errors` array for field-level feedback
5. **Don't expose internals** - Avoid leaking system details in production
6. **Log everything** - Error middleware logs are crucial for debugging
7. **Test error paths** - Don't just test happy paths

## Troubleshooting

### Error: Headers already sent
**Problem:** Trying to send response after it was already sent  
**Solution:** Ensure you're not calling `res.json()` multiple times or after throwing an error

### Error: Unhandled promise rejection
**Problem:** Forgot to wrap async handler  
**Solution:** Always use `asyncHandler` for async routes

### Stack trace not showing
**Problem:** `NODE_ENV` is set to production  
**Solution:** Set `NODE_ENV=development` in your `.env` file

---

**Need more help?** Check the main [Backend README](./README.md) for additional information.
