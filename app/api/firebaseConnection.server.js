import db from "./firebaseAdmin.server";

export async function getProjects() {
  const ref = db.ref("projects");
  const snapshot = await ref.once("value");
  return snapshot.val();
}

export async function getSuppliers() {
  const ref = db.ref("suppliers");
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

export const getUsersFirebase = async () => {
  try {
    const userRef = db.ref("subscribers");
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

export async function saveSupplierToDatabase(supplierData) {
  return new Promise((resolve, reject) => {
    const ref = db.ref("suppliers");
    const key = ref.push().key;

    if (!key) {
      return reject(new Error("Falha ao gerar chave para a solicitação."));
    }

    // Removemos a exigência estrita do ID do Telegram
    if (!supplierData || (!supplierData.id && !supplierData.name)) {
      return reject(
        new Error("Os dados do fornecedor são inválidos ou incompletos.")
      );
    }

    supplierData.id = key;

    ref
      .child(key)
      .update(supplierData)
      .then((snapshot) => {
        resolve(snapshot);
      })
      .catch((err) => {
        reject(err);
      });
  });
}

export async function saveCalendarEvent(eventInfo, eventName) {
  return new Promise((resolve, reject) => {
    const ref = db.ref("calendar");
    const key = ref.push().key;

    if (!key) {
      return reject(new Error("Falha ao gerar chave para a solicitação."));
    }

    eventInfo.id = key;

    ref
      .child(eventName)
      .update(eventInfo)
      .then((snapshot) => {
        resolve(snapshot);
      })
      .catch((err) => {
        reject(err);
      });
  });
}

export async function createUser(usersInfo) {
  return new Promise((resolve, reject) => {
    const ref = db.ref("subscribers");

    ref
      .update({ [usersInfo?.id]: "ANY_USER" })
      .then((snapshot) => {
        resolve(snapshot);
      })
      .catch((err) => {
        reject(err);
      });
  });
}

export async function createFullUser(usersInfo) {
  return new Promise((resolve, reject) => {
    const ref = db.ref("subscribers");

    const { id, name } = usersInfo;
    const user = {
      id,
      name,
      role: "ANY_USER",
      telegram_user: usersInfo,
    };

    ref
      .child(user.id)
      .update(user)
      .then((snapshot) => {
        resolve(snapshot);
      })
      .catch((err) => {
        reject(err);
      });
  });
}

export async function updateFullUser(usersInfo, role) {
  return new Promise((resolve, reject) => {
    const ref = db.ref("subscribers");

    const { id, name } = usersInfo;
    const user = {
      id,
      name,
      role,
      telgram_user: usersInfo,
    };

    ref
      .child(user.id)
      .update(user)
      .then((snapshot) => {
        resolve(snapshot);
      })
      .catch((err) => {
        reject(err);
      });
  });
}
