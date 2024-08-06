"use strict";

window.mavefund = window.mavefund || {
  auth: {
    login: () => { },
    logout: () => { },
    isAuthenticated: () => { },
    signup: () => {}
  },
  loaded: false,
  checkedAuthentication: false

};

// initialize authentication
let auth0Client;
const fetchAuthConfig = () => fetch("/static/json/auth_config.json");

const configureClient = async () => {
  console.log("Configuring client...");
  const response = await fetchAuthConfig();
  const config = await response.json();

  auth0Client = await auth0.createAuth0Client({
    domain: config.domain,
    clientId: config.clientId,
    authorizationParams: {
      audience: config.audience
    },
    cacheLocation: "localstorage",
  });

  mavefund.loaded = true;
  const authLoadedEvent = new Event('authLoaded');
  document.dispatchEvent(authLoadedEvent);

}

window.onload = async () => {
  await configureClient()
}


// wait functions
const waitForInitilization = async () => {

  await new Promise((resolve) => {
    if (mavefund.loaded) {
      resolve();
    }

    document.addEventListener("authLoaded", resolve);
  })
}

const waitForAuthentication = async () => {
  await new Promise((resolve) => {
    if (mavefund.checkedAuthentication) {
      resolve();
    }
    document.addEventListener("authChecked", resolve);
  })
}



// Authentication stuff
// login
mavefund.auth.login = async (redirect_uri) => {
  console.log("Login....")
  if (!auth0Client) throw new Error("Authentication is initializing.");

  console.log("login")

  await auth0Client.loginWithRedirect({
    authorizationParams: {
      redirect_uri: redirect_uri ?? window.location.origin,
    }
  });
}

// logout
mavefund.auth.logout = async () => {
  if (!auth0Client) throw new Error("Authentication is initializing.");

  await auth0Client.logout({
    logoutParams: {
      returnTo: window.location.origin
    }
  });
}

//signup
mavefund.auth.signup = async (redirect_uri) => {
  console.log("Signup....")
  if (!auth0Client) throw new Error("Authentication is initializing.");

  console.log("signup")

  await auth0Client.loginWithRedirect({
    screen_hint: 'signup',
    authorizationParams: {
      redirect_uri: redirect_uri ?? window.location.origin,
    }
  });
}


// check if user is authenticated
mavefund.auth.isAuthenticated = async () => {
  const wrapper = async () => {

    console.log("Checking authentication....");
    await waitForInitilization();

    const isAuthenticated = await auth0Client.isAuthenticated();

    if (isAuthenticated) return true;

    const query = window.location.search;
    if (query.includes("code=") && query.includes("state=")) {

      // Process the login state
      await auth0Client.handleRedirectCallback();


      // // Use replaceState to redirect the user away and remove the querystring parameters
      // window.history.replaceState({}, document.title, "/");


      // Get the current URL without the query string
      var newUrl = window.location.protocol + '//' + window.location.host + window.location.pathname;

      // Replace the current history entry with the new URL
      // window.history.replaceState({}, document.title, newUrl);
      window.location.href = newUrl;




      return true;
    }

    return false;
  }

  const result = await wrapper();

  mavefund.checkedAuthentication = true;

  const checkEvent = new Event('authChecked');

  document.dispatchEvent(checkEvent);

  return result;

}


// get user
mavefund.auth.getUser = async () => {
  await waitForAuthentication();

  return (await auth0Client.getUser());

}


// get token 
mavefund.auth.getToken = async () => {
  await waitForAuthentication();
  const token = await auth0Client.getTokenSilently();

  return token;

}


mavefund.auth.redirectGuest = async (path) => {
  await waitForAuthentication();

  if (!mavefund.auth.isAuthenticated()) {
    window.location.replace(path);

  }


}