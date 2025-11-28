import admin from 'firebase-admin';

// Initialize Firebase Admin SDK (reuse if already initialized)
if (!admin.apps.length) {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

  if (!projectId || !clientEmail || !privateKey) {
    console.error('Missing Firebase Admin credentials:', {
      hasProjectId: !!projectId,
      hasClientEmail: !!clientEmail,
      hasPrivateKey: !!privateKey,
    });
    throw new Error('Firebase Admin credentials not configured. Please set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY environment variables in Netlify.');
  }

  admin.initializeApp({
    credential: admin.credential.cert({
      projectId,
      clientEmail,
      privateKey,
    }),
  });
}

const INITIAL_JENBUCKS = 500;

export const handler = async (event) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    // Verify Firebase ID token from Authorization header
    const authHeader = event.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return {
        statusCode: 401,
        body: JSON.stringify({ error: 'Unauthorized - Missing authentication token' }),
      };
    }

    const idToken = authHeader.split('Bearer ')[1];
    
    // Verify the Firebase ID token
    let decodedToken;
    try {
      decodedToken = await admin.auth().verifyIdToken(idToken);
    } catch (error) {
      return {
        statusCode: 401,
        body: JSON.stringify({ error: 'Unauthorized - Invalid token' }),
      };
    }

    // Check if the user is the admin
    if (decodedToken.email !== 'alexander.morosow@gmail.com') {
      return {
        statusCode: 403,
        body: JSON.stringify({ error: 'Forbidden - Admin access required' }),
      };
    }

    const db = admin.firestore();
    
    console.log('🚀 Starting balance initialization...');
    
    // Get all users from the users collection
    const usersSnapshot = await db.collection('users').get();
    
    console.log(`📊 Found ${usersSnapshot.size} users`);
    
    let initialized = 0;
    let alreadyExists = 0;
    let errors = 0;
    const errorDetails = [];
    
    // Process each user
    for (const userDoc of usersSnapshot.docs) {
      const userId = userDoc.id;
      
      try {
        // Check if balance already exists
        const balanceDoc = await db.collection('jenbucks').doc(userId).get();
        
        if (!balanceDoc.exists) {
          // Create initial balance
          await db.collection('jenbucks').doc(userId).set({
            userId: userId,
            balance: INITIAL_JENBUCKS,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
          });
          initialized++;
          console.log(`✅ Initialized balance for user: ${userId}`);
        } else {
          alreadyExists++;
          console.log(`ℹ️  Balance already exists for user: ${userId}`);
        }
      } catch (error) {
        errors++;
        const errorMsg = `Error processing user ${userId}: ${error.message}`;
        errorDetails.push(errorMsg);
        console.error(`❌ ${errorMsg}`);
      }
    }
    
    // Summary
    const summary = {
      success: true,
      initialized,
      alreadyExists,
      errors,
      total: usersSnapshot.size,
      errorDetails: errors > 0 ? errorDetails : undefined,
    };
    
    console.log('\n📈 Summary:', summary);
    
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(summary),
    };
  } catch (error) {
    console.error('❌ Fatal error initializing balances:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        error: error.message,
      }),
    };
  }
};