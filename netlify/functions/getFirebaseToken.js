import admin from 'firebase-admin';

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

export const handler = async (event) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const { auth0Token } = JSON.parse(event.body);

    if (!auth0Token) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing auth0Token' }),
      };
    }

    // Verify the Auth0 token by calling Auth0's userinfo endpoint
    const userInfoResponse = await fetch(`https://${process.env.VITE_AUTH0_DOMAIN}/userinfo`, {
      headers: {
        Authorization: `Bearer ${auth0Token}`,
      },
    });

    if (!userInfoResponse.ok) {
      throw new Error('Invalid Auth0 token');
    }

    const userInfo = await userInfoResponse.json();
    const userId = userInfo.sub; // Auth0 user ID

    // Create a Firebase custom token
    const firebaseToken = await admin.auth().createCustomToken(userId);

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ firebaseToken }),
    };
  } catch (error) {
    console.error('Error creating Firebase token:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: 'Failed to create Firebase token',
        message: error.message 
      }),
    };
  }
};
