# Backend - Global Error Handling Middleware

This directory contains the backend implementation with a centralized error handling system for standardized API responses.

## 📁 Structure

```
backend/
├── src/
│   ├── middleware/
│   │   └── errorMiddleware.js   # Global error handling middleware
│   ├── server.js                 # Example Express server setup
│   └── ...
├── .env                          # Environment variables
└── README.md                     # This file
```

## 🎯 Features

### Error Middleware (`errorMiddleware.js`)

The global error handling middleware provides:

1. **Standardized Error Responses** - All API errors return a consistent JSON format
2. **Custom ApiError Class** - For throwing errors with specific status codes
3. **Async Handler Wrapper** - Automatically catches promise rejections in async routes
4. **404 Not Found Handler** - Catches requests to undefined routes
5. **Environment-Aware Logging** - Stack traces shown only in development mode

## 📝 Error Response Format

All errors return the following JSON structure:

```json
{
  "success": false,
  "status": 404,
  "message": "Route /api/invalid not found",
  "timestamp": "2026-01-12T10:30:00.000Z",
  "path": "/api/invalid",
  "errors": [
    {
      "field": "email",
      "message": "Email is required"
    }
  ],
  "stack": "Error stack trace (development only)"
}
```

### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `success` | boolean | Always `false` for errors |
| `status` | number | HTTP status code (400, 404, 500, etc.) |
| `message` | string | Human-readable error message |
| `timestamp` | string | ISO 8601 timestamp of when the error occurred |
| `path` | string | The API endpoint that was requested |
| `errors` | array | Optional validation errors or additional error details |
| `stack` | string | Error stack trace (only in development mode) |

## 🚀 Usage

### 1. Import the Middleware

```javascript
const { 
  errorHandler, 
  notFoundHandler, 
  asyncHandler,
  ApiError 
} = require('./middleware/errorMiddleware');
```

### 2. Apply Middleware in Express App

The order is crucial - add these middlewares **after** all your routes:

```javascript
const express = require('express');
const app = express();

// Your routes here
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);

// 404 Handler - catches undefined routes
app.use(notFoundHandler);

// Error Handler - MUST be last
app.use(errorHandler);
```

### 3. Throwing Errors in Routes

#### Synchronous Routes
```javascript
app.get('/api/users/:id', (req, res) => {
  const user = findUser(req.params.id);
  
  if (!user) {
    throw new ApiError(404, 'User not found');
  }
  
  res.json({ success: true, data: user });
});
```

#### Async Routes (use `asyncHandler`)
```javascript
app.get('/api/users/:id', asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  
  if (!user) {
    throw new ApiError(404, 'User not found');
  }
  
  res.json({ success: true, data: user });
}));
```

#### Validation Errors
```javascript
app.post('/api/users', asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const errors = [];
  
  if (!email) {
    errors.push({ field: 'email', message: 'Email is required' });
  }
  if (!password) {
    errors.push({ field: 'password', message: 'Password is required' });
  }
  
  if (errors.length > 0) {
    throw new ApiError(422, 'Validation failed', errors);
  }
  
  // Process request...
  res.json({ success: true, message: 'User created' });
}));
```

## 📊 HTTP Status Codes

Common status codes used with `ApiError`:

| Code | Meaning | Usage Example |
|------|---------|---------------|
| 400 | Bad Request | Invalid input data |
| 401 | Unauthorized | Missing or invalid authentication |
| 403 | Forbidden | User doesn't have permission |
| 404 | Not Found | Resource doesn't exist |
| 422 | Unprocessable Entity | Validation errors |
| 500 | Internal Server Error | Unexpected server errors |
| 503 | Service Unavailable | Database/service connection issues |

## 🧪 Testing the Error Handling

You can test the error handling using the example routes in `server.js`:

```bash
# Start the server
node src/server.js

# Test synchronous error
curl http://localhost:5000/api/sync-error

# Test async error
curl http://localhost:5000/api/async-error

# Test validation error
curl -X POST http://localhost:5000/api/validate \
  -H "Content-Type: application/json" \
  -d '{}'

# Test 404 error
curl http://localhost:5000/api/nonexistent

# Test success response
curl http://localhost:5000/api/success
```

## 🔧 Configuration

### Environment Variables

Set these in your `.env` file:

```env
PORT=5000
NODE_ENV=development
CORS_ORIGINS=http://localhost:3000,http://localhost:5500
```

- `NODE_ENV`: Set to `production` to hide stack traces
- `PORT`: Server port number
- `CORS_ORIGINS`: Comma-separated list of allowed origins

## 📚 API Components

### `ApiError` Class

Custom error class for creating operational errors:

```javascript
new ApiError(statusCode, message, errors);
```

**Parameters:**
- `statusCode` (number): HTTP status code
- `message` (string): Error message
- `errors` (array, optional): Additional error details

### `errorHandler` Function

Main error handling middleware that catches all errors:

```javascript
errorHandler(err, req, res, next)
```

### `notFoundHandler` Function

Middleware for handling 404 errors:

```javascript
notFoundHandler(req, res, next)
```

### `asyncHandler` Function

Wrapper for async route handlers:

```javascript
asyncHandler(asyncFunction)
```

## 🎓 Best Practices

1. **Always use `asyncHandler`** for async routes to avoid unhandled promise rejections
2. **Use appropriate status codes** for different error types
3. **Provide clear error messages** that help developers debug issues
4. **Include validation errors** in the `errors` array for detailed feedback
5. **Place error middleware last** in your middleware chain
6. **Log errors** for monitoring and debugging (consider using a logging service in production)
7. **Never expose sensitive information** in error messages in production

## 🔒 Security Considerations

- Stack traces are only shown in development mode
- Avoid exposing internal server details in error messages
- Sanitize error messages before sending to clients
- Consider implementing rate limiting for error-prone endpoints

## 📈 Future Enhancements

- Integration with logging services (e.g., Winston, Morgan)
- Error tracking and monitoring (e.g., Sentry, LogRocket)
- Custom error types for different domains (AuthError, DatabaseError, etc.)
- Error metrics and analytics
- Internationalization (i18n) for error messages

## 🤝 Contributing

When adding new features or routes:
1. Use the `ApiError` class for operational errors
2. Wrap async handlers with `asyncHandler`
3. Follow the established error response format
4. Add appropriate status codes
5. Document your error cases

## 📞 Support

For questions or issues related to the error handling system, please refer to the main project documentation or contact the development team.

---

**Last Updated:** January 12, 2026  
**Version:** 1.0.0  
**Issue Reference:** #350
