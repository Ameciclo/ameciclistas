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
  console.log(snapshot.val())
  return snapshot.val();
}

getProjects()

export default db;

