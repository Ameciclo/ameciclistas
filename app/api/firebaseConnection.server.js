import db from "./firebaseAdmin.server";

export async function getProjects() {
  const ref = db.ref("projects");
  const snapshot = await ref.once("value");
  return snapshot.val();
}

export async function getSuppliers() {
  const ref = db.ref("recipients");
  const snapshot = await ref.once("value");
  return snapshot.val();
}

export async function savePaymentRequest(paymentRequest) {

  return new Promise((resolve, reject) => {
    const ref = db.ref("requests");
    const key = ref.push().key;

    if (!key) {
      return reject(new Error("Falha ao gerar chave para a solicitação."));
    }

    paymentRequest.id = key;

    ref
      .child(key)
      .update(paymentRequest)
      .then((snapshot) => {
        resolve(snapshot);
      })
      .catch((err) => {
        reject(err);
      });
  });
}

// Função para buscar a categoria de um usuário no Firebase Realtime Database
export const getCategories = async () => {
  try {
    const userRef = db.ref("telegram_users");
    const snapshot = await userRef.once("value");

    if (snapshot.exists()) {
      return snapshot.val();
    } else {
      console.error("No data available for this user.");
      return null;
    }
  } catch (error) {
    console.error("Error fetching user category:", error);
    return null;
  }
};

export async function saveRecipient(recipientInfo) {

  return new Promise((resolve, reject) => {
    const ref = db.ref("recipients");
    const key = ref.push().key;

    if (!key) {
      return reject(new Error("Falha ao gerar chave para a solicitação."));
    }

    if (!recipientInfo?.id) throw new Error("Você não está no telegram");
    recipientInfo.id = key;

    ref
      .child(key)
      .update(recipientInfo)
      .then((snapshot) => {
        resolve(snapshot);
      })
      .catch((err) => {
        reject(err);
      });
  });
}

export async function saveCalendarEvent(eventInfo) {

  return new Promise((resolve, reject) => {
    const ref = db.ref("calendar");
    const key = ref.push().key;

    if (!key) {
      return reject(new Error("Falha ao gerar chave para a solicitação."));
    }

    eventInfo.id = key;

    ref
      .child(key)
      .update(eventInfo)
      .then((snapshot) => {
        resolve(snapshot);
      })
      .catch((err) => {
        reject(err);
      });
  });
}

export async function createUser(userInfo, typeUser) {
  return new Promise((resolve, reject) => {
    const ref = db.ref("telegram_users");

    ref
      .update({[userInfo?.id]: typeUser})
      .then((snapshot) => {
        resolve(snapshot);
      })
      .catch((err) => {
        reject(err);
      });
  });
}