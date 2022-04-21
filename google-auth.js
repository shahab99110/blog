const UI_ROOT_URI = "http://localhost:3000/"; // client port

const GOOGLE_CLIENT_ID =
  process.env.GOOGLE_CLIENT_ID ||
  "779780986432-2n82nk7u1jho2kum1j3628s8gtui52o2.apps.googleusercontent.com"; // replace “....” with your client id
const GOOGLE_CLIENT_SECRET =
  process.env.GOOGLE_CLIENT_SECRET || "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"; // replace “....” with your secret id
 
const redirectURI = "auth/google";
const SERVER_ROOT_URI = "http://localhost:3000"; // server port
const JWT_SECRET = "shhhhh";// jwt secret key, name whatever u want
const COOKIE_NAME = "auth_token";// cookie name, used in JWT later

function getTokens({ code, clientId, clientSecret, redirectUri }) {
  /*
   * Uses the code to get tokens
   * that can be used to fetch the user's profile
   */
  const url = "https://oauth2.googleapis.com/token";
  const values = {
    code,
    client_id: clientId,
    client_secret: clientSecret,
    redirect_uri: redirectUri,
    grant_type: "authorization_code",
  };
  return axios //we(server) send get request to google for token
    .post(url, querystring.stringify(values), {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    })  
    .then((res) => res.data)
    .catch((error) => {
      console.error(`Failed to fetch auth tokens`);
      throw new Error(error.message);
    });
}
 