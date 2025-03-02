// utils/auth.js
import jwt from 'jsonwebtoken';

/**
 * Generate a JWT with Fitbit token data
 */
export const generateToken = (userData) => {
  const payload = {
    user_id: userData.user_id,
    fitbit: {
      access_token: userData.access_token,
      refresh_token: userData.refresh_token,
      token_type: userData.token_type,
      expires_at: userData.expires_at,
      scope: userData.scope
    }
  };

  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '1d'
  });
};

/**
 * Set HTTP-only cookie with JWT
 */
export const setCookieToken = (res, userData) => {
  // Generate JWT
  const token = generateToken(userData);
  
  // Set cookie options
  const cookieOptions = {
    httpOnly: true,
    maxAge: parseInt(process.env.COOKIE_MAX_AGE || 86400000), // Default: 1 day
    secure: process.env.COOKIE_SECURE === 'true',
    sameSite: 'lax'
  };
  
  // Set HTTP-only cookie
  res.cookie('auth_token', token, cookieOptions);
  
  return token;
};

/**
 * Verify and decode JWT from cookie or Authorization header
 */
export const verifyToken = (req) => {
  try {
    // Check cookie first
    const cookieToken = req.cookies?.auth_token;
    
    // Then check Authorization header
    const headerToken = req.headers.authorization?.startsWith('Bearer ')
      ? req.headers.authorization.split(' ')[1]
      : null;
    
    // Also check query parameter (less secure, but useful for testing)
    const queryToken = req.query?.token;
    
    // Use first available token (precedence: header > cookie > query)
    const token = headerToken || cookieToken || queryToken;
    
    if (!token) {
      return null;
    }
    
    // Verify the token
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    console.error('Token verification error:', error.message);
    return null;
  }
};

/**
 * Clear auth cookie
 */
export const clearAuthCookie = (res) => {
  res.clearCookie('auth_token');
};