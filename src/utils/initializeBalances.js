import { collection, getDocs, doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';

const INITIAL_JENBUCKS = 500;

/**
 * Initialize JENbucks balance for all existing users who don't have one yet.
 * This script should be run once to set up balances for existing users.
 * New users will automatically get their balance when they first use the app.
 */
export const initializeBalancesForAllUsers = async () => {
  try {
    console.log('🚀 Starting balance initialization...');
    
    // Get all users from the users collection
    const usersRef = collection(db, 'users');
    const usersSnapshot = await getDocs(usersRef);
    
    console.log(`📊 Found ${usersSnapshot.size} users`);
    
    let initialized = 0;
    let alreadyExists = 0;
    let errors = 0;
    
    // Process each user
    for (const userDoc of usersSnapshot.docs) {
      const userId = userDoc.id;
      
      try {
        // Check if balance already exists
        const balanceRef = doc(db, 'jenbucks', userId);
        const balanceSnap = await getDoc(balanceRef);
        
        if (!balanceSnap.exists()) {
          // Create initial balance
          await setDoc(balanceRef, {
            userId: userId,
            balance: INITIAL_JENBUCKS,
            createdAt: serverTimestamp(),
          });
          initialized++;
          console.log(`✅ Initialized balance for user: ${userId}`);
        } else {
          alreadyExists++;
          console.log(`ℹ️  Balance already exists for user: ${userId}`);
        }
      } catch (error) {
        errors++;
        console.error(`❌ Error processing user ${userId}:`, error);
      }
    }
    
    // Summary
    console.log('\n📈 Summary:');
    console.log(`✅ Initialized: ${initialized}`);
    console.log(`ℹ️  Already existed: ${alreadyExists}`);
    console.log(`❌ Errors: ${errors}`);
    console.log(`📊 Total processed: ${usersSnapshot.size}`);
    
    return {
      success: true,
      initialized,
      alreadyExists,
      errors,
      total: usersSnapshot.size,
    };
  } catch (error) {
    console.error('❌ Fatal error initializing balances:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};
