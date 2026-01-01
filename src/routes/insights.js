/**
 * API Routes for Insights
 * RESTful endpoints for managing engineering insights
 */

const express = require('express');
const router = express.Router();
const dataStore = require('../models/dataStore');

// Get all insights
router.get('/insights', (req, res) => {
  try {
    const insights = dataStore.getAllInsights();
    res.json({ success: true, insights, count: insights.length });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get a single insight by ID
router.get('/insights/:id', (req, res) => {
  try {
    const insight = dataStore.getInsightById(req.params.id);
    
    if (!insight) {
      return res.status(404).json({ success: false, error: 'Insight not found' });
    }
    
    res.json({ success: true, insight });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Search insights
router.get('/insights/search/:query', (req, res) => {
  try {
    const insights = dataStore.searchInsights(req.params.query);
    res.json({ success: true, insights, count: insights.length });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get insights by tag
router.get('/insights/tag/:tag', (req, res) => {
  try {
    const insights = dataStore.getInsightsByTag(req.params.tag);
    res.json({ success: true, insights, count: insights.length });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Create a new insight
router.post('/insights', (req, res) => {
  try {
    const result = dataStore.createInsight(req.body);
    
    if (!result.success) {
      return res.status(400).json(result);
    }
    
    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update an existing insight
router.put('/insights/:id', (req, res) => {
  try {
    const result = dataStore.updateInsight(req.params.id, req.body);
    
    if (!result.success) {
      const status = result.errors.includes('Insight not found') ? 404 : 400;
      return res.status(status).json(result);
    }
    
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Delete an insight
router.delete('/insights/:id', (req, res) => {
  try {
    const result = dataStore.deleteInsight(req.params.id);
    
    if (!result.success) {
      return res.status(404).json(result);
    }
    
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
