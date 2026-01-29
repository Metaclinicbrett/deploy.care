# Gmail API Setup for Deploy Care

This guide walks through setting up Gmail API for sending transactional emails from your deploy.care Google Workspace account.

## Prerequisites

- Google Workspace account (deploy.care)
- DKIM configured (you're doing this now!)
- Access to Google Cloud Console

## Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing one
3. Name it something like "Deploy Care Email"

## Step 2: Enable Gmail API

1. In Cloud Console, go to **APIs & Services** > **Library**
2. Search for "Gmail API"
3. Click **Enable**

## Step 3: Configure OAuth Consent Screen

1. Go to **APIs & Services** > **OAuth consent screen**
2. Select **Internal** (since it's for your Workspace domain)
3. Fill in:
   - App name: `Deploy Care Notifications`
   - User support email: your email
   - Developer contact: your email
4. Click **Save and Continue**
5. Add scopes:
   - `https://www.googleapis.com/auth/gmail.send`
6. Save and continue through remaining steps

## Step 4: Create OAuth Credentials

1. Go to **APIs & Services** > **Credentials**
2. Click **Create Credentials** > **OAuth client ID**
3. Application type: **Web application**
4. Name: `Deploy Care Email Service`
5. Authorized redirect URIs: `https://developers.google.com/oauthplayground`
6. Click **Create**
7. **Save the Client ID and Client Secret!**

## Step 5: Get Refresh Token

1. Go to [OAuth Playground](https://developers.google.com/oauthplayground)
2. Click gear icon (⚙️) in top right
3. Check **Use your own OAuth credentials**
4. Enter your Client ID and Client Secret
5. Close settings

6. In left panel, find **Gmail API v1**
7. Select `https://www.googleapis.com/auth/gmail.send`
8. Click **Authorize APIs**
9. Sign in with notifications@deploy.care (or your sending account)
10. Click **Exchange authorization code for tokens**
11. **Copy the Refresh Token!**

## Step 6: Configure Supabase Secrets

In your Supabase dashboard:

1. Go to **Project Settings** > **Edge Functions**
2. Add these secrets:

```
GMAIL_CLIENT_ID=your-client-id.apps.googleusercontent.com
GMAIL_CLIENT_SECRET=your-client-secret
GMAIL_REFRESH_TOKEN=your-refresh-token
GMAIL_SENDER_EMAIL=notifications@deploy.care
```

Or via CLI:

```bash
supabase secrets set GMAIL_CLIENT_ID=your-client-id
supabase secrets set GMAIL_CLIENT_SECRET=your-client-secret
supabase secrets set GMAIL_REFRESH_TOKEN=your-refresh-token
supabase secrets set GMAIL_SENDER_EMAIL=notifications@deploy.care
```

## Step 7: Deploy Edge Function

```bash
cd care-plan-angular
supabase functions deploy send-email
```

## Step 8: Test

Test the email function:

```bash
curl -X POST 'https://your-project.supabase.co/functions/v1/send-email' \
  -H 'Authorization: Bearer YOUR_ANON_KEY' \
  -H 'Content-Type: application/json' \
  -d '{
    "to": ["test@example.com"],
    "subject": "Test Email",
    "bodyHtml": "<h1>Hello!</h1><p>This is a test email from Deploy Care.</p>"
  }'
```

## DKIM Setup (What you're doing now!)

For better deliverability, make sure DKIM is configured:

1. In Google Workspace Admin Console
2. Go to **Apps** > **Google Workspace** > **Gmail** > **Authenticate email**
3. Select your domain (deploy.care)
4. Click **Generate new record**
5. Add the TXT record to your DNS
6. Click **Start authentication**

## SPF Record

Also ensure your SPF record includes Google:

```
v=spf1 include:_spf.google.com ~all
```

## DMARC Record (Recommended)

Add a DMARC record for monitoring:

```
_dmarc.deploy.care TXT "v=DMARC1; p=none; rua=mailto:dmarc@deploy.care"
```

Start with `p=none` to monitor, then move to `p=quarantine` or `p=reject` once you're confident.

## Troubleshooting

### "Token has been expired or revoked"
- Refresh tokens can expire if not used for 6 months
- Re-run Step 5 to get a new refresh token

### "Insufficient Permission"
- Make sure the Gmail API scope is authorized
- Check that the OAuth consent screen is configured correctly

### Emails going to spam
- Wait for DKIM to propagate (can take up to 48 hours)
- Check SPF and DMARC records
- Start with known recipients first

### Rate limits
Gmail API limits:
- 100 emails per day per user (for free accounts)
- 2000 emails per day for Workspace accounts
- For higher volume, consider a dedicated email service

## Architecture

```
┌─────────────┐     ┌─────────────────┐     ┌─────────────┐
│   Angular   │────▶│ Supabase Edge   │────▶│  Gmail API  │
│    App      │     │    Function     │     │             │
└─────────────┘     └─────────────────┘     └─────────────┘
                            │
                            ▼
                    ┌─────────────┐
                    │  Supabase   │
                    │  (logging)  │
                    └─────────────┘
```

## Security Notes

- Never expose Gmail credentials in frontend code
- Use Supabase Edge Functions to keep credentials server-side
- The refresh token gives full send access - protect it!
- Consider using a service account for production
