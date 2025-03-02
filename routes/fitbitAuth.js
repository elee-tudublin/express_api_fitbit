// routes/auth.js
import express from 'express';
import { getAuthorizationUrl, getAccessToken } from '../utils/fitbit.js';
import { setCookieToken, clearAuthCookie, verifyToken } from '../utils/auth.js';

const router = express.Router();

/**
 * Initiate the OAuth2 login flow
 */
router.get('/login', (req, res) => {
  try {
    const authUrl = getAuthorizationUrl();
    res.redirect(authUrl);
  } catch (error) {
    console.error('Login route error:', error);
    res.status(500).json({ error: 'Failed to initiate login' });
  }
});

/**
 * OAuth2 callback handler
 */
router.get('/callback', async (req, res) => {
  try {
    const { code } = req.query;
    
    if (!code) {
      const error = req.query.error || 'No authorization code received';
      return res.status(400).json({ error });
    }

    // Exchange authorization code for tokens
    const tokenData = await getAccessToken(code);
    
    // Set JWT in HTTP-only cookie
    const token = setCookieToken(res, tokenData);
    
    // Check if client wants JSON response instead of redirect
    const wantJson = req.query.format === 'json' || req.headers.accept === 'application/json';
    
    if (wantJson) {
      // Return token in JSON response for API/mobile clients
      res.json({
        success: true,
        token,
        user_id: tokenData.user_id,
        expires_at: tokenData.expires_at
      });
    } else {
      // Redirect web clients with success message
      res.redirect('/?auth=success');
    }
  } catch (error) {
    console.error('Callback route error:', error);
    res.status(500).json({ error: 'Failed to complete authentication' });
  }
});

/**
 * Logout and clear cookie
 */
router.get('/logout', (req, res) => {
  clearAuthCookie(res);
  res.redirect('/');
});

/**
 * Get authentication status and token info
 */
router.get('/status', (req, res) => {
  const decoded = verifyToken(req);
  
  if (decoded && decoded.fitbit) {
    const { user_id, fitbit } = decoded;
    res.json({
      authenticated: true,
      user_id,
      expires_at: fitbit.expires_at,
      scope: fitbit.scope
    });
  } else {
    res.json({ authenticated: false });
  }
});

/**
 * Get token for clients needing bearer token
 * This is an optional endpoint for clients that can't use cookies
 */
router.get('/token', (req, res) => {
  const decoded = verifyToken(req);
  
  if (!decoded) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  
  // Generate a fresh token from the decoded data to ensure it's valid
  const token = jwt.sign({
    user_id: decoded.user_id,
    fitbit: decoded.fitbit
  }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '1d'
  });
  
  res.json({
    token,
    user_id: decoded.user_id,
    expires_at: decoded.fitbit.expires_at
  });
});

export default router;