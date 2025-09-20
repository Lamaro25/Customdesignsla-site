// netlify/functions/auth.js
const { default: oauthProvider } = require("netlify-cms-oauth-provider-node");

exports.handler = oauthProvider({
  // use your Auth0 details here
  provider: "auth0",
  client_id: process.env.AUTH0_CLIENT_ID,
  client_secret: process.env.AUTH0_CLIENT_SECRET,
  auth_url: "https://dev-i1asef6df0034r3d.us.auth0.com",
  token_url: "https://dev-i1asef6df0034r3d.us.auth0.com/oauth/token",
  // match your API identifier
  audience: "https://api.customdesignsla.com",
});
