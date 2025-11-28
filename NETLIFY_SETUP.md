# Netlify Environment Variables Setup

To make the `initializeJENbucksBalances` function work, you need to set the following environment variables in your Netlify dashboard.

## How to Set Environment Variables in Netlify

1. Go to your Netlify dashboard: https://app.netlify.com
2. Select your site (jenfest-app)
3. Go to **Site configuration** > **Environment variables**
4. Click **Add a variable** for each of the following:

## Required Environment Variables

### Firebase Admin SDK Credentials

These credentials allow the Netlify function to act as an admin and bypass client-side security rules.

```
FIREBASE_PROJECT_ID=jenfest-85757
```

```
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-fbsvc@jenfest-85757.iam.gserviceaccount.com
```

```
FIREBASE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----
...
-----END PRIVATE KEY-----
```

**IMPORTANT:** When pasting the private key:

- Copy the entire key including `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----`
- Netlify will handle the newlines automatically
- Do NOT add quotes around the key in Netlify

## Testing the Function

After setting up the environment variables:

1. Redeploy your site (or trigger a new deploy)
2. Log in to your app as alexander.morosow@gmail.com
3. Navigate to `/admin`
4. Click "Initialize Balances"
5. The function should now work without the "project_id" error

## Security Notes

- The function is protected by Firebase authentication
- Only alexander.morosow@gmail.com can execute it
- The private key is safely stored in Netlify's secure environment variables
- Never commit the private key to version control
