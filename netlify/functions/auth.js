// netlify/functions/auth.js
const { auth } = require("netlify-cms-oauth-provider-node");

exports.handler = auth({
  // These are injected from your Netlify environment variables
  client_id: process.env.AUTH0_CLIENT_ID,
  client_secret: process.env.AUTH0_CLIENT_SECRET,

  // Auth0 endpoints
  auth_url: "https://dev-i1asef6df0034r3d.us.auth0.com/authorize",
  token_url: "https://dev-i1asef6df0034r3d.us.auth0.com/oauth/token",

  // Where Auth0 should redirect after login
  redirect_url: "https://customdesignsla.com/.netlify/functions/auth/callback",
});
