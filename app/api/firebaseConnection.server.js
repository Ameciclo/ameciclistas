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
export const getCategoryByUserId = async (userId) => {
  try {
    // Referência ao nó 'telegram_user' no banco de dados, com o userId fornecido
    const userRef = db.ref(`telegram_user/${userId}`);
    
    // Obtém o valor associado ao userId
    const snapshot = await userRef.once("value");

    if (snapshot.exists()) {
      // Retorna a categoria do usuário
      return snapshot.val();
    } else {
      // Caso o ID não exista no banco de dados
      console.error("No data available for this user.");
      return null;
    }
  } catch (error) {
    // Erro ao buscar no banco de dados
    console.error("Error fetching user category:", error);
    return null;
  }
};
