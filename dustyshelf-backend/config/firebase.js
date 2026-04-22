const admin = require('firebase-admin');

// Service account should be provided via environment variable as a JSON string
// or you can point to a local file. Here we'll use an environment variable for security.
const initializeFirebase = () => {
    try {
        if (!process.env.FIREBASE_SERVICE_ACCOUNT) {
            console.warn('FIREBASE_SERVICE_ACCOUNT not found in environment variables. Google Sign-in verification might fail.');
            return;
        }

        const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
        
        console.log('Firebase Admin Initialized');
    } catch (error) {
        console.error('Firebase Admin Initialization Error:', error.message);
    }
};

module.exports = { admin, initializeFirebase };
