let auth0Client = null;

async function configureClient() {
  auth0Client = await auth0.createAuth0Client({
    domain: "dev-i1asef6df0034r3d.us.auth0.com",
    clientId: "X8mseT6hodGlF4JXnEVSHuuioC0caGs4",
    audience: "https://api.customdesignsla.com",
    useRefreshTokens: true,
    cacheLocation: "localstorage"
  });
}

async function login() {
  await auth0Client.loginWithRedirect({
    authorizationParams: {
      redirect_uri: window.location.origin + "/admin/callback",
      audience: "https://api.customdesignsla.com",
      scope: "offline_access read:designs write:designs"
    }
  });
}

function logout() {
  auth0Client.logout({
    logoutParams: {
      returnTo: window.location.origin
    }
  });
}

async function updateUI() {
  const isAuthenticated = await auth0Client.isAuthenticated();
  document.getElementById("btn-login").disabled = isAuthenticated;
  document.getElementById("btn-logout").disabled = !isAuthenticated;

  const userInfoElem = document.getElementById("user-info");
  if (isAuthenticated) {
    const user = await auth0Client.getUser();
    userInfoElem.textContent = `Welcome, ${user.email}`;
  } else {
    userInfoElem.textContent = "";
  }
}

window.onload = async () => {
  await configureClient();

  const query = window.location.search;
  if (query.includes("code=") && query.includes("state=")) {
    await auth0Client.handleRedirectCallback();
    window.history.replaceState({}, document.title, "/");
  }

  updateUI();
};
