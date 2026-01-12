import admin from 'firebase-admin';

const databaseURL = process.env.DASHBOARD_FIREBASE_DATABASE_URL || "https://botaprarodar-routes-default-rtdb.firebaseio.com/";
const apiKey = process.env.DASHBOARD_FIREBASE_API_KEY;

// Usar uma instância separada para o dashboard
let dashboardApp;
try {
  dashboardApp = admin.app('dashboard');
} catch {
  dashboardApp = admin.initializeApp({
    databaseURL,
    credential: admin.credential.cert({
      projectId: "botaprarodar-routes",
      clientEmail: "firebase-adminsdk-49bn7@ameciclo-admin-bot.iam.gserviceaccount.com",
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
    })
  }, 'dashboard');
}

export const database = dashboardApp.database();