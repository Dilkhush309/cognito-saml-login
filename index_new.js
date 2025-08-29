const express = require("express");
const axios = require("axios");
const qs = require("querystring");
require("dotenv").config();

const app = express();
const port = 3000;

// 1. Login via Cognito Hosted UI with Azure AD
app.get("/login", (req, res) => {
  const redirect =
    `${process.env.COGNITO_DOMAIN}/login?` +
    `response_type=code&` +
    `client_id=${process.env.CLIENT_ID}&` +
    `redirect_uri=${encodeURIComponent(process.env.REDIRECT_URI)}&` +
    `scope=email+openid+profile&` +
    `identity_provider=AzureAD`;

  res.redirect(redirect);
});

// 2. Logout via Cognito
app.get("/logout", (req, res) => {
  const logoutUrl =
    `${process.env.COGNITO_DOMAIN}/logout?` +
    `client_id=${process.env.CLIENT_ID}&` +
    `logout_uri=${encodeURIComponent(process.env.LOGOUT_URI)}`;

  res.redirect(logoutUrl);
});

// 3. Logout Callback
app.get("/logout-callback", (req, res) => {
  res.send(`
    <h1>ログアウト成功</h1>
    <p>You have been logged out.</p>
    <p><a href="/login">Login again</a></p>
  `);
});

// 4. Auth Callback from Cognito
app.get("/auth-callback", async (req, res) => {
  const code = req.query.code;
  if (!code) return res.status(400).send("Missing code in query");

  const tokenUrl = `${process.env.COGNITO_DOMAIN}/oauth2/token`;
  const payload = {
    grant_type: "authorization_code",
    code,
    client_id: process.env.CLIENT_ID,
    redirect_uri: process.env.REDIRECT_URI,
  };

  const headers = {
    "Content-Type": "application/x-www-form-urlencoded",
  };

  if (process.env.CLIENT_SECRET) {
    const basicAuth = Buffer.from(
      `${process.env.CLIENT_ID}:${process.env.CLIENT_SECRET}`
    ).toString("base64");
    headers["Authorization"] = `Basic ${basicAuth}`;
  }

  try {
    const response = await axios.post(tokenUrl, qs.stringify(payload), {
      headers,
    });
    const { id_token, access_token, refresh_token } = response.data;

    res.send(`
      <h1>ログイン成功</h1>
      <p><strong>IDトークン:</strong></p>
      <textarea rows="8" cols="100">${id_token}</textarea>
      <p><strong>アクセストークン:</strong></p>
      <textarea rows="8" cols="100">${access_token}</textarea>
      ${
        refresh_token
          ? `<p><strong>リフレッシュトークン:</strong></p><textarea rows="8" cols="100">${refresh_token}</textarea>`
          : ""
      }
      <p><a href="/users">➡ AzureADユーザー一覧を取得</a></p>
      <hr/>
      <p><a href="/logout-callback">Logout</a></p>
    `);
  } catch (err) {
    console.error("Token exchange failed:", err.response?.data || err.message);
    res
      .status(500)
      .send(
        `<h2>Token exchange failed</h2><pre>${JSON.stringify(
          err.response?.data || err.message,
          null,
          2
        )}</pre>`
      );
  }
});

// 5. Fetch Azure AD Users
app.get("/users", async (req, res) => {
  try {
    // Step 1: Get access token for Microsoft Graph
    const tokenResponse = await axios.post(
      `https://login.microsoftonline.com/${process.env.AZURE_TENANT_ID}/oauth2/v2.0/token`,
      qs.stringify({
        client_id: process.env.AZURE_CLIENT_ID,
        client_secret: process.env.AZURE_CLIENT_SECRET,
        scope: "https://graph.microsoft.com/.default",
        grant_type: "client_credentials",
      }),
      {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      }
    );

    const accessToken = tokenResponse.data.access_token;

    // Step 2: Call Microsoft Graph API
    const usersResponse = await axios.get(
      "https://graph.microsoft.com/v1.0/users",
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    const users = usersResponse.data.value;

    // Step 3: Render response with Logout button
    let userListHTML = "<h1>Microsoft Entra ID Users</h1><ul>";
    users.forEach((user) => {
      userListHTML += `<li>${user.displayName || "No Name"} - ${
        user.userPrincipalName
      }</li>`;
    });
    userListHTML += "</ul>";
    userListHTML += '<hr/><p><a href="/logout">🚪 Logout</a></p>';

    res.send(userListHTML);
  } catch (error) {
    console.error(
      "Failed to fetch users:",
      error.response?.data || error.message
    );
    res
      .status(500)
      .send(
        `<h2>Failed to fetch users</h2><pre>${JSON.stringify(
          error.response?.data || error.message,
          null,
          2
        )}</pre>`
      );
  }
});

// Start Server
app.listen(port, () => {
  console.log(`Node.js app running at http://localhost:${port}`);
});
