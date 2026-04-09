# Google OAuth2 Setup Guide

Follow these steps to get your Google Client ID and Secret for Social Login.

## 1. Create a Project in Google Cloud Console

1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Click the project dropdown and select **New Project**.
3. Name it `Smart Attendance System` and click **Create**.

## 2. Configure OAuth Consent Screen

1. In the sidebar, go to **APIs & Services** > **OAuth consent screen**.
2. Select **External** and click **Create**.
3. Fill in the **App Information**:
   - App name: `Smart Attendance System`
   - User support email: (Your email)
   - Developer contact email: (Your email)
4. Click **Save and Continue** (skip Scopes and Test Users for now).

## 3. Create OAuth Credentials

1. Go to **APIs & Services** > **Credentials**.
2. Click **Create Credentials** > **OAuth client ID**.
3. **Application type**: Web application.
4. **Authorized JavaScript origins**:
   - `http://localhost:5000`
   - (Add your EC2 IP once known, e.g., `http://54.x.x.x:5000`)
5. **Authorized redirect URIs**:
   - `http://localhost:5000/api/google/callback`
   - (Add your EC2 IP equivalent, e.g., `http://54.x.x.x:5000/api/google/callback`)
6. Click **Create**.
7. **Copy your Client ID and Client Secret!**

## 4. Update the `.env` File

Add these to your `.env`:
```
GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_client_secret
CALLBACK_URL=http://localhost:5000/api/google/callback
```

> [!IMPORTANT]
> When you deploy to production on EC2, make sure to update the `CALLBACK_URL` in your `.env` to use your EC2 Public IP instead of `localhost`.
