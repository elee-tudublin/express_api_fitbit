// routes/data.js
import express from 'express';
import { makeApiRequest } from '../utils/fitbit.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// Apply auth middleware to all routes in this router
router.use(requireAuth);

/**
 * Get user profile information
 */
router.get('/profile', async (req, res) => {
  try {
    const data = await makeApiRequest(
      req.user.fitbit.access_token, 
      '/1/user/-/profile.json'
    );
    res.json(data);
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch profile data' });
  }
});

/**
 * Get activity summary for a date
 */
router.get('/activities/date/:date', async (req, res) => {
  try {
    const { date } = req.params; // Format: YYYY-MM-DD
    const data = await makeApiRequest(
      req.user.fitbit.access_token,
      `/1/user/-/activities/date/${date}.json`
    );
    res.json(data);
  } catch (error) {
    console.error('Activities fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch activity data' });
  }
});

/**
 * Get heart rate data for a date
 */
router.get('/heart/date/:date', async (req, res) => {
  try {
    const { date } = req.params; // Format: YYYY-MM-DD
    const data = await makeApiRequest(
      req.user.fitbit.access_token,
      `/1/user/-/activities/heart/date/${date}/1d.json`
    );
    res.json(data);
  } catch (error) {
    console.error('Heart rate fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch heart rate data' });
  }
});

/**
 * Get sleep data for a date
 */
router.get('/sleep/date/:date', async (req, res) => {
  try {
    const { date } = req.params; // Format: YYYY-MM-DD
    const data = await makeApiRequest(
      req.user.fitbit.access_token,
      `/1.2/user/-/sleep/date/${date}.json`
    );
    res.json(data);
  } catch (error) {
    console.error('Sleep fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch sleep data' });
  }
});

/**
 * Get weight logs for a date range
 */
router.get('/weight/date/:startDate/:endDate', async (req, res) => {
  try {
    const { startDate, endDate } = req.params; // Format: YYYY-MM-DD
    const data = await makeApiRequest(
      req.user.fitbit.access_token,
      `/1/user/-/body/log/weight/date/${startDate}/${endDate}.json`
    );
    res.json(data);
  } catch (error) {
    console.error('Weight fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch weight data' });
  }
});

/**
 * Generic endpoint to proxy any Fitbit API request
 * Use with caution as it exposes the entire Fitbit API
 */
router.get('/proxy/*', async (req, res) => {
  try {
    // Extract the Fitbit API path from the URL
    const apiPath = req.params[0];
    if (!apiPath) {
      return res.status(400).json({ error: 'API path is required' });
    }

    const data = await makeApiRequest(
      req.user.fitbit.access_token,
      `/${apiPath}`
    );
    res.json(data);
  } catch (error) {
    console.error('Proxy request error:', error);
    res.status(error.response?.status || 500).json({ 
      error: 'Failed to fetch data from Fitbit API',
      details: error.response?.data || error.message
    });
  }
});

export default router;