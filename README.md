# Azure AD + Amazon Cognito Authentication (Node.js)

## Requirements Met

- Login with Azure AD via Cognito Hosted UI
- Callback handled locally
- ID Token, Access Token retrieved
- User info retrieved from access token
- Session maintained via express-session
- Display user attributes on dashboard

## How to Run

1. Clone the project
2. Create a `.env` file with the following:

```env
COGNITO_DOMAIN=...
CLIENT_ID=...
CLIENT_SECRET=...
REDIRECT_URI=...
AZURE_TENANT_ID=
AZURE_CLIENT_ID=
AZURE_CLIENT_SECRET=


## Install dependencies
npm install

## Run the server
node index.js

## Open in browser
http://localhost:3000/login
