import admin from "firebase-admin";
import serviceAccount from "./serviceAccountKey.json" assert { type: "json" };

const dbURL =
  process.env.NODE_ENV === "production"
    ? "https://ameciclo-admin-bot.firebaseio.com"
    : "https://ameciclo-bot-test-default-rtdb.firebaseio.com";

console.log(dbURL);
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: dbURL,
  });
}

const db = admin.database();

export default db;
