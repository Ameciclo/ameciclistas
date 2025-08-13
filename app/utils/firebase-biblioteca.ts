import { getFirestore, collection, doc, setDoc, getDoc, updateDoc, addDoc, query, where, getDocs } from "firebase/firestore";
import type { Emprestimo, SolicitacaoEmprestimo, UsuarioComDados } from "./types";

const db = getFirestore();

// Coleções do Firestore
const COLLECTIONS = {
  EMPRESTIMOS: "biblioteca_emprestimos",
  SOLICITACOES: "biblioteca_solicitacoes",
  USUARIOS: "subscribers"
};

// Funções para empréstimos
export async function criarEmprestimo(emprestimo: Omit<Emprestimo, 'id'>): Promise<string> {
  const docRef = await addDoc(collection(db, COLLECTIONS.EMPRESTIMOS), {
    ...emprestimo,
    created_at: new Date().toISOString()
  });
  return docRef.id;
}

export async function buscarEmprestimosAtivos(): Promise<Emprestimo[]> {
  const q = query(
    collection(db, COLLECTIONS.EMPRESTIMOS),
    where("status", "==", "emprestado")
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as Emprestimo));
}

export async function registrarDevolucao(emprestimoId: string): Promise<void> {
  const docRef = doc(db, COLLECTIONS.EMPRESTIMOS, emprestimoId);
  await updateDoc(docRef, {
    status: "devolvido",
    data_devolucao: new Date().toISOString().split('T')[0],
    updated_at: new Date().toISOString()
  });
}

// Funções para solicitações
export async function criarSolicitacao(solicitacao: Omit<SolicitacaoEmprestimo, 'id'>): Promise<string> {
  const docRef = await addDoc(collection(db, COLLECTIONS.SOLICITACOES), {
    ...solicitacao,
    created_at: new Date().toISOString()
  });
  return docRef.id;
}

export async function buscarSolicitacoesPendentes(): Promise<SolicitacaoEmprestimo[]> {
  const q = query(
    collection(db, COLLECTIONS.SOLICITACOES),
    where("status", "==", "pendente")
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as SolicitacaoEmprestimo));
}

export async function aprovarSolicitacao(solicitacaoId: string): Promise<void> {
  const docRef = doc(db, COLLECTIONS.SOLICITACOES, solicitacaoId);
  await updateDoc(docRef, {
    status: "aprovada",
    updated_at: new Date().toISOString()
  });
}

// Funções para usuários
export async function buscarUsuario(userId: number): Promise<UsuarioComDados | null> {
  const docRef = doc(db, COLLECTIONS.USUARIOS, userId.toString());
  const docSnap = await getDoc(docRef);
  
  if (docSnap.exists()) {
    return { id: userId, ...docSnap.data() } as UsuarioComDados;
  }
  return null;
}

export async function atualizarDadosUsuario(userId: number, personalData: { cpf?: string; telefone?: string }): Promise<void> {
  const docRef = doc(db, COLLECTIONS.USUARIOS, userId.toString());
  await updateDoc(docRef, {
    personal_data: personalData,
    updated_at: new Date().toISOString()
  });
}

// Verificar se usuário já tem dados pessoais
export async function verificarDadosUsuario(userId: number): Promise<boolean> {
  const usuario = await buscarUsuario(userId);
  return !!(usuario?.personal_data?.cpf || usuario?.personal_data?.telefone);
}

// Funções para buscar dados da biblioteca do Firebase Realtime Database
import db from "~/api/firebaseAdmin.server";

export async function buscarBibliotecaFirebase(): Promise<any[]> {
  try {
    const ref = db.ref("library");
    const snapshot = await ref.once("value");
    const data = snapshot.val();
    
    if (!data) return [];
    
    // Converter objeto para array
    return Object.keys(data).map(key => ({
      id: key,
      ...data[key]
    }));
  } catch (error) {
    console.error("Erro ao buscar biblioteca:", error);
    return [];
  }
}

export async function buscarTodosEmprestimosFirebase(): Promise<any[]> {
  try {
    const ref = db.ref("loan_record");
    const snapshot = await ref.once("value");
    const data = snapshot.val();
    
    if (!data) return [];
    
    // Converter objeto para array
    return Object.keys(data).map(key => ({
      id: key,
      ...data[key]
    }));
  } catch (error) {
    console.error("Erro ao buscar empréstimos:", error);
    return [];
  }
}