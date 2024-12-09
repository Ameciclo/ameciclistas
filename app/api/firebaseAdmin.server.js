import admin from "firebase-admin";
import dotenv from "dotenv";

dotenv.config();
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
serviceAccount.private_key = (process.env.FIREBASE_PRIVATE_KEY).replace(/\\n/g, "\n");

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: process.env.FIREBASE_DBURL,
  });
}

const db = admin.database();

export default db;
