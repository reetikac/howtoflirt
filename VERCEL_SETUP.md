# Vercel Deployment Setup

## Critical: Set Environment Variable

The app **will not work** on Vercel without this environment variable.

### Steps:

1. Go to your Vercel project dashboard
2. Click on **Settings** tab
3. Click on **Environment Variables** in the left sidebar
4. Add a new environment variable:
   - **Name:** `ANTHROPIC_API_KEY`
   - **Value:** Your Claude API key from https://console.anthropic.com/
   - **Environment:** Select all (Production, Preview, Development)
5. Click **Save**
6. **Redeploy** your project (Settings → Deployments → Click "..." on latest → Redeploy)

### Get Your API Key:
Get your Anthropic API key from: https://console.anthropic.com/

Copy your API key from your local `.env.local` file or generate a new one from the Anthropic console.

## Verification

After setting the environment variable and redeploying:
- The app should generate personalized AI suggestions
- If you see an error about "API key missing", the environment variable is not set correctly
- Check Vercel logs (Settings → Deployments → Click on deployment → View Function Logs)

## Troubleshooting

If AI suggestions are still not working:
1. Verify the environment variable is set in Vercel
2. Check that you selected all environments (Production, Preview, Development)
3. Make sure you redeployed after adding the variable
4. Check Vercel function logs for detailed error messages
