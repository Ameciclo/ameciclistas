import db from "./firebaseAdmin.server";

export async function getProjects() {
  const ref = db.ref("projects");
  const snapshot = await ref.once("value");
  return snapshot.val();
}

export async function getSuppliers() {
  try {
    const ref = db.ref("suppliers");
    const snapshot = await ref.once("value");
    const data = snapshot.val();
    return data || {};
  } catch (error) {
    console.error('Erro ao buscar fornecedores:', error);
    return {};
  }
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
      return snapshot.val() || {};
    } else {
      console.log("No data available for users.");
      return {};
    }
  } catch (error) {
    console.error("Error fetching user category:", error);
    return {};
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

export async function updateSupplierInDatabase(supplierId, supplierData) {
  return new Promise((resolve, reject) => {
    const ref = db.ref("suppliers");

    if (!supplierId || !supplierData) {
      return reject(
        new Error("ID do fornecedor ou dados são inválidos.")
      );
    }

    supplierData.id = supplierId;

    ref
      .child(supplierId)
      .update(supplierData)
      .then((snapshot) => {
        resolve(snapshot);
      })
      .catch((err) => {
        reject(err);
      });
  });
}

export async function removeSupplierFromDatabase(supplierId) {
  return new Promise((resolve, reject) => {
    const ref = db.ref("suppliers");

    if (!supplierId) {
      return reject(new Error("ID do fornecedor é obrigatório."));
    }

    console.log("Tentando remover fornecedor do Firebase com ID:", supplierId);
    
    // Primeiro verifica se o fornecedor existe
    ref.child(supplierId).once("value")
      .then((snapshot) => {
        if (!snapshot.exists()) {
          console.log("Fornecedor não encontrado no banco:", supplierId);
          return reject(new Error("Fornecedor não encontrado."));
        }
        
        console.log("Fornecedor encontrado, removendo...");
        return ref.child(supplierId).remove();
      })
      .then(() => {
        console.log("Fornecedor removido com sucesso do Firebase");
        resolve(true);
      })
      .catch((err) => {
        console.error("Erro ao remover fornecedor:", err);
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

export async function getBiblioteca() {
  const ref = db.ref("library");
  const snapshot = await ref.once("value");
  return snapshot.val();
}

export async function getEmprestimos() {
  const ref = db.ref("loan_record");
  const snapshot = await ref.once("value");
  return snapshot.val();
}

export async function getSolicitacoes() {
  const ref = db.ref("biblioteca_solicitacoes");
  const snapshot = await ref.once("value");
  return snapshot.val();
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
  return new Promise(async (resolve, reject) => {
    const ref = db.ref("resources/sales");
    const key = ref.push().key;

    if (!key) {
      return reject(new Error("Falha ao gerar chave para a venda."));
    }

    // Limpar campos undefined antes de salvar
    const cleanSaleData = Object.fromEntries(
      Object.entries(saleData).filter(([_, value]) => value !== undefined)
    );

    cleanSaleData.id = key;
    cleanSaleData.createdAt = new Date().toISOString();

    try {
      // Reduzir estoque automaticamente
      if (cleanSaleData.variantId) {
        await updateProductStock(cleanSaleData.productId, -cleanSaleData.quantity, cleanSaleData.variantId);
      } else {
        await updateProductStock(cleanSaleData.productId, -cleanSaleData.quantity);
      }
      
      // Salvar a venda
      await ref.child(key).update(cleanSaleData);
      resolve(true);
    } catch (err) {
      reject(err);
    }
  });
}

export async function saveDonation(donationData) {
  return new Promise((resolve, reject) => {
    const ref = db.ref("resources/donations");
    const key = ref.push().key;

    if (!key) {
      return reject(new Error("Falha ao gerar chave para a doação."));
    }

    // Limpar campos undefined antes de salvar
    const cleanDonationData = Object.fromEntries(
      Object.entries(donationData).filter(([_, value]) => value !== undefined)
    );

    cleanDonationData.id = key;
    cleanDonationData.createdAt = new Date().toISOString();

    ref
      .child(key)
      .update(cleanDonationData)
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
    
    // Se for cancelamento, remove o registro
    if (status === "CANCELLED") {
      ref
        .remove()
        .then((snapshot) => {
          resolve(snapshot);
        })
        .catch((err) => {
          reject(err);
        });
      return;
    }
    
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
    
    // Se for cancelamento, remove o registro
    if (status === "CANCELLED") {
      ref
        .remove()
        .then((snapshot) => {
          resolve(snapshot);
        })
        .catch((err) => {
          reject(err);
        });
      return;
    }
    
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

// Funções para gerenciar produtos
export async function saveProduct(productData) {
  return new Promise((resolve, reject) => {
    const ref = db.ref("resources/products");
    const key = ref.push().key;

    if (!key) {
      return reject(new Error("Falha ao gerar chave para o produto."));
    }

    // Limpar campos undefined antes de salvar
    const cleanProductData = Object.fromEntries(
      Object.entries(productData).filter(([_, value]) => value !== undefined)
    );

    cleanProductData.id = key;

    ref
      .child(key)
      .update(cleanProductData)
      .then((snapshot) => {
        resolve(snapshot);
      })
      .catch((err) => {
        reject(err);
      });
  });
}

export async function updateProduct(productId, productData) {
  return new Promise((resolve, reject) => {
    const ref = db.ref(`resources/products/${productId}`);
    
    // Limpar campos undefined antes de salvar
    const cleanProductData = Object.fromEntries(
      Object.entries(productData).filter(([_, value]) => value !== undefined)
    );
    
    ref
      .update(cleanProductData)
      .then((snapshot) => {
        resolve(snapshot);
      })
      .catch((err) => {
        reject(err);
      });
  });
}

export async function deleteProduct(productId) {
  return new Promise((resolve, reject) => {
    const ref = db.ref(`resources/products/${productId}`);
    
    ref
      .remove()
      .then((snapshot) => {
        resolve(snapshot);
      })
      .catch((err) => {
        reject(err);
      });
  });
}

export async function updateProductStock(productId, stockChange, variantId = null) {
  return new Promise((resolve, reject) => {
    const ref = variantId 
      ? db.ref(`resources/products/${productId}/variants`)
      : db.ref(`resources/products/${productId}`);
    
    if (variantId) {
      // Atualizar estoque de variante específica
      ref.once('value', (snapshot) => {
        const variants = snapshot.val() || [];
        const variantIndex = variants.findIndex(v => v.id === variantId);
        
        if (variantIndex !== -1) {
          const currentStock = variants[variantIndex].stock || 0;
          const newStock = Math.max(0, currentStock + stockChange);
          variants[variantIndex].stock = newStock;
          ref.set(variants)
            .then(resolve)
            .catch(reject);
        } else {
          reject(new Error('Variante não encontrada'));
        }
      });
    } else {
      // Atualizar estoque do produto principal
      const productRef = db.ref(`resources/products/${productId}`);
      productRef.once('value', (snapshot) => {
        const product = snapshot.val();
        if (product) {
          const currentStock = product.stock || 0;
          const newStock = Math.max(0, currentStock + stockChange);
          productRef.update({ stock: newStock })
            .then(resolve)
            .catch(reject);
        } else {
          reject(new Error('Produto não encontrado'));
        }
      });
    }
  });
}

// Funções para o sistema Bota pra Rodar
export async function getBicicletas() {
  const ref = db.ref("bicicletas");
  const snapshot = await ref.once("value");
  return snapshot.val();
}

export async function getEmprestimosBicicletas() {
  const ref = db.ref("emprestimos_bicicletas");
  const snapshot = await ref.once("value");
  return snapshot.val();
}

export async function getSolicitacoesBicicletas() {
  const ref = db.ref("solicitacoes_bicicletas");
  const snapshot = await ref.once("value");
  return snapshot.val();
}

export async function cadastrarBicicleta(dadosBicicleta) {
  return new Promise((resolve, reject) => {
    const ref = db.ref("bicicletas");
    const key = dadosBicicleta.codigo;

    if (!key) {
      return reject(new Error("Código da bicicleta é obrigatório."));
    }

    ref
      .child(key)
      .update(dadosBicicleta)
      .then((snapshot) => {
        resolve(snapshot);
      })
      .catch((err) => {
        reject(err);
      });
  });
}

export async function solicitarEmprestimoBicicleta(userId, codigoBicicleta) {
  return new Promise((resolve, reject) => {
    const ref = db.ref("solicitacoes_bicicletas");
    const key = ref.push().key;

    if (!key) {
      return reject(new Error("Falha ao gerar chave para a solicitação."));
    }

    const solicitacao = {
      id: key,
      usuario_id: userId,
      codigo_bicicleta: codigoBicicleta,
      data_solicitacao: new Date().toISOString().split('T')[0],
      status: 'pendente'
    };

    ref
      .child(key)
      .update(solicitacao)
      .then((snapshot) => {
        resolve(snapshot);
      })
      .catch((err) => {
        reject(err);
      });
  });
}

export async function aprovarSolicitacaoBicicleta(solicitacaoId, userId, codigoBicicleta, direto = false) {
  return new Promise(async (resolve, reject) => {
    try {
      if (!direto) {
        // Buscar dados da solicitação
        const solicitacaoRef = db.ref(`solicitacoes_bicicletas/${solicitacaoId}`);
        const solicitacaoSnapshot = await solicitacaoRef.once("value");
        const solicitacao = solicitacaoSnapshot.val();
        
        if (!solicitacao) {
          return reject(new Error("Solicitação não encontrada."));
        }
        
        userId = solicitacao.usuario_id;
        codigoBicicleta = solicitacao.codigo_bicicleta;
        
        // Atualizar status da solicitação
        await solicitacaoRef.update({ status: 'aprovada' });
      }
      
      // Criar empréstimo
      const emprestimoRef = db.ref("emprestimos_bicicletas");
      const emprestimoKey = emprestimoRef.push().key;
      
      const emprestimo = {
        id: emprestimoKey,
        usuario_id: userId,
        codigo_bicicleta: codigoBicicleta,
        data_saida: new Date().toISOString().split('T')[0],
        status: 'emprestado'
      };
      
      await emprestimoRef.child(emprestimoKey).update(emprestimo);
      
      // Atualizar disponibilidade da bicicleta
      const bicicletaRef = db.ref(`bicicletas/${codigoBicicleta}`);
      await bicicletaRef.update({ disponivel: false, emprestada: true });
      
      resolve(true);
    } catch (err) {
      reject(err);
    }
  });
}

export async function rejeitarSolicitacaoBicicleta(solicitacaoId) {
  return new Promise((resolve, reject) => {
    const ref = db.ref(`solicitacoes_bicicletas/${solicitacaoId}`);
    
    ref
      .update({ status: 'rejeitada' })
      .then((snapshot) => {
        resolve(snapshot);
      })
      .catch((err) => {
        reject(err);
      });
  });
}

export async function registrarDevolucaoBicicleta(emprestimoId) {
  return new Promise(async (resolve, reject) => {
    try {
      // Buscar dados do empréstimo
      const emprestimoRef = db.ref(`emprestimos_bicicletas/${emprestimoId}`);
      const emprestimoSnapshot = await emprestimoRef.once("value");
      const emprestimo = emprestimoSnapshot.val();
      
      if (!emprestimo) {
        return reject(new Error("Empréstimo não encontrado."));
      }
      
      // Atualizar status do empréstimo
      await emprestimoRef.update({ 
        status: 'devolvido',
        data_devolucao: new Date().toISOString().split('T')[0]
      });
      
      // Atualizar disponibilidade da bicicleta
      const bicicletaRef = db.ref(`bicicletas/${emprestimo.codigo_bicicleta}`);
      await bicicletaRef.update({ disponivel: true, emprestada: false });
      
      resolve(true);
    } catch (err) {
      reject(err);
    }
  });
}
