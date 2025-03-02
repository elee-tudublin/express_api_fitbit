// middleware/auth.js
import { verifyToken } from '../utils/auth.js';
import { refreshAccessToken } from '../utils/fitbit.js';
import { setCookieToken } from '../utils/auth.js';

/**
 * Middleware to check if user is authenticated with Fitbit
 * and refresh token if needed
 */
const requireAuth = async (req, res, next) => {
  try {
    // Verify token from cookie or Authorization header
    const decoded = verifyToken(req);
    
    if (!decoded || !decoded.fitbit || !decoded.fitbit.access_token) {
      return res.status(401).json({ error: 'Not authenticated with Fitbit' });
    }

    // Extract Fitbit token data
    const fitbitData = decoded.fitbit;
    
    // Check if token is expired and needs refresh
    const now = new Date();
    const tokenExpiration = new Date(fitbitData.expires_at);
    
    // If token will expire in the next 10 minutes, refresh it
    if (tokenExpiration <= new Date(now.getTime() + 10 * 60 * 1000)) {
      console.log('Token expired or about to expire, refreshing...');
      
      try {
        const newTokenData = await refreshAccessToken(fitbitData.refresh_token);
        
        // Generate new JWT and set cookie
        setCookieToken(res, {
          ...newTokenData,
          user_id: decoded.user_id
        });
        
        // Update req.user with new token data
        req.user = {
          ...decoded,
          fitbit: newTokenData
        };
        
        console.log('Token refreshed successfully');
      } catch (error) {
        console.error('Failed to refresh token:', error.message);
        return res.status(401).json({ 
          error: 'Session expired', 
          message: 'Please re-authenticate with Fitbit' 
        });
      }
    } else {
      // Set user data in request for route handlers
      req.user = decoded;
    }

    // Continue to the next middleware/route handler
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ error: 'Authentication error' });
  }
};

export { requireAuth };