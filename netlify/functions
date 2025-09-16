const { auth } = require('netlify-cms-oauth-provider-node');

exports.handler = auth({
  client_id: process.env.AUTH0_CLIENT_ID,
  client_secret: process.env.AUTH0_CLIENT_SECRET,
  auth_url: 'https://customdesignsla.us.auth0.com',
  token_url: 'https://customdesignsla.us.auth0.com/oauth/token'
});
