import admin from 'firebase-admin';
import serviceAccount from './serviceAccountKey.json' assert { type: 'json' };

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: 'https://ameciclo-admin-bot.firebaseio.com'
  });
}

const db = admin.database();

export async function getProjects() {
  const ref = db.ref('projects');
  const snapshot = await ref.once('value');
  return snapshot.val();
}

export async function getSuppliers() {
  const ref = db.ref('recipients');
  const snapshot = await ref.once('value');
  return snapshot.val();
}

// export async function setPaymentRequest() {
//   return 
// }

export default db;