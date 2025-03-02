// utils/fitbit.js
import { AuthorizationCode } from 'simple-oauth2';
import axios from 'axios';

// Fitbit API configuration
const fitbitConfig = {
  client: {
    id: process.env.FITBIT_CLIENT_ID,
    secret: process.env.FITBIT_CLIENT_SECRET
  },
  auth: {
    tokenHost: 'https://api.fitbit.com',
    tokenPath: '/oauth2/token',
    authorizePath: '/oauth2/authorize',
    revokePath: '/oauth2/revoke'
  }
};

// Create OAuth2 client
const oauth2 = new AuthorizationCode(fitbitConfig);

/**
 * Get authorization URL for Fitbit OAuth2
 */
const getAuthorizationUrl = () => {
  // Log scope to debug
  console.log('FITBIT_SCOPE from env:', process.env.FITBIT_SCOPE);
  
  // Make sure scope is properly defined
  const scope = process.env.FITBIT_SCOPE || 'activity profile';
  
  const authorizationUri = oauth2.authorizeURL({
    redirect_uri: process.env.FITBIT_REDIRECT_URI,
    scope: scope,
    response_type: 'code'
  });
  
  return authorizationUri;
};

/**
 * Exchange authorization code for access token
 */
const getAccessToken = async (code) => {
  try {
    const tokenParams = {
      code,
      redirect_uri: process.env.FITBIT_REDIRECT_URI,
      grant_type: 'authorization_code'
    };

    const result = await oauth2.getToken(tokenParams);
    return processTokenResponse(result.token);
  } catch (error) {
    console.error('Access Token Error:', error.message);
    throw error;
  }
};

/**
 * Refresh access token using refresh token
 */
const refreshAccessToken = async (refreshToken) => {
  try {
    // Fitbit requires a different approach for refreshing tokens
    const response = await axios({
      method: 'post',
      url: 'https://api.fitbit.com/oauth2/token',
      headers: {
        'Authorization': `Basic ${Buffer.from(
          `${process.env.FITBIT_CLIENT_ID}:${process.env.FITBIT_CLIENT_SECRET}`
        ).toString('base64')}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      data: `grant_type=refresh_token&refresh_token=${refreshToken}`
    });

    return processTokenResponse(response.data);
  } catch (error) {
    console.error('Refresh Token Error:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Process token response and add expiration time
 */
const processTokenResponse = (token) => {
  // Add expires_at property using expires_in
  const expiryTime = new Date();
  expiryTime.setSeconds(expiryTime.getSeconds() + token.expires_in);
  
  return {
    access_token: token.access_token,
    refresh_token: token.refresh_token,
    token_type: token.token_type,
    expires_in: token.expires_in,
    expires_at: expiryTime,
    scope: token.scope,
    user_id: token.user_id
  };
};

/**
 * Make authenticated request to Fitbit API
 */
const makeApiRequest = async (accessToken, endpoint, method = 'get', data = null) => {
  try {
    const config = {
      method,
      url: `https://api.fitbit.com${endpoint}`,
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept-Language': 'en_US'
      }
    };

    if (data && (method === 'post' || method === 'put')) {
      config.data = data;
    }

    const response = await axios(config);
    return response.data;
  } catch (error) {
    console.error('Fitbit API Error:', error.response?.data || error.message);
    throw error;
  }
};

export {
  getAuthorizationUrl,
  getAccessToken,
  refreshAccessToken,
  makeApiRequest
};