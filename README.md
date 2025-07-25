# Azure AD + Amazon Cognito 認証 (Node.js)

## 要件を満たしています

- Cognito ホスト UI 経由で Azure AD にログイン
- コールバックがローカルで処理されます
- ID トークンとアクセス トークンが取得されます
- アクセス トークンからユーザー情報が取得されます
- Express-Session 経由でセッションが維持されます
- ダッシュボードにユーザー属性が表示されます

## 実行方法

1. プロジェクトのクローンを作成する https://github.com/Dilkhush309/cognito-saml-login.git
2. 以下の内容で `.env` ファイルを作成します。.env を Slack DM で共有します。

```env
COGNITO_DOMAIN=
CLIENT_ID=
CLIENT_SECRET=
REDIRECT_URI=

AZURE_TENANT_ID=
AZURE_CLIENT_ID=
AZURE_CLIENT_SECRET=


## Dependenciesをインストール
npm install

## サーバーを実行する
node index.js

## ブラウザで開く
http://localhost:3000/login
