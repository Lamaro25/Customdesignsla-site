// netlify/functions/auth.js
const jwt = require("jsonwebtoken");
const jwksClient = require("jwks-rsa");

const client = jwksClient({
  jwksUri: "https://dev-i1asef6df0034r3d.us.auth0.com/.well-known/jwks.json"
});

function getKey(header, callback) {
  client.getSigningKey(header.kid, function (err, key) {
    if (err) {
      callback(err, null);
    } else {
      const signingKey = key.getPublicKey();
      callback(null, signingKey);
    }
  });
}

exports.handler = async (event) => {
  const token = event.headers.authorization?.split(" ")[1];

  if (!token) {
    return {
      statusCode: 401,
      body: JSON.stringify({ error: "No token provided" })
    };
  }

  return new Promise((resolve) => {
    jwt.verify(
      token,
      getKey,
      {
        audience: "https://api.customdesignsla.com",
        issuer: "https://dev-i1asef6df0034r3d.us.auth0.com/",
        algorithms: ["RS256"]
      },
      (err, decoded) => {
        if (err) {
          resolve({
            statusCode: 401,
            body: JSON.stringify({ error: "Invalid token", details: err.message })
          });
        } else {
          resolve({
            statusCode: 200,
            body: JSON.stringify({ message: "Token is valid", user: decoded })
          });
        }
      }
    );
  });
};
