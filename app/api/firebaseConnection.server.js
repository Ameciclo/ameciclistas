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

export async function saveCalendarEvent(eventInfo) {
  return new Promise((resolve, reject) => {
    const ref = db.ref("calendar");
    const key = ref.push().key;

    if (!key) {
      return reject(new Error("Falha ao gerar chave para a solicitação."));
    }

    const randomHash = Math.random().toString(36).substring(2, 8);
    const { startDate } = eventInfo;
    const childName = startDate.replace(/[:.]/g, "-") + "-" + randomHash;
    eventInfo.id = childName;

    ref
      .child(childName)
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

// Funções para Controle de Recursos Independentes
export async function getProducts() {
  const ref = db.ref("resources/products");
  const snapshot = await ref.once("value");
  return snapshot.val() || {};
}

export async function getSales() {
  const ref = db.ref("resources/sales");
  const snapshot = await ref.once("value");
  return snapshot.val() || {};
}

export async function getDonations() {
  const ref = db.ref("resources/donations");
  const snapshot = await ref.once("value");
  return snapshot.val() || {};
}

export async function saveSale(saleData) {
  return new Promise((resolve, reject) => {
    const ref = db.ref("resources/sales");
    const key = ref.push().key;

    if (!key) {
      return reject(new Error("Falha ao gerar chave para a venda."));
    }

    saleData.id = key;
    saleData.createdAt = new Date().toISOString();

    ref
      .child(key)
      .update(saleData)
      .then((snapshot) => {
        resolve(snapshot);
      })
      .catch((err) => {
        reject(err);
      });
  });
}

export async function saveDonation(donationData) {
  return new Promise((resolve, reject) => {
    const ref = db.ref("resources/donations");
    const key = ref.push().key;

    if (!key) {
      return reject(new Error("Falha ao gerar chave para a doação."));
    }

    donationData.id = key;
    donationData.createdAt = new Date().toISOString();

    ref
      .child(key)
      .update(donationData)
      .then((snapshot) => {
        resolve(snapshot);
      })
      .catch((err) => {
        reject(err);
      });
  });
}

export async function updateSaleStatus(saleId, status, additionalData = {}) {
  return new Promise((resolve, reject) => {
    const ref = db.ref(`resources/sales/${saleId}`);
    
    const updateData = {
      status,
      ...additionalData
    };

    if (status === "PAID") {
      updateData.paidAt = new Date().toISOString();
    } else if (status === "CONFIRMED") {
      updateData.confirmedAt = new Date().toISOString();
    }

    ref
      .update(updateData)
      .then((snapshot) => {
        resolve(snapshot);
      })
      .catch((err) => {
        reject(err);
      });
  });
}

export async function updateDonationStatus(donationId, status, additionalData = {}) {
  return new Promise((resolve, reject) => {
    const ref = db.ref(`resources/donations/${donationId}`);
    
    const updateData = {
      status,
      ...additionalData
    };

    if (status === "PAID") {
      updateData.paidAt = new Date().toISOString();
    } else if (status === "CONFIRMED") {
      updateData.confirmedAt = new Date().toISOString();
    }

    ref
      .update(updateData)
      .then((snapshot) => {
        resolve(snapshot);
      })
      .catch((err) => {
        reject(err);
      });
  });
}
