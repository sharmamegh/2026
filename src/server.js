/**
 * Main Server Application
 * Express server for the Engineering Insights Platform
 */

const express = require('express');
const cors = require('cors');
const path = require('path');

const insightsRouter = require('./routes/insights');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from public directory
app.use(express.static(path.join(__dirname, 'public')));

// API Routes
app.use('/api', insightsRouter);

// Root endpoint
app.get('/api', (req, res) => {
  res.json({
    message: 'Engineering Insights Platform API',
    version: '1.0.0',
    endpoints: {
      insights: {
        getAll: 'GET /api/insights',
        getOne: 'GET /api/insights/:id',
        search: 'GET /api/insights/search/:query',
        byTag: 'GET /api/insights/tag/:tag',
        create: 'POST /api/insights',
        update: 'PUT /api/insights/:id',
        delete: 'DELETE /api/insights/:id'
      }
    }
  });
});

// Serve index.html for all non-API routes (SPA support)
// Note: In production, consider adding rate limiting middleware to prevent abuse
app.use((req, res, next) => {
  if (!req.path.startsWith('/api') && req.method === 'GET') {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
  } else {
    next();
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
});

// Start server
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Engineering Insights Platform running on http://localhost:${PORT}`);
    console.log(`API documentation available at http://localhost:${PORT}/api`);
  });
}

module.exports = app;
