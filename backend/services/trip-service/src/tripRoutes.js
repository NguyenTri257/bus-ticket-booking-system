const express = require('express');
const router = express.Router();
const tripController = require('./tripController');

// Trip search endpoint
router.get('/search', tripController.searchTrips);

// Get trip by ID
router.get('/:tripId', tripController.getTripById);

module.exports = router;
