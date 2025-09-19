import admin from "firebase-admin";
import dotenv from "dotenv";

dotenv.config();

let serviceAccount;
try {
  if (!process.env.FIREBASE_SERVICE_ACCOUNT) {
    throw new Error('FIREBASE_SERVICE_ACCOUNT não está definido');
  }
  serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  if (process.env.FIREBASE_PRIVATE_KEY) {
    serviceAccount.private_key = process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n");
  }
} catch (error) {
  console.error('Erro ao configurar Firebase:', error.message);
  // Configuração mínima para evitar crash
  serviceAccount = {
    type: "service_account",
    project_id: "demo-project",
    private_key: "",
    client_email: "demo@demo.com"
  };
}

let db;
try {
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: process.env.FIREBASE_DBURL || 'https://demo.firebaseio.com',
    });
  }
  db = admin.database();
} catch (error) {
  console.error('Erro ao inicializar Firebase Admin:', error.message);
  // Mock para desenvolvimento
  db = {
    ref: () => ({
      once: () => Promise.resolve({ val: () => null }),
      set: () => Promise.resolve(),
      push: () => Promise.resolve({ key: 'mock-key' }),
      update: () => Promise.resolve(),
      remove: () => Promise.resolve()
    })
  };
}

export default db;
